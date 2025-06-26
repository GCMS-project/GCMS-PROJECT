const express = require('express');
const router = express.Router();
const { Payment, User } = require('../models');
const { 
  generatePaymentId, 
  generateInvoiceNumber, 
  generateReceiptNumber,
  calculateVAT,
  calculateTotalWithVAT,
  formatCurrency
} = require('../utils/notificationUtils');
const { requireRole } = require('../middlewares/auth');

// Get user payments
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, status, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      [sequelize.Op.or]: [
        { payerId: req.user.id },
        { payeeId: req.user.id }
      ]
    };

    if (status) whereClause.paymentStatus = status;
    if (type) whereClause.type = type;

    const payments = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'payee', attributes: ['id', 'name', 'email'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        payments: payments.rows,
        total: payments.count,
        page: parseInt(page),
        totalPages: Math.ceil(payments.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// Get payment by ID
router.get('/:id', async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.id,
        [sequelize.Op.or]: [
          { payerId: req.user.id },
          { payeeId: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'payee', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    res.json({
      success: true,
      data: payment
    });
  } catch (error) {
    console.error('Error fetching payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment'
    });
  }
});

// Create payment
router.post('/', async (req, res) => {
  try {
    const {
      type,
      amount,
      paymentMethod,
      payeeId,
      relatedEntityId,
      relatedEntityType,
      description,
      phoneNumber,
      bankAccount,
      bankName
    } = req.body;

    // Validate required fields
    if (!type || !amount || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Type, amount, and payment method are required'
      });
    }

    // Calculate VAT and total
    const vatAmount = calculateVAT(amount);
    const totalAmount = calculateTotalWithVAT(amount);

    // Generate payment ID and invoice number
    const paymentId = generatePaymentId();
    const invoiceNumber = generateInvoiceNumber();

    const payment = await Payment.create({
      paymentId,
      type,
      amount,
      vatAmount,
      totalAmount,
      currency: 'TZS',
      paymentMethod,
      paymentStatus: 'PENDING',
      payerId: req.user.id,
      payerType: req.user.role,
      payeeId,
      payeeType: payeeId ? 'SERVICE_PROVIDER' : 'SYSTEM',
      relatedEntityId,
      relatedEntityType,
      invoiceNumber,
      description,
      phoneNumber,
      bankAccount,
      bankName,
      isAutomated: false,
      triggerType: 'MANUAL'
    });

    // Process payment based on method
    await processPayment(payment);

    res.status(201).json({
      success: true,
      message: 'Payment created successfully',
      data: payment
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create payment'
    });
  }
});

// Process M-Pesa payment
router.post('/mpesa/process', async (req, res) => {
  try {
    const { phoneNumber, amount, description } = req.body;

    // Validate phone number
    if (!phoneNumber || !phoneNumber.startsWith('+255')) {
      return res.status(400).json({
        success: false,
        message: 'Valid Tanzania phone number required (+255xxxxxxxxx)'
      });
    }

    // Calculate VAT and total
    const vatAmount = calculateVAT(amount);
    const totalAmount = calculateTotalWithVAT(amount);

    const payment = await Payment.create({
      paymentId: generatePaymentId(),
      type: 'PICKUP_PAYMENT',
      amount,
      vatAmount,
      totalAmount,
      currency: 'TZS',
      paymentMethod: 'M_PESA',
      paymentStatus: 'PROCESSING',
      payerId: req.user.id,
      payerType: req.user.role,
      phoneNumber,
      description,
      isAutomated: false,
      triggerType: 'MANUAL'
    });

    // Simulate M-Pesa API call
    const mpesaResponse = await simulateMpesaPayment(payment);

    if (mpesaResponse.success) {
      await payment.update({
        paymentStatus: 'COMPLETED',
        mpesaTransactionId: mpesaResponse.transactionId,
        processedAt: new Date(),
        completedAt: new Date()
      });

      // Generate receipt
      const receiptNumber = generateReceiptNumber();
      await payment.update({ receiptNumber });

      res.json({
        success: true,
        message: 'M-Pesa payment processed successfully',
        data: {
          ...payment.toJSON(),
          mpesaTransactionId: mpesaResponse.transactionId,
          receiptNumber
        }
      });
    } else {
      await payment.update({
        paymentStatus: 'FAILED',
        failureReason: mpesaResponse.error
      });

      res.status(400).json({
        success: false,
        message: 'M-Pesa payment failed',
        error: mpesaResponse.error
      });
    }
  } catch (error) {
    console.error('Error processing M-Pesa payment:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process M-Pesa payment'
    });
  }
});

// Process bank transfer
router.post('/bank/process', async (req, res) => {
  try {
    const { bankAccount, bankName, amount, description } = req.body;

    if (!bankAccount || !bankName) {
      return res.status(400).json({
        success: false,
        message: 'Bank account and bank name are required'
      });
    }

    // Calculate VAT and total
    const vatAmount = calculateVAT(amount);
    const totalAmount = calculateTotalWithVAT(amount);

    const payment = await Payment.create({
      paymentId: generatePaymentId(),
      type: 'PICKUP_PAYMENT',
      amount,
      vatAmount,
      totalAmount,
      currency: 'TZS',
      paymentMethod: 'BANK_TRANSFER',
      paymentStatus: 'PENDING',
      payerId: req.user.id,
      payerType: req.user.role,
      bankAccount,
      bankName,
      description,
      isAutomated: false,
      triggerType: 'MANUAL'
    });

    // Generate bank transfer instructions
    const transferInstructions = generateBankTransferInstructions(payment);

    res.json({
      success: true,
      message: 'Bank transfer payment created',
      data: {
        ...payment.toJSON(),
        transferInstructions
      }
    });
  } catch (error) {
    console.error('Error processing bank transfer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process bank transfer'
    });
  }
});

// Confirm bank transfer
router.post('/bank/confirm/:paymentId', async (req, res) => {
  try {
    const { transactionId, confirmationCode } = req.body;

    const payment = await Payment.findOne({
      where: {
        paymentId: req.params.paymentId,
        payerId: req.user.id,
        paymentMethod: 'BANK_TRANSFER'
      }
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    if (payment.paymentStatus !== 'PENDING') {
      return res.status(400).json({
        success: false,
        message: 'Payment is not in pending status'
      });
    }

    // Verify bank transfer (simulated)
    const verificationResult = await verifyBankTransfer(transactionId, confirmationCode);

    if (verificationResult.success) {
      await payment.update({
        paymentStatus: 'COMPLETED',
        bankTransactionId: transactionId,
        processedAt: new Date(),
        completedAt: new Date(),
        receiptNumber: generateReceiptNumber()
      });

      res.json({
        success: true,
        message: 'Bank transfer confirmed successfully',
        data: payment
      });
    } else {
      await payment.update({
        paymentStatus: 'FAILED',
        failureReason: verificationResult.error
      });

      res.status(400).json({
        success: false,
        message: 'Bank transfer verification failed',
        error: verificationResult.error
      });
    }
  } catch (error) {
    console.error('Error confirming bank transfer:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to confirm bank transfer'
    });
  }
});

// Get payment invoice
router.get('/:id/invoice', async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.id,
        [sequelize.Op.or]: [
          { payerId: req.user.id },
          { payeeId: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email', 'phoneNumber'] },
        { model: User, as: 'payee', attributes: ['id', 'name', 'email', 'phoneNumber'] }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found'
      });
    }

    const invoice = generateInvoice(payment);

    res.json({
      success: true,
      data: invoice
    });
  } catch (error) {
    console.error('Error generating invoice:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate invoice'
    });
  }
});

// Get payment receipt
router.get('/:id/receipt', async (req, res) => {
  try {
    const payment = await Payment.findOne({
      where: {
        id: req.params.id,
        paymentStatus: 'COMPLETED',
        [sequelize.Op.or]: [
          { payerId: req.user.id },
          { payeeId: req.user.id }
        ]
      },
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email'] },
        { model: User, as: 'payee', attributes: ['id', 'name', 'email'] }
      ]
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment receipt not found'
      });
    }

    const receipt = generateReceipt(payment);

    res.json({
      success: true,
      data: receipt
    });
  } catch (error) {
    console.error('Error generating receipt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate receipt'
    });
  }
});

// Admin: Get all payments
router.get('/admin/all', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 50, status, type, paymentMethod } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) whereClause.paymentStatus = status;
    if (type) whereClause.type = type;
    if (paymentMethod) whereClause.paymentMethod = paymentMethod;

    const payments = await Payment.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'payer', attributes: ['id', 'name', 'email', 'role'] },
        { model: User, as: 'payee', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      data: {
        payments: payments.rows,
        total: payments.count,
        page: parseInt(page),
        totalPages: Math.ceil(payments.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all payments:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payments'
    });
  }
});

// Helper functions
async function processPayment(payment) {
  // This would integrate with actual payment gateways
  console.log(`Processing payment ${payment.paymentId} via ${payment.paymentMethod}`);
}

async function simulateMpesaPayment(payment) {
  // Simulate M-Pesa API response
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        resolve({
          success: true,
          transactionId: `MPESA${Date.now()}${Math.random().toString(36).substr(2, 9).toUpperCase()}`
        });
      } else {
        resolve({
          success: false,
          error: 'Insufficient funds'
        });
      }
    }, 2000);
  });
}

function generateBankTransferInstructions(payment) {
  return {
    bankName: payment.bankName,
    accountNumber: payment.bankAccount,
    accountName: 'GCMS System',
    amount: formatCurrency(payment.totalAmount),
    reference: payment.paymentId,
    instructions: 'Please include the payment reference in your transfer description'
  };
}

async function verifyBankTransfer(transactionId, confirmationCode) {
  // Simulate bank transfer verification
  return new Promise((resolve) => {
    setTimeout(() => {
      const success = Math.random() > 0.05; // 95% success rate
      if (success) {
        resolve({ success: true });
      } else {
        resolve({
          success: false,
          error: 'Invalid confirmation code'
        });
      }
    }, 1000);
  });
}

function generateInvoice(payment) {
  return {
    invoiceNumber: payment.invoiceNumber,
    date: payment.createdAt,
    dueDate: new Date(payment.createdAt.getTime() + 7 * 24 * 60 * 60 * 1000), // 7 days
    payer: payment.payer,
    payee: payment.payee,
    items: [
      {
        description: payment.description || 'Garbage Collection Service',
        quantity: 1,
        unitPrice: formatCurrency(payment.amount),
        total: formatCurrency(payment.amount)
      }
    ],
    subtotal: formatCurrency(payment.amount),
    vat: formatCurrency(payment.vatAmount),
    total: formatCurrency(payment.totalAmount),
    paymentMethod: payment.paymentMethod,
    status: payment.paymentStatus
  };
}

function generateReceipt(payment) {
  return {
    receiptNumber: payment.receiptNumber,
    date: payment.completedAt,
    payer: payment.payer,
    payee: payment.payee,
    description: payment.description || 'Garbage Collection Service',
    amount: formatCurrency(payment.amount),
    vat: formatCurrency(payment.vatAmount),
    total: formatCurrency(payment.totalAmount),
    paymentMethod: payment.paymentMethod,
    transactionId: payment.mpesaTransactionId || payment.bankTransactionId,
    status: payment.paymentStatus
  };
}

module.exports = router; 
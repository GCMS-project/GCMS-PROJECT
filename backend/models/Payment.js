const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Payment = sequelize.define('Payment', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  paymentId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('PICKUP_PAYMENT', 'TENDER_PAYMENT', 'SERVICE_PAYMENT', 'REFUND', 'ADJUSTMENT'),
    allowNull: false
  },
  amount: {
    type: DataTypes.DECIMAL(12, 2), // Base amount in TZS
    allowNull: false
  },
  vatAmount: {
    type: DataTypes.DECIMAL(12, 2), // VAT amount (18%)
    allowNull: false
  },
  totalAmount: {
    type: DataTypes.DECIMAL(12, 2), // Total including VAT
    allowNull: false
  },
  currency: {
    type: DataTypes.STRING,
    defaultValue: 'TZS'
  },
  paymentMethod: {
    type: DataTypes.ENUM('M_PESA', 'AIRTEL_MONEY', 'TIGO_PESA', 'HALOPESA', 'BANK_TRANSFER', 'CASH'),
    allowNull: false
  },
  paymentStatus: {
    type: DataTypes.ENUM('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'CANCELLED', 'REFUNDED'),
    defaultValue: 'PENDING'
  },
  payerId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  payerType: {
    type: DataTypes.ENUM('USER', 'SERVICE_PROVIDER', 'SYSTEM'),
    allowNull: false
  },
  payeeId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  payeeType: {
    type: DataTypes.ENUM('SERVICE_PROVIDER', 'SYSTEM', 'USER'),
    allowNull: true
  },
  relatedEntityId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  relatedEntityType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  mpesaTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankTransactionId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankAccount: {
    type: DataTypes.STRING,
    allowNull: true
  },
  bankName: {
    type: DataTypes.STRING,
    allowNull: true
  },
  invoiceNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  receiptNumber: {
    type: DataTypes.STRING,
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON, // Additional payment data
    defaultValue: {}
  },
  processedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  completedAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  failureReason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  retryCount: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  maxRetries: {
    type: DataTypes.INTEGER,
    defaultValue: 3
  },
  isAutomated: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  triggerType: {
    type: DataTypes.ENUM('DUMP_VERIFICATION', 'SERVICE_COMPLETION', 'MANUAL', 'SCHEDULED'),
    allowNull: true
  },
  vatRate: {
    type: DataTypes.DECIMAL(5, 2),
    defaultValue: 18.00
  },
  taxCertificate: {
    type: DataTypes.STRING,
    allowNull: true
  },
  complianceStatus: {
    type: DataTypes.JSON, // Compliance tracking
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'payments'
});

module.exports = Payment; 
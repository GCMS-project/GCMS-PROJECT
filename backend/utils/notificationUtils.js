const crypto = require('crypto');

/**
 * Generate unique notification ID
 */
function generateNotificationId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `NOTIF-${timestamp.slice(-8)}-${random.toUpperCase()}`;
}

/**
 * Generate unique payment ID
 */
function generatePaymentId() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(4).toString('hex');
  return `PAY-${timestamp.slice(-8)}-${random.toUpperCase()}`;
}

/**
 * Generate invoice number
 */
function generateInvoiceNumber() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(2).toString('hex');
  return `INV-${timestamp.slice(-6)}-${random.toUpperCase()}`;
}

/**
 * Generate receipt number
 */
function generateReceiptNumber() {
  const timestamp = Date.now().toString();
  const random = crypto.randomBytes(2).toString('hex');
  return `RCPT-${timestamp.slice(-6)}-${random.toUpperCase()}`;
}

/**
 * Calculate VAT amount
 */
function calculateVAT(amount, vatRate = 18) {
  return (amount * vatRate) / 100;
}

/**
 * Calculate total amount with VAT
 */
function calculateTotalWithVAT(amount, vatRate = 18) {
  const vatAmount = calculateVAT(amount, vatRate);
  return amount + vatAmount;
}

/**
 * Format currency for Tanzania
 */
function formatCurrency(amount) {
  return new Intl.NumberFormat('en-TZ', {
    style: 'currency',
    currency: 'TZS',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}

/**
 * Get notification template by type
 */
function getNotificationTemplate(type) {
  const templates = {
    'TENDER_CREATION': {
      title: 'New Tender Available',
      message: 'A new garbage collection tender has been generated in your area.',
      priority: 'NORMAL',
      channels: ['email', 'sms', 'dashboard']
    },
    'TENDER_AWARD': {
      title: 'Tender Awarded',
      message: 'Congratulations! Your bid has been accepted for the tender.',
      priority: 'HIGH',
      channels: ['email', 'sms', 'whatsapp', 'dashboard']
    },
    'ROUTE_ASSIGNMENT': {
      title: 'Route Assigned',
      message: 'A new route has been assigned to you for garbage collection.',
      priority: 'NORMAL',
      channels: ['email', 'sms', 'dashboard']
    },
    'PICKUP_STATUS': {
      title: 'Pickup Status Update',
      message: 'Your pickup request status has been updated.',
      priority: 'NORMAL',
      channels: ['email', 'sms', 'dashboard']
    },
    'DUMP_ARRIVAL': {
      title: 'Vehicle Arrived at Dump Site',
      message: 'A vehicle has arrived at the dump site for verification.',
      priority: 'HIGH',
      channels: ['email', 'sms', 'dashboard']
    },
    'DUMP_VERIFICATION': {
      title: 'Dump Verification Required',
      message: 'Please verify the dump has been completed at the designated site.',
      priority: 'HIGH',
      channels: ['email', 'sms', 'whatsapp', 'dashboard']
    },
    'PAYMENT_PROCESSING': {
      title: 'Payment Processing',
      message: 'Your payment is being processed. You will receive confirmation shortly.',
      priority: 'NORMAL',
      channels: ['email', 'sms', 'dashboard']
    },
    'PAYMENT_COMPLETION': {
      title: 'Payment Completed',
      message: 'Your payment has been successfully processed.',
      priority: 'HIGH',
      channels: ['email', 'sms', 'whatsapp', 'dashboard']
    },
    'EMERGENCY_ALERT': {
      title: 'Emergency Alert',
      message: 'An emergency situation has been reported. Immediate attention required.',
      priority: 'URGENT',
      channels: ['email', 'sms', 'whatsapp', 'dashboard']
    },
    'SYSTEM_ALERT': {
      title: 'System Alert',
      message: 'A system alert has been triggered. Please check your dashboard.',
      priority: 'HIGH',
      channels: ['email', 'dashboard']
    }
  };

  return templates[type] || {
    title: 'Notification',
    message: 'You have received a new notification.',
    priority: 'NORMAL',
    channels: ['dashboard']
  };
}

/**
 * Validate phone number for Tanzania
 */
function validateTanzaniaPhoneNumber(phoneNumber) {
  // Remove any non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // Tanzania phone number patterns
  const patterns = [
    /^255[0-9]{9}$/,  // International format
    /^0[0-9]{9}$/,    // Local format
    /^\+255[0-9]{9}$/ // International format with +
  ];
  
  return patterns.some(pattern => pattern.test(cleaned));
}

/**
 * Format phone number for Tanzania
 */
function formatTanzaniaPhoneNumber(phoneNumber) {
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  if (cleaned.startsWith('255')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+255${cleaned.slice(1)}`;
  } else if (cleaned.length === 9) {
    return `+255${cleaned}`;
  }
  
  return phoneNumber; // Return as is if can't format
}

/**
 * Validate email address
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Sanitize message for SMS
 */
function sanitizeSMSMessage(message, maxLength = 160) {
  // Remove HTML tags
  let sanitized = message.replace(/<[^>]*>/g, '');
  
  // Truncate if too long
  if (sanitized.length > maxLength) {
    sanitized = sanitized.substring(0, maxLength - 3) + '...';
  }
  
  return sanitized;
}

/**
 * Generate notification summary
 */
function generateNotificationSummary(notifications) {
  const summary = {
    total: notifications.length,
    unread: notifications.filter(n => !n.dashboardRead).length,
    byType: {},
    byPriority: {
      URGENT: 0,
      HIGH: 0,
      NORMAL: 0,
      LOW: 0
    }
  };

  notifications.forEach(notification => {
    // Count by type
    summary.byType[notification.type] = (summary.byType[notification.type] || 0) + 1;
    
    // Count by priority
    summary.byPriority[notification.priority]++;
  });

  return summary;
}

/**
 * Check if notification should be sent based on user preferences
 */
function shouldSendNotification(user, notificationType, channel) {
  // Check if user has notification preferences
  if (!user.notificationPreferences) {
    return true; // Default to sending if no preferences set
  }

  const preferences = user.notificationPreferences;
  
  // Check if notification type is enabled
  if (preferences.disabledTypes && preferences.disabledTypes.includes(notificationType)) {
    return false;
  }
  
  // Check if channel is enabled
  if (preferences.disabledChannels && preferences.disabledChannels.includes(channel)) {
    return false;
  }
  
  // Check quiet hours
  if (preferences.quietHours) {
    const now = new Date();
    const hour = now.getHours();
    const { start, end } = preferences.quietHours;
    
    if (hour >= start && hour <= end) {
      return false;
    }
  }
  
  return true;
}

/**
 * Get notification priority color
 */
function getPriorityColor(priority) {
  const colors = {
    URGENT: '#e74c3c',
    HIGH: '#f39c12',
    NORMAL: '#3498db',
    LOW: '#95a5a6'
  };
  
  return colors[priority] || colors.NORMAL;
}

/**
 * Format notification for API response
 */
function formatNotificationForResponse(notification) {
  return {
    id: notification.id,
    notificationId: notification.notificationId,
    type: notification.type,
    priority: notification.priority,
    title: notification.title,
    message: notification.message,
    channels: notification.channels,
    status: notification.status,
    dashboardRead: notification.dashboardRead,
    readAt: notification.readAt,
    createdAt: notification.createdAt,
    metadata: notification.metadata,
    relatedEntityId: notification.relatedEntityId,
    relatedEntityType: notification.relatedEntityType
  };
}

module.exports = {
  generateNotificationId,
  generatePaymentId,
  generateInvoiceNumber,
  generateReceiptNumber,
  calculateVAT,
  calculateTotalWithVAT,
  formatCurrency,
  getNotificationTemplate,
  validateTanzaniaPhoneNumber,
  formatTanzaniaPhoneNumber,
  validateEmail,
  sanitizeSMSMessage,
  generateNotificationSummary,
  shouldSendNotification,
  getPriorityColor,
  formatNotificationForResponse
}; 
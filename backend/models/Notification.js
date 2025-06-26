const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  notificationId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  type: {
    type: DataTypes.ENUM('TENDER_CREATION', 'TENDER_AWARD', 'ROUTE_ASSIGNMENT', 'PICKUP_STATUS', 'DUMP_ARRIVAL', 'DUMP_VERIFICATION', 'PAYMENT_PROCESSING', 'PAYMENT_COMPLETION', 'EMERGENCY_ALERT', 'SYSTEM_ALERT'),
    allowNull: false
  },
  priority: {
    type: DataTypes.ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT'),
    defaultValue: 'NORMAL'
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  recipientId: {
    type: DataTypes.UUID,
    allowNull: false
  },
  recipientType: {
    type: DataTypes.ENUM('LEVEL_2_ADMIN', 'LEVEL_1_ADMIN', 'TENDER_SUPERVISOR', 'SERVICE_PROVIDER', 'DRIVER', 'USER', 'DUMP_VERIFIER'),
    allowNull: false
  },
  channels: {
    type: DataTypes.JSON, // Array of channels: ['email', 'sms', 'whatsapp', 'dashboard']
    allowNull: false
  },
  emailSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  emailSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  smsSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  smsSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  whatsappSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  whatsappSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dashboardSent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dashboardSentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  emailDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  smsDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  whatsappDelivered: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dashboardRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  readAt: {
    type: DataTypes.DATE,
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
  scheduledFor: {
    type: DataTypes.DATE,
    allowNull: true
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  deliveredAt: {
    type: DataTypes.DATE,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('PENDING', 'SENT', 'DELIVERED', 'READ', 'FAILED', 'CANCELLED'),
    defaultValue: 'PENDING'
  },
  errorMessage: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSON, // Additional data for the notification
    defaultValue: {}
  },
  relatedEntityId: {
    type: DataTypes.UUID,
    allowNull: true
  },
  relatedEntityType: {
    type: DataTypes.STRING,
    allowNull: true
  },
  templateId: {
    type: DataTypes.STRING,
    allowNull: true
  },
  templateData: {
    type: DataTypes.JSON, // Data for template rendering
    defaultValue: {}
  }
}, {
  timestamps: true,
  tableName: 'notifications'
});

module.exports = Notification; 
const { Notification, User } = require('../models');
const { generateNotificationId } = require('../utils/notificationUtils');

class NotificationService {
  constructor() {
    this.channels = {
      EMAIL: 'email',
      SMS: 'sms',
      WHATSAPP: 'whatsapp',
      DASHBOARD: 'dashboard'
    };
  }

  /**
   * Send notification to a user
   */
  async sendNotification(notificationData) {
    try {
      const notificationId = generateNotificationId();
      
      const notification = await Notification.create({
        notificationId,
        type: notificationData.type,
        priority: notificationData.priority || 'NORMAL',
        title: notificationData.title,
        message: notificationData.message,
        recipientId: notificationData.recipientId,
        recipientType: notificationData.recipientType,
        channels: notificationData.channels || ['dashboard'],
        metadata: notificationData.metadata || {},
        relatedEntityId: notificationData.relatedEntityId,
        relatedEntityType: notificationData.relatedEntityType,
        templateId: notificationData.templateId,
        templateData: notificationData.templateData || {}
      });

      // Send through each channel
      for (const channel of notificationData.channels) {
        await this.sendThroughChannel(notification, channel);
      }

      return notification;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification through specific channel
   */
  async sendThroughChannel(notification, channel) {
    try {
      switch (channel) {
        case this.channels.EMAIL:
          await this.sendEmail(notification);
          break;
        case this.channels.SMS:
          await this.sendSMS(notification);
          break;
        case this.channels.WHATSAPP:
          await this.sendWhatsApp(notification);
          break;
        case this.channels.DASHBOARD:
          await this.sendDashboard(notification);
          break;
        default:
          console.warn(`Unknown notification channel: ${channel}`);
      }
    } catch (error) {
      console.error(`Error sending notification through ${channel}:`, error);
      await this.handleChannelError(notification, channel, error);
    }
  }

  /**
   * Send email notification
   */
  async sendEmail(notification) {
    try {
      const recipient = await User.findByPk(notification.recipientId);
      if (!recipient || !recipient.email) {
        throw new Error('Recipient not found or no email address');
      }

      // Here you would integrate with your email service (SendGrid, AWS SES, etc.)
      const emailData = {
        to: recipient.email,
        subject: notification.title,
        html: this.generateEmailHTML(notification),
        text: notification.message
      };

      // Mock email sending
      console.log(`Sending email to ${recipient.email}:`, emailData.subject);
      
      // Update notification status
      await notification.update({
        emailSent: true,
        emailSentAt: new Date(),
        status: 'SENT'
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Send SMS notification
   */
  async sendSMS(notification) {
    try {
      const recipient = await User.findByPk(notification.recipientId);
      if (!recipient || !recipient.phoneNumber) {
        throw new Error('Recipient not found or no phone number');
      }

      // Here you would integrate with your SMS service (Twilio, AWS SNS, etc.)
      const smsData = {
        to: recipient.phoneNumber,
        message: notification.message
      };

      // Mock SMS sending
      console.log(`Sending SMS to ${recipient.phoneNumber}:`, smsData.message);
      
      // Update notification status
      await notification.update({
        smsSent: true,
        smsSentAt: new Date(),
        status: 'SENT'
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Send WhatsApp notification
   */
  async sendWhatsApp(notification) {
    try {
      const recipient = await User.findByPk(notification.recipientId);
      if (!recipient || !recipient.phoneNumber) {
        throw new Error('Recipient not found or no phone number');
      }

      // Here you would integrate with WhatsApp Business API
      const whatsappData = {
        to: recipient.phoneNumber,
        message: notification.message,
        template: this.getWhatsAppTemplate(notification.type)
      };

      // Mock WhatsApp sending
      console.log(`Sending WhatsApp to ${recipient.phoneNumber}:`, whatsappData.message);
      
      // Update notification status
      await notification.update({
        whatsappSent: true,
        whatsappSentAt: new Date(),
        status: 'SENT'
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Send dashboard notification
   */
  async sendDashboard(notification) {
    try {
      // Dashboard notifications are stored in the database
      // and retrieved by the frontend
      await notification.update({
        dashboardSent: true,
        dashboardSentAt: new Date(),
        status: 'SENT'
      });

    } catch (error) {
      throw error;
    }
  }

  /**
   * Generate email HTML content
   */
  generateEmailHTML(notification) {
    const template = this.getEmailTemplate(notification.type);
    return template
      .replace('{{title}}', notification.title)
      .replace('{{message}}', notification.message)
      .replace('{{timestamp}}', new Date().toLocaleString())
      .replace('{{actionUrl}}', this.getActionUrl(notification));
  }

  /**
   * Get email template for notification type
   */
  getEmailTemplate(type) {
    const templates = {
      'TENDER_CREATION': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2c3e50;">{{title}}</h2>
          <p>{{message}}</p>
          <p><strong>Time:</strong> {{timestamp}}</p>
          <a href="{{actionUrl}}" style="background-color: #3498db; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Tender</a>
        </div>
      `,
      'TENDER_AWARD': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #27ae60;">{{title}}</h2>
          <p>{{message}}</p>
          <p><strong>Time:</strong> {{timestamp}}</p>
          <a href="{{actionUrl}}" style="background-color: #27ae60; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Details</a>
        </div>
      `,
      'PAYMENT_COMPLETION': `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f39c12;">{{title}}</h2>
          <p>{{message}}</p>
          <p><strong>Time:</strong> {{timestamp}}</p>
          <a href="{{actionUrl}}" style="background-color: #f39c12; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">View Receipt</a>
        </div>
      `
    };

    return templates[type] || `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>{{title}}</h2>
        <p>{{message}}</p>
        <p><strong>Time:</strong> {{timestamp}}</p>
      </div>
    `;
  }

  /**
   * Get WhatsApp template for notification type
   */
  getWhatsAppTemplate(type) {
    const templates = {
      'TENDER_CREATION': 'tender_notification',
      'TENDER_AWARD': 'tender_award',
      'PAYMENT_COMPLETION': 'payment_confirmation',
      'EMERGENCY_ALERT': 'emergency_alert'
    };

    return templates[type] || 'general_notification';
  }

  /**
   * Get action URL for notification
   */
  getActionUrl(notification) {
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    switch (notification.type) {
      case 'TENDER_CREATION':
        return `${baseUrl}/tenders/${notification.metadata?.tenderId}`;
      case 'TENDER_AWARD':
        return `${baseUrl}/tenders/${notification.metadata?.tenderId}`;
      case 'PAYMENT_COMPLETION':
        return `${baseUrl}/payments/${notification.metadata?.paymentId}`;
      default:
        return `${baseUrl}/dashboard`;
    }
  }

  /**
   * Handle channel error
   */
  async handleChannelError(notification, channel, error) {
    const retryCount = notification.retryCount + 1;
    
    if (retryCount < notification.maxRetries) {
      // Schedule retry
      await notification.update({
        retryCount,
        errorMessage: error.message
      });
      
      // Schedule retry after exponential backoff
      const retryDelay = Math.pow(2, retryCount) * 1000; // 2^retryCount seconds
      setTimeout(() => {
        this.sendThroughChannel(notification, channel);
      }, retryDelay);
    } else {
      // Mark as failed
      await notification.update({
        status: 'FAILED',
        errorMessage: error.message
      });
    }
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: {
          notificationId,
          recipientId: userId
        }
      });

      if (notification) {
        await notification.update({
          dashboardRead: true,
          readAt: new Date(),
          status: 'READ'
        });
      }

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Get user notifications
   */
  async getUserNotifications(userId, options = {}) {
    try {
      const { page = 1, limit = 20, unreadOnly = false } = options;
      const offset = (page - 1) * limit;

      const whereClause = {
        recipientId: userId
      };

      if (unreadOnly) {
        whereClause.dashboardRead = false;
      }

      const notifications = await Notification.findAndCountAll({
        where: whereClause,
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        notifications: notifications.rows,
        total: notifications.count,
        page,
        totalPages: Math.ceil(notifications.count / limit)
      };
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Send bulk notifications
   */
  async sendBulkNotifications(notifications) {
    const results = [];
    
    for (const notificationData of notifications) {
      try {
        const notification = await this.sendNotification(notificationData);
        results.push({ success: true, notification });
      } catch (error) {
        results.push({ success: false, error: error.message });
      }
    }

    return results;
  }

  /**
   * Send notification to all users of a specific role
   */
  async sendNotificationToRole(role, notificationData) {
    try {
      const users = await User.findAll({
        where: {
          role,
          isActive: true
        }
      });

      const notifications = users.map(user => ({
        ...notificationData,
        recipientId: user.id,
        recipientType: role
      }));

      return await this.sendBulkNotifications(notifications);
    } catch (error) {
      console.error('Error sending notification to role:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService(); 
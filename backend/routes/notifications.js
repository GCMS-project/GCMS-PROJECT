const express = require('express');
const router = express.Router();
const { Notification, User } = require('../models');
const notificationService = require('../services/notificationService');
const { formatNotificationForResponse, generateNotificationSummary } = require('../utils/notificationUtils');
const { requireRole } = require('../middlewares/auth');

// Get user notifications
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false, type, priority } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {
      recipientId: req.user.id
    };

    if (unreadOnly === 'true') {
      whereClause.dashboardRead = false;
    }

    if (type) {
      whereClause.type = type;
    }

    if (priority) {
      whereClause.priority = priority;
    }

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const formattedNotifications = notifications.rows.map(notification => 
      formatNotificationForResponse(notification)
    );

    res.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        total: notifications.count,
        page: parseInt(page),
        totalPages: Math.ceil(notifications.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Get notification by ID
router.get('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        recipientId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      data: formatNotificationForResponse(notification)
    });
  } catch (error) {
    console.error('Error fetching notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification'
    });
  }
});

// Mark notification as read
router.post('/:id/read', async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.id);

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification marked as read',
      data: formatNotificationForResponse(notification)
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notification as read'
    });
  }
});

// Mark all notifications as read
router.post('/read-all', async (req, res) => {
  try {
    await Notification.update(
      { dashboardRead: true, readAt: new Date() },
      {
        where: {
          recipientId: req.user.id,
          dashboardRead: false
        }
      }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark notifications as read'
    });
  }
});

// Get notification summary
router.get('/summary/overview', async (req, res) => {
  try {
    const notifications = await Notification.findAll({
      where: {
        recipientId: req.user.id
      },
      order: [['createdAt', 'DESC']]
    });

    const summary = generateNotificationSummary(notifications);

    res.json({
      success: true,
      data: summary
    });
  } catch (error) {
    console.error('Error fetching notification summary:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification summary'
    });
  }
});

// Update notification preferences
router.put('/preferences', async (req, res) => {
  try {
    const { disabledTypes, disabledChannels, quietHours } = req.body;

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const preferences = {
      disabledTypes: disabledTypes || [],
      disabledChannels: disabledChannels || [],
      quietHours: quietHours || null
    };

    await user.update({
      notificationPreferences: preferences
    });

    res.json({
      success: true,
      message: 'Notification preferences updated successfully',
      data: preferences
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update notification preferences'
    });
  }
});

// Get notification preferences
router.get('/preferences', async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      data: user.notificationPreferences || {
        disabledTypes: [],
        disabledChannels: [],
        quietHours: null
      }
    });
  } catch (error) {
    console.error('Error fetching notification preferences:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification preferences'
    });
  }
});

// Delete notification
router.delete('/:id', async (req, res) => {
  try {
    const notification = await Notification.findOne({
      where: {
        id: req.params.id,
        recipientId: req.user.id
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    await notification.destroy();

    res.json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete notification'
    });
  }
});

// Admin: Get all notifications (for admins)
router.get('/admin/all', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const { page = 1, limit = 50, recipientType, status, type } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (recipientType) whereClause.recipientType = recipientType;
    if (status) whereClause.status = status;
    if (type) whereClause.type = type;

    const notifications = await Notification.findAndCountAll({
      where: whereClause,
      include: [
        { model: User, as: 'recipient', attributes: ['id', 'name', 'email', 'role'] }
      ],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    const formattedNotifications = notifications.rows.map(notification => 
      formatNotificationForResponse(notification)
    );

    res.json({
      success: true,
      data: {
        notifications: formattedNotifications,
        total: notifications.count,
        page: parseInt(page),
        totalPages: Math.ceil(notifications.count / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching all notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notifications'
    });
  }
});

// Admin: Send notification to user
router.post('/admin/send', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const { recipientId, type, title, message, channels, priority = 'NORMAL' } = req.body;

    // Validate recipient exists
    const recipient = await User.findByPk(recipientId);
    if (!recipient) {
      return res.status(400).json({
        success: false,
        message: 'Recipient not found'
      });
    }

    const notification = await notificationService.sendNotification({
      type,
      recipientId,
      recipientType: recipient.role,
      title,
      message,
      channels: channels || ['dashboard'],
      priority
    });

    res.status(201).json({
      success: true,
      message: 'Notification sent successfully',
      data: formatNotificationForResponse(notification)
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send notification'
    });
  }
});

// Admin: Send bulk notifications
router.post('/admin/send-bulk', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const { notifications } = req.body;

    if (!Array.isArray(notifications) || notifications.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Notifications array is required'
      });
    }

    const results = await notificationService.sendBulkNotifications(notifications);

    const successCount = results.filter(r => r.success).length;
    const failureCount = results.filter(r => !r.success).length;

    res.json({
      success: true,
      message: `Bulk notifications sent. Success: ${successCount}, Failed: ${failureCount}`,
      data: {
        total: notifications.length,
        success: successCount,
        failed: failureCount,
        results
      }
    });
  } catch (error) {
    console.error('Error sending bulk notifications:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send bulk notifications'
    });
  }
});

// Admin: Get notification statistics
router.get('/admin/stats', requireRole(['LEVEL_2_ADMIN', 'LEVEL_1_ADMIN']), async (req, res) => {
  try {
    const stats = await Notification.findAll({
      attributes: [
        'type',
        'priority',
        'status',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['type', 'priority', 'status']
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Error fetching notification statistics:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch notification statistics'
    });
  }
});

module.exports = router; 
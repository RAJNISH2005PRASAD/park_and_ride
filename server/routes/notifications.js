const express = require('express');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');
const router = express.Router();

// Temporary in-memory storage for demo purposes
const tempNotifications = new Map();

// Get user notifications
router.get('/', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const notifications = await Notification.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json(notifications);
    } catch (dbError) {
      // Fallback to in-memory storage with mock data
      const mockNotifications = [
        {
          _id: '1',
          user: req.user.id,
          title: 'Ride Completed',
          message: 'Your ride from Central Park to Times Square has been completed.',
          type: 'ride',
          isRead: false,
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000) // 2 hours ago
        },
        {
          _id: '2',
          user: req.user.id,
          title: 'Payment Successful',
          message: 'Payment of $25.50 for your ride has been processed successfully.',
          type: 'payment',
          isRead: true,
          createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000) // 4 hours ago
        },
        {
          _id: '3',
          user: req.user.id,
          title: 'Parking Spot Available',
          message: 'A parking spot is now available at Downtown Parking Lot.',
          type: 'parking',
          isRead: false,
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000) // 6 hours ago
        },
        {
          _id: '4',
          user: req.user.id,
          title: 'Welcome to Park & Ride',
          message: 'Thank you for joining Park & Ride! Enjoy your first ride.',
          type: 'welcome',
          isRead: true,
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000) // 1 day ago
        }
      ];
      
      // Store mock notifications in temp storage
      mockNotifications.forEach(notification => {
        tempNotifications.set(notification._id, notification);
      });
      
      const userNotifications = Array.from(tempNotifications.values())
        .filter(notification => notification.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return res.json(userNotifications);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Mark notification as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification || notification.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      notification.isRead = true;
      await notification.save();
      return res.json({ message: 'Notification marked as read', notification });
    } catch (dbError) {
      // Fallback to in-memory storage
      const notification = tempNotifications.get(req.params.id);
      if (!notification || notification.user !== req.user.id) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      notification.isRead = true;
      notification.updatedAt = new Date();
      tempNotifications.set(req.params.id, notification);
      return res.json({ message: 'Notification marked as read', notification });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete notification
router.delete('/:id', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const notification = await Notification.findById(req.params.id);
      if (!notification || notification.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      await notification.remove();
      return res.json({ message: 'Notification deleted' });
    } catch (dbError) {
      // Fallback to in-memory storage
      const notification = tempNotifications.get(req.params.id);
      if (!notification || notification.user !== req.user.id) {
        return res.status(404).json({ message: 'Notification not found' });
      }
      tempNotifications.delete(req.params.id);
      return res.json({ message: 'Notification deleted' });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get notification settings
router.get('/settings', auth, async (req, res) => {
  try {
    // Return mock notification settings
    const settings = {
      email: true,
      push: true,
      sms: false,
      rideUpdates: true,
      parkingUpdates: true,
      paymentUpdates: true,
      promotional: false
    };
    res.json(settings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update notification settings
router.put('/settings', auth, async (req, res) => {
  try {
    const settings = req.body;
    // In a real app, save to database
    res.json({ message: 'Settings updated', settings });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
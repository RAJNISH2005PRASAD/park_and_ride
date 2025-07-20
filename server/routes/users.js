const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const router = express.Router();

// Update profile
router.put('/profile', auth, [
  body('name').optional().notEmpty(),
  body('phone').optional().notEmpty(),
  body('dateOfBirth').optional(),
  body('address').optional(),
  body('avatar').optional(),
  body('rating').optional(),
  body('totalRides').optional(),
  body('totalParking').optional(),
  body('preferences').optional(),
  body('vehicles').optional(),
  body('paymentMethods').optional()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (req.body.name) user.name = req.body.name;
    if (req.body.phone) user.phone = req.body.phone;
    if (req.body.dateOfBirth !== undefined) user.dateOfBirth = req.body.dateOfBirth;
    if (req.body.address !== undefined) user.address = req.body.address;
    if (req.body.avatar !== undefined) user.avatar = req.body.avatar;
    if (req.body.rating !== undefined) user.rating = req.body.rating;
    if (req.body.totalRides !== undefined) user.totalRides = req.body.totalRides;
    if (req.body.totalParking !== undefined) user.totalParking = req.body.totalParking;
    if (req.body.preferences !== undefined) user.preferences = req.body.preferences;
    if (req.body.vehicles !== undefined) user.vehicles = req.body.vehicles;
    if (req.body.paymentMethods !== undefined) user.paymentMethods = req.body.paymentMethods;
    await user.save();
    res.json({ message: 'Profile updated', user });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Change password
router.put('/change-password', auth, [
  body('oldPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    const isMatch = await user.comparePassword(req.body.oldPassword);
    if (!isMatch) return res.status(400).json({ message: 'Old password incorrect' });
    user.password = req.body.newPassword;
    await user.save();
    res.json({ message: 'Password changed successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// User analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      loyaltyPoints: user.loyaltyPoints,
      subscriptions: user.subscriptions,
      createdAt: user.createdAt
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Vehicle management endpoints (mock implementation)
router.post('/vehicles', auth, async (req, res) => {
  try {
    const vehicleData = {
      id: Date.now().toString(),
      ...req.body,
      isDefault: false
    };
    res.status(201).json(vehicleData);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.delete('/vehicles/:id', auth, async (req, res) => {
  try {
    res.json({ message: 'Vehicle deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.patch('/vehicles/:id/default', auth, async (req, res) => {
  try {
    res.json({ message: 'Default vehicle updated' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Preferences endpoint (mock implementation)
router.put('/preferences', auth, async (req, res) => {
  try {
    res.json(req.body);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
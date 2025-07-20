const express = require('express');
const { body, validationResult } = require('express-validator');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

// Temporary in-memory storage for demo purposes
const tempUsers = new Map();

// Register
router.post('/register', [
  body('name').notEmpty(),
  body('email').isEmail(),
  body('password').isLength({ min: 6 })
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { name, email, password, phone } = req.body;
  
  try {
    // Try MongoDB first
    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });
    user = new User({ name, email, password, phone });
    await user.save();
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const [firstName, ...lastNameParts] = (user.name || '').split(' ');
    const lastName = lastNameParts.join(' ') || '';
    res.status(201).json({ token, user: { id: user._id, firstName, lastName, email: user.email, role: user.role } });
  } catch (err) {
    // Fallback to in-memory storage if MongoDB is not available
    if (tempUsers.has(email)) {
      return res.status(400).json({ message: 'User already exists' });
    }
    
    const userId = Date.now().toString();
    const userData = { id: userId, name, email, phone, role: 'user' };
    tempUsers.set(email, { ...userData, password });
    const [firstName, ...lastNameParts] = (name || '').split(' ');
    const lastName = lastNameParts.join(' ') || '';
    const token = jwt.sign({ id: userId, role: 'user' }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({ token, user: { id: userId, firstName, lastName, email, role: 'user' } });
  }
});

// Login
router.post('/login', [
  body('email').isEmail(),
  body('password').exists()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  
  const { email, password } = req.body;
  
  try {
    // Try MongoDB first
    const user = await User.findOne({ email });
    if (!user) {
      // Fallback to in-memory storage
      const tempUser = tempUsers.get(email);
      if (!tempUser || tempUser.password !== password) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
      const [firstName, ...lastNameParts] = (tempUser.name || '').split(' ');
      const lastName = lastNameParts.join(' ') || '';
      const token = jwt.sign({ id: tempUser.id, role: tempUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
      return res.json({ token, user: { id: tempUser.id, firstName, lastName, email: tempUser.email, role: tempUser.role } });
    }
    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });
    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    const [firstName, ...lastNameParts] = (user.name || '').split(' ');
    const lastName = lastNameParts.join(' ') || '';
    res.json({ token, user: { id: user._id, firstName, lastName, email: user.email, role: user.role } });
  } catch (err) {
    // Fallback to in-memory storage if MongoDB is not available
    const tempUser = tempUsers.get(email);
    if (!tempUser || tempUser.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const [firstName, ...lastNameParts] = (tempUser.name || '').split(' ');
    const lastName = lastNameParts.join(' ') || '';
    const token = jwt.sign({ id: tempUser.id, role: tempUser.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.json({ token, user: { id: tempUser.id, firstName, lastName, email: tempUser.email, role: tempUser.role } });
  }
});

// Profile (protected)
const auth = require('../middleware/auth');

// Test endpoint to verify JWT is working
router.get('/test', auth, async (req, res) => {
  res.json({ 
    message: 'JWT is working!', 
    user: req.user,
    secret: process.env.JWT_SECRET ? 'Secret is set' : 'Secret is missing'
  });
});
router.get('/profile', auth, async (req, res) => {
  try {
    // Try MongoDB first
    const user = await User.findById(req.user.id).select('-password');
    if (user) {
      // Transform user data to match frontend expectations
      const [firstName, ...lastNameParts] = (user.name || '').split(' ');
      const lastName = lastNameParts.join(' ') || '';
      const profileData = {
        id: user._id,
        firstName: firstName,
        lastName: lastName,
        email: user.email,
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || '',
        address: user.address || '',
        avatar: user.avatar || null,
        rating: typeof user.rating === 'number' ? user.rating : 0,
        totalRides: typeof user.totalRides === 'number' ? user.totalRides : 0,
        totalParking: typeof user.totalParking === 'number' ? user.totalParking : 0,
        memberSince: user.createdAt || new Date().toISOString(),
        preferences: user.preferences || {
          notifications: { email: true, push: true, sms: false },
          privacy: { shareLocation: true, shareRideHistory: false, shareParkingHistory: true },
          accessibility: { wheelchairAccessible: false, audioAnnouncements: false, largeText: false }
        },
        vehicles: user.vehicles || [],
        paymentMethods: user.paymentMethods || []
      };
      return res.json(profileData);
    }
    // Fallback to in-memory storage
    const tempUser = Array.from(tempUsers.values()).find(u => u.id === req.user.id);
    if (tempUser) {
      const { password, ...userData } = tempUser;
      const [firstName, ...lastNameParts] = (userData.name || '').split(' ');
      const lastName = lastNameParts.join(' ') || '';
      const profileData = {
        id: userData.id,
        firstName: firstName,
        lastName: lastName,
        email: userData.email,
        phone: userData.phone || '',
        dateOfBirth: '1990-01-01', // Mock data
        address: '123 Main St, City, State', // Mock data
        avatar: null,
        rating: 4.5, // Mock data
        totalRides: 25, // Mock data
        totalParking: 15, // Mock data
        memberSince: new Date().toISOString(),
        preferences: {
          notifications: {
            email: true,
            push: true,
            sms: false
          },
          privacy: {
            shareLocation: true,
            shareRideHistory: false,
            shareParkingHistory: true
          },
          accessibility: {
            wheelchairAccessible: false,
            audioAnnouncements: false,
            largeText: false
          }
        },
        vehicles: [
          {
            id: '1',
            make: 'Toyota',
            model: 'Camry',
            year: 2020,
            color: 'Silver',
            licensePlate: 'ABC123',
            isDefault: true
          }
        ],
        paymentMethods: [
          {
            id: '1',
            type: 'card',
            name: 'Visa ending in 1234',
            lastFour: '1234',
            isDefault: true
          }
        ]
      };
      return res.json(profileData);
    }
    // If we reach here, user is not found
    console.error('Profile error: User not found for id', req.user.id);
    return res.status(404).json({ message: 'User not found' });
  } catch (err) {
    console.error('Profile error:', err); // Log the error for debugging
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
const express = require('express');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const router = express.Router();

// Temporary in-memory storage for demo purposes
const tempPayments = new Map();

// Get user payment history
router.get('/history', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const payments = await Payment.find({ user: req.user.id }).sort({ createdAt: -1 });
      return res.json(payments);
    } catch (dbError) {
      // Fallback to in-memory storage
      const userPayments = Array.from(tempPayments.values())
        .filter(payment => payment.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(userPayments);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment status
router.get('/:id/status', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment || payment.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      return res.json({ status: payment.status });
    } catch (dbError) {
      // Fallback to in-memory storage
      const payment = tempPayments.get(req.params.id);
      if (!payment || payment.user !== req.user.id) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      return res.json({ status: payment.status });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Request refund
router.post('/:id/refund', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const payment = await Payment.findById(req.params.id);
      if (!payment || payment.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      if (payment.status !== 'completed') {
        return res.status(400).json({ message: 'Cannot refund this payment' });
      }
      payment.status = 'refunded';
      await payment.save();
      return res.json({ message: 'Refund processed', payment });
    } catch (dbError) {
      // Fallback to in-memory storage
      const payment = tempPayments.get(req.params.id);
      if (!payment || payment.user !== req.user.id) {
        return res.status(404).json({ message: 'Payment not found' });
      }
      if (payment.status !== 'completed') {
        return res.status(400).json({ message: 'Cannot refund this payment' });
      }
      payment.status = 'refunded';
      payment.updatedAt = new Date();
      tempPayments.set(req.params.id, payment);
      return res.json({ message: 'Refund processed', payment });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment transactions
router.get('/transactions', auth, async (req, res) => {
  try {
    // Return mock transaction data
    const transactions = [
      {
        id: '1',
        type: 'ride',
        amount: 25.50,
        status: 'completed',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        description: 'Ride from Central Park to Times Square'
      },
      {
        id: '2',
        type: 'parking',
        amount: 15.00,
        status: 'completed',
        date: new Date(Date.now() - 24 * 60 * 60 * 1000),
        description: 'Parking at Downtown Lot'
      },
      {
        id: '3',
        type: 'subscription',
        amount: 49.99,
        status: 'pending',
        date: new Date(Date.now() - 48 * 60 * 60 * 1000),
        description: 'Monthly Premium Subscription'
      }
    ];
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment methods
router.get('/methods', auth, async (req, res) => {
  try {
    // Return mock payment methods
    const methods = [
      {
        id: '1',
        type: 'card',
        name: 'Visa ending in 1234',
        lastFour: '1234',
        isDefault: true
      },
      {
        id: '2',
        type: 'card',
        name: 'Mastercard ending in 5678',
        lastFour: '5678',
        isDefault: false
      }
    ];
    res.json(methods);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get payment statistics
router.get('/stats', auth, async (req, res) => {
  try {
    // Return mock payment statistics
    const stats = {
      totalSpent: 1250.75,
      monthlyAverage: 89.50,
      totalTransactions: 45,
      thisMonth: 234.25
    };
    res.json(stats);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
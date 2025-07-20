const express = require('express');
const { body, validationResult } = require('express-validator');
const ParkingSlot = require('../models/ParkingSlot');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const QRCode = require('qrcode');
const auth = require('../middleware/auth');
const router = express.Router();

// Temporary in-memory storage for demo purposes
const tempParkingSlots = new Map();
const tempReservations = new Map();
const tempParkingPayments = new Map();

// Initialize mock parking slots
const initializeMockSlots = () => {
  const mockSlots = [
    { _id: '1', location: 'Downtown', type: 'standard', isOccupied: false, isReserved: false, price: 10 },
    { _id: '2', location: 'Downtown', type: 'premium', isOccupied: false, isReserved: false, price: 15 },
    { _id: '3', location: 'Airport', type: 'standard', isOccupied: true, isReserved: false, price: 12 },
    { _id: '4', location: 'Airport', type: 'premium', isOccupied: false, isReserved: false, price: 18 },
    { _id: '5', location: 'Mall', type: 'standard', isOccupied: false, isReserved: false, price: 8 },
    { _id: '6', location: 'Mall', type: 'premium', isOccupied: false, isReserved: false, price: 12 }
  ];
  
  mockSlots.forEach(slot => {
    tempParkingSlots.set(slot._id, slot);
  });
};

// Get all parking slots with availability
router.get('/slots', async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const slots = await ParkingSlot.find().populate('assignedTo', 'name email');
      if (slots.length > 0) {
        return res.json(slots);
      }
      // If no slots in DB, fall back to mock data
      throw new Error('No slots in database');
    } catch (dbError) {
      // Fallback to in-memory storage
      initializeMockSlots();
      const slots = Array.from(tempParkingSlots.values());
      return res.json(slots);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available slots
router.get('/slots/available', async (req, res) => {
  try {
    const { location, type } = req.query;
    
    // Try MongoDB first
    try {
      let query = { isOccupied: false, isReserved: false };
      if (location) query.location = location;
      if (type) query.type = type;
      
      const slots = await ParkingSlot.find(query);
      return res.json(slots);
    } catch (dbError) {
      // Fallback to in-memory storage
      initializeMockSlots();
      let slots = Array.from(tempParkingSlots.values())
        .filter(slot => !slot.isOccupied && !slot.isReserved);
      
      if (location) {
        slots = slots.filter(slot => slot.location === location);
      }
      if (type) {
        slots = slots.filter(slot => slot.type === type);
      }
      
      return res.json(slots);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Create reservation
router.post('/reserve', auth, [
  body('slotId').notEmpty(),
  body('startTime').isISO8601(),
  body('endTime').isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { slotId, startTime, endTime } = req.body;
  
  try {
    // Try MongoDB first
    try {
      // Check if slot is available
      const slot = await ParkingSlot.findById(slotId);
      if (!slot || slot.isOccupied || slot.isReserved) {
        return res.status(400).json({ message: 'Slot not available' });
      }

      // Calculate dynamic pricing
      const hours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
      const basePrice = 10; // $10 per hour
      const peakHourMultiplier = new Date(startTime).getHours() >= 7 && new Date(startTime).getHours() <= 9 ? 1.5 : 1;
      const totalPrice = basePrice * hours * peakHourMultiplier;

      // Create reservation
      const reservation = new Reservation({
        user: req.user.id,
        parkingSlot: slotId,
        startTime,
        endTime
      });

      // Generate QR code
      const qrData = JSON.stringify({
        reservationId: reservation._id,
        slotId,
        userId: req.user.id,
        timestamp: Date.now()
      });
      reservation.qrCode = await QRCode.toDataURL(qrData);

      await reservation.save();

      // Update slot status
      slot.isReserved = true;
      slot.assignedTo = req.user.id;
      await slot.save();

      // Create payment record
      const payment = new Payment({
        user: req.user.id,
        amount: totalPrice,
        method: 'card',
        type: 'parking',
        referenceId: reservation._id.toString()
      });
      await payment.save();

      return res.status(201).json({
        reservation,
        payment: { amount: totalPrice, id: payment._id },
        qrCode: reservation.qrCode
      });
    } catch (dbError) {
      // Fallback to in-memory storage
      initializeMockSlots();
      
      const slot = tempParkingSlots.get(slotId);
      if (!slot || slot.isOccupied || slot.isReserved) {
        return res.status(400).json({ message: 'Slot not available' });
      }

      // Calculate pricing
      const hours = Math.ceil((new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60));
      const basePrice = slot.price || 10;
      const peakHourMultiplier = new Date(startTime).getHours() >= 7 && new Date(startTime).getHours() <= 9 ? 1.5 : 1;
      const totalPrice = basePrice * hours * peakHourMultiplier;

      const reservationId = Date.now().toString();
      const paymentId = (Date.now() + 1).toString();

      const reservationData = {
        _id: reservationId,
        user: req.user.id,
        parkingSlot: slotId,
        startTime,
        endTime,
        status: 'active',
        qrCode: `mock-qr-${reservationId}`,
        createdAt: new Date()
      };

      const paymentData = {
        _id: paymentId,
        user: req.user.id,
        amount: totalPrice,
        method: 'card',
        type: 'parking',
        status: 'completed',
        referenceId: reservationId,
        createdAt: new Date()
      };

      // Update slot
      slot.isReserved = true;
      slot.assignedTo = req.user.id;
      tempParkingSlots.set(slotId, slot);

      // Store data
      tempReservations.set(reservationId, reservationData);
      tempParkingPayments.set(paymentId, paymentData);

      return res.status(201).json({
        reservation: reservationData,
        payment: { amount: totalPrice, id: paymentId },
        qrCode: reservationData.qrCode
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user reservations
router.get('/reservations', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const reservations = await Reservation.find({ user: req.user.id })
        .populate('parkingSlot')
        .sort({ createdAt: -1 });
      return res.json(reservations);
    } catch (dbError) {
      // Fallback to in-memory storage
      const userReservations = Array.from(tempReservations.values())
        .filter(reservation => reservation.user === req.user.id)
        .map(reservation => ({
          ...reservation,
          parkingSlot: tempParkingSlots.get(reservation.parkingSlot)
        }))
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      
      return res.json(userReservations);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel reservation
router.put('/reservations/:id/cancel', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const reservation = await Reservation.findById(req.params.id);
      if (!reservation || reservation.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      if (reservation.status !== 'active') {
        return res.status(400).json({ message: 'Cannot cancel this reservation' });
      }

      // Check cancellation policy (full refund if 2 hours before)
      const hoursUntilStart = (new Date(reservation.startTime) - new Date()) / (1000 * 60 * 60);
      const refundAmount = hoursUntilStart >= 2 ? reservation.payment?.amount || 0 : 0;

      reservation.status = 'cancelled';
      await reservation.save();

      // Update slot status
      const slot = await ParkingSlot.findById(reservation.parkingSlot);
      if (slot) {
        slot.isReserved = false;
        slot.assignedTo = null;
        await slot.save();
      }

      return res.json({ 
        message: 'Reservation cancelled',
        refundAmount,
        reservation 
      });
    } catch (dbError) {
      // Fallback to in-memory storage
      const reservation = tempReservations.get(req.params.id);
      if (!reservation || reservation.user !== req.user.id) {
        return res.status(404).json({ message: 'Reservation not found' });
      }

      if (reservation.status !== 'active') {
        return res.status(400).json({ message: 'Cannot cancel this reservation' });
      }

      // Check cancellation policy
      const hoursUntilStart = (new Date(reservation.startTime) - new Date()) / (1000 * 60 * 60);
      const payment = Array.from(tempParkingPayments.values())
        .find(p => p.referenceId === reservation._id);
      const refundAmount = hoursUntilStart >= 2 ? payment?.amount || 0 : 0;

      reservation.status = 'cancelled';
      reservation.updatedAt = new Date();
      tempReservations.set(req.params.id, reservation);

      // Update slot status
      const slot = tempParkingSlots.get(reservation.parkingSlot);
      if (slot) {
        slot.isReserved = false;
        slot.assignedTo = null;
        tempParkingSlots.set(reservation.parkingSlot, slot);
      }

      return res.json({ 
        message: 'Reservation cancelled',
        refundAmount,
        reservation 
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check-in with QR code
router.post('/checkin', auth, async (req, res) => {
  try {
    const { qrCode } = req.body;
    
    // Try MongoDB first
    try {
      // Decode QR code (in real implementation, you'd verify the QR code)
      const reservation = await Reservation.findOne({ 
        qrCode: qrCode,
        user: req.user.id,
        status: 'active'
      });

      if (!reservation) {
        return res.status(400).json({ message: 'Invalid QR code or reservation' });
      }

      // Update slot to occupied
      const slot = await ParkingSlot.findById(reservation.parkingSlot);
      slot.isOccupied = true;
      await slot.save();

      return res.json({ message: 'Check-in successful', slot });
    } catch (dbError) {
      // Fallback to in-memory storage
      const reservation = Array.from(tempReservations.values())
        .find(r => r.qrCode === qrCode && r.user === req.user.id && r.status === 'active');

      if (!reservation) {
        return res.status(400).json({ message: 'Invalid QR code or reservation' });
      }

      // Update slot to occupied
      const slot = tempParkingSlots.get(reservation.parkingSlot);
      slot.isOccupied = true;
      tempParkingSlots.set(reservation.parkingSlot, slot);

      return res.json({ message: 'Check-in successful', slot });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Check-out
router.post('/checkout', auth, async (req, res) => {
  try {
    const { slotId } = req.body;
    
    // Try MongoDB first
    try {
      const reservation = await Reservation.findOne({
        parkingSlot: slotId,
        user: req.user.id,
        status: 'active'
      });

      if (!reservation) {
        return res.status(400).json({ message: 'No active reservation found' });
      }

      // Update slot status
      const slot = await ParkingSlot.findById(slotId);
      slot.isOccupied = false;
      slot.isReserved = false;
      slot.assignedTo = null;
      await slot.save();

      return res.json({ message: 'Check-out successful', slot });
    } catch (dbError) {
      // Fallback to in-memory storage
      const reservation = Array.from(tempReservations.values())
        .find(r => r.parkingSlot === slotId && r.user === req.user.id && r.status === 'active');

      if (!reservation) {
        return res.status(400).json({ message: 'No active reservation found' });
      }

      // Update slot status
      const slot = tempParkingSlots.get(slotId);
      slot.isOccupied = false;
      slot.isReserved = false;
      slot.assignedTo = null;
      tempParkingSlots.set(slotId, slot);

      return res.json({ message: 'Check-out successful', slot });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get parking analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const totalReservations = await Reservation.countDocuments({ user: req.user.id });
      const activeReservations = await Reservation.countDocuments({ user: req.user.id, status: 'active' });
      const totalSpent = await Payment.aggregate([
        { $match: { user: req.user.id, type: 'parking' } },
        { $group: { _id: null, total: { $sum: '$amount' } } }
      ]);

      return res.json({
        totalReservations,
        activeReservations,
        totalSpent: totalSpent[0]?.total || 0,
        averageDuration: 2.5 // hours
      });
    } catch (dbError) {
      // Fallback to in-memory storage
      const userReservations = Array.from(tempReservations.values())
        .filter(r => r.user === req.user.id);
      
      const totalReservations = userReservations.length;
      const activeReservations = userReservations.filter(r => r.status === 'active').length;
      const totalSpent = Array.from(tempParkingPayments.values())
        .filter(p => p.user === req.user.id)
        .reduce((sum, p) => sum + p.amount, 0);

      return res.json({
        totalReservations,
        activeReservations,
        totalSpent,
        averageDuration: 2.5
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
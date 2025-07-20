const express = require('express');
const { body, validationResult } = require('express-validator');
const Ride = require('../models/Ride');
const Payment = require('../models/Payment');
const auth = require('../middleware/auth');
const router = express.Router();

// Temporary in-memory storage for demo purposes
const tempRides = new Map();
const tempPayments = new Map();

// Get available ride types
router.get('/types', async (req, res) => {
  try {
    const rideTypes = [
      { type: 'cab', name: 'Cab', basePrice: 15, description: 'Private cab service' },
      { type: 'shuttle', name: 'Shuttle', basePrice: 8, description: 'Shared shuttle service' },
      { type: 'e-rickshaw', name: 'E-Rickshaw', basePrice: 5, description: 'Electric rickshaw' }
    ];
    res.json(rideTypes);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Book a ride
router.post('/book', auth, [
  body('type').isIn(['cab', 'shuttle', 'e-rickshaw']),
  body('pickupLocation').notEmpty(),
  body('dropLocation').notEmpty(),
  body('scheduledTime').optional().isISO8601()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { type, pickupLocation, dropLocation, scheduledTime } = req.body;
  
  try {
    // Calculate fare based on distance and type
    const basePrices = { cab: 15, shuttle: 8, 'e-rickshaw': 5 };
    const basePrice = basePrices[type];
    
    // Simple distance calculation (in real app, use Google Maps API)
    const distance = Math.random() * 10 + 1; // 1-11 km
    const fare = Math.round(basePrice * distance);

    // Check for surge pricing during peak hours
    const currentHour = new Date().getHours();
    const isPeakHour = (currentHour >= 7 && currentHour <= 9) || (currentHour >= 17 && currentHour <= 19);
    const surgeMultiplier = isPeakHour ? 1.3 : 1;
    const finalFare = Math.round(fare * surgeMultiplier);

    // Try MongoDB first
    try {
      const ride = new Ride({
        user: req.user.id,
        type,
        pickupLocation,
        dropLocation,
        scheduledTime: scheduledTime || new Date(),
        fare: finalFare
      });

      await ride.save();

      // Create payment record
      const payment = new Payment({
        user: req.user.id,
        amount: finalFare,
        method: 'card',
        type: 'ride',
        referenceId: ride._id.toString()
      });
      await payment.save();

      return res.status(201).json({
        ride,
        payment: { amount: finalFare, id: payment._id },
        estimatedTime: Math.round(distance * 3) // 3 minutes per km
      });
    } catch (dbError) {
      // Fallback to in-memory storage
      const rideId = Date.now().toString();
      const paymentId = (Date.now() + 1).toString();
      
      const rideData = {
        _id: rideId,
        user: req.user.id,
        type,
        pickupLocation,
        dropLocation,
        scheduledTime: scheduledTime || new Date(),
        fare: finalFare,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const paymentData = {
        _id: paymentId,
        user: req.user.id,
        amount: finalFare,
        method: 'card',
        type: 'ride',
        status: 'pending',
        referenceId: rideId,
        createdAt: new Date()
      };
      
      tempRides.set(rideId, rideData);
      tempPayments.set(paymentId, paymentData);
      
      return res.status(201).json({
        ride: rideData,
        payment: { amount: finalFare, id: paymentId },
        estimatedTime: Math.round(distance * 3)
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user rides
router.get('/my-rides', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const rides = await Ride.find({ user: req.user.id })
        .sort({ createdAt: -1 });
      return res.json(rides);
    } catch (dbError) {
      // Fallback to in-memory storage
      const userRides = Array.from(tempRides.values())
        .filter(ride => ride.user === req.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      return res.json(userRides);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Cancel ride
router.put('/:id/cancel', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const ride = await Ride.findById(req.params.id);
      if (!ride || ride.user.toString() !== req.user.id) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      if (ride.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot cancel this ride' });
      }

      ride.status = 'cancelled';
      await ride.save();

      return res.json({ message: 'Ride cancelled', ride });
    } catch (dbError) {
      // Fallback to in-memory storage
      const ride = tempRides.get(req.params.id);
      if (!ride || ride.user !== req.user.id) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      if (ride.status !== 'pending') {
        return res.status(400).json({ message: 'Cannot cancel this ride' });
      }

      ride.status = 'cancelled';
      ride.updatedAt = new Date();
      tempRides.set(req.params.id, ride);

      return res.json({ message: 'Ride cancelled', ride });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ride bookings
router.get('/bookings', auth, async (req, res) => {
  try {
    // Return mock booking data
    const bookings = [
      {
        id: '1',
        type: 'cab',
        pickupLocation: 'Central Park',
        dropLocation: 'Times Square',
        fare: 25.50,
        status: 'completed',
        date: new Date(Date.now() - 2 * 60 * 60 * 1000),
        driver: 'John Smith'
      },
      {
        id: '2',
        type: 'shuttle',
        pickupLocation: 'Airport Terminal 1',
        dropLocation: 'Downtown Hotel',
        fare: 18.00,
        status: 'ongoing',
        date: new Date(),
        driver: 'Sarah Johnson'
      }
    ];
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get available drivers
router.get('/drivers', auth, async (req, res) => {
  try {
    // Return mock driver data
    const drivers = [
      {
        id: '1',
        name: 'John Smith',
        rating: 4.8,
        vehicle: 'Toyota Camry',
        licensePlate: 'ABC123',
        isAvailable: true,
        currentLocation: 'Central Park'
      },
      {
        id: '2',
        name: 'Sarah Johnson',
        rating: 4.9,
        vehicle: 'Honda Civic',
        licensePlate: 'XYZ789',
        isAvailable: true,
        currentLocation: 'Airport Terminal 1'
      }
    ];
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Update ride status (for drivers/admin)
router.put('/:id/status', auth, [
  body('status').isIn(['pending', 'ongoing', 'completed', 'cancelled'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    // Try MongoDB first
    try {
      const ride = await Ride.findById(req.params.id);
      if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      ride.status = req.body.status;
      await ride.save();

      return res.json({ message: 'Ride status updated', ride });
    } catch (dbError) {
      // Fallback to in-memory storage
      const ride = tempRides.get(req.params.id);
      if (!ride) {
        return res.status(404).json({ message: 'Ride not found' });
      }

      ride.status = req.body.status;
      ride.updatedAt = new Date();
      tempRides.set(req.params.id, ride);

      return res.json({ message: 'Ride status updated', ride });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ride pooling options
router.post('/pool', auth, [
  body('pickupLocation').notEmpty(),
  body('dropLocation').notEmpty()
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { pickupLocation, dropLocation } = req.body;
    
    // Try MongoDB first
    try {
      // Find rides going in similar direction (simplified logic)
      const nearbyRides = await Ride.find({
        status: 'pending',
        type: 'shuttle',
        pickupLocation: { $regex: pickupLocation, $options: 'i' },
        createdAt: { $gte: new Date(Date.now() - 30 * 60 * 1000) } // Last 30 minutes
      }).limit(5);

      const poolOptions = nearbyRides.map(ride => ({
        rideId: ride._id,
        pickupLocation: ride.pickupLocation,
        dropLocation: ride.dropLocation,
        scheduledTime: ride.scheduledTime,
        sharedFare: Math.round(ride.fare * 0.7) // 30% discount for pooling
      }));

      return res.json(poolOptions);
    } catch (dbError) {
      // Fallback to in-memory storage
      const nearbyRides = Array.from(tempRides.values())
        .filter(ride => 
          ride.status === 'pending' && 
          ride.type === 'shuttle' &&
          ride.pickupLocation.toLowerCase().includes(pickupLocation.toLowerCase()) &&
          new Date(ride.createdAt) >= new Date(Date.now() - 30 * 60 * 1000)
        )
        .slice(0, 5);

      const poolOptions = nearbyRides.map(ride => ({
        rideId: ride._id,
        pickupLocation: ride.pickupLocation,
        dropLocation: ride.dropLocation,
        scheduledTime: ride.scheduledTime,
        sharedFare: Math.round(ride.fare * 0.7)
      }));

      return res.json(poolOptions);
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get ride analytics
router.get('/analytics', auth, async (req, res) => {
  try {
    // Try MongoDB first
    try {
      const totalRides = await Ride.countDocuments({ user: req.user.id });
      const completedRides = await Ride.countDocuments({ user: req.user.id, status: 'completed' });
      const totalSpent = await Ride.aggregate([
        { $match: { user: req.user.id, status: 'completed' } },
        { $group: { _id: null, total: { $sum: '$fare' } } }
      ]);

      const rideTypes = await Ride.aggregate([
        { $match: { user: req.user.id } },
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);

      return res.json({
        totalRides,
        completedRides,
        totalSpent: totalSpent[0]?.total || 0,
        rideTypes,
        averageFare: totalSpent[0]?.total / completedRides || 0
      });
    } catch (dbError) {
      // Fallback to in-memory storage
      const userRides = Array.from(tempRides.values())
        .filter(ride => ride.user === req.user.id);
      
      const totalRides = userRides.length;
      const completedRides = userRides.filter(ride => ride.status === 'completed').length;
      const totalSpent = userRides
        .filter(ride => ride.status === 'completed')
        .reduce((sum, ride) => sum + ride.fare, 0);
      
      const rideTypes = {};
      userRides.forEach(ride => {
        rideTypes[ride.type] = (rideTypes[ride.type] || 0) + 1;
      });

      return res.json({
        totalRides,
        completedRides,
        totalSpent,
        rideTypes: Object.entries(rideTypes).map(([type, count]) => ({ _id: type, count })),
        averageFare: completedRides > 0 ? totalSpent / completedRides : 0
      });
    }
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /bookings - Create a new ride booking
router.post('/bookings', auth, async (req, res) => {
  try {
    const { rideTypeId, driverId, pickupLocation, dropoffLocation, scheduledTime, passengers } = req.body;
    // For demo, just create a mock booking object
    const booking = {
      id: Date.now().toString(),
      rideType: rideTypeId || 'cab',
      pickupLocation: pickupLocation || 'Unknown',
      dropoffLocation: dropoffLocation || 'Unknown',
      status: 'pending',
      driver: driverId ? { id: driverId, name: 'Demo Driver', rating: 4.8, vehicle: 'Demo Car', phone: '1234567890' } : undefined,
      estimatedPrice: 20,
      actualPrice: undefined,
      estimatedTime: '15 mins',
      createdAt: new Date().toISOString(),
      scheduledTime: scheduledTime || new Date().toISOString(),
      passengers: passengers || 1
    };
    // Optionally, store in tempRides or another in-memory store
    // tempRides.set(booking.id, booking);
    res.status(201).json(booking);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
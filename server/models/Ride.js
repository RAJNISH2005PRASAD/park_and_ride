const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['cab', 'shuttle', 'e-rickshaw'], required: true },
  pickupLocation: { type: String, required: true },
  dropLocation: { type: String, required: true },
  scheduledTime: { type: Date },
  status: { type: String, enum: ['pending', 'ongoing', 'completed', 'cancelled'], default: 'pending' },
  fare: { type: Number },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ride', rideSchema); 
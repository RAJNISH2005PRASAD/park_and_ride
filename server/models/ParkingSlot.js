const mongoose = require('mongoose');

const parkingSlotSchema = new mongoose.Schema({
  slotNumber: { type: String, required: true, unique: true },
  location: { type: String, required: true },
  isOccupied: { type: Boolean, default: false },
  isReserved: { type: Boolean, default: false },
  type: { type: String, enum: ['hourly', 'daily', 'monthly'], default: 'hourly' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  lastUpdated: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ParkingSlot', parkingSlotSchema); 
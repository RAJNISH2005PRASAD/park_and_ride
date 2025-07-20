const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  loyaltyPoints: { type: Number, default: 0 },
  subscriptions: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  dateOfBirth: { type: String, default: '' },
  address: { type: String, default: '' },
  avatar: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  totalRides: { type: Number, default: 0 },
  totalParking: { type: Number, default: 0 },
  preferences: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    privacy: {
      shareLocation: { type: Boolean, default: true },
      shareRideHistory: { type: Boolean, default: false },
      shareParkingHistory: { type: Boolean, default: true }
    },
    accessibility: {
      wheelchairAccessible: { type: Boolean, default: false },
      audioAnnouncements: { type: Boolean, default: false },
      largeText: { type: Boolean, default: false }
    }
  },
  vehicles: { type: Array, default: [] },
  paymentMethods: { type: Array, default: [] }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema); 
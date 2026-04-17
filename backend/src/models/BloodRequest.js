const mongoose = require('mongoose');

const bloodRequestSchema = new mongoose.Schema({
  patient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, enum: ['receive', 'donate'], default: 'receive' }, // receive = needy, donate = volunteering
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  hospital: { type: mongoose.Schema.Types.ObjectId, ref: 'Hospital' },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  urgency: { type: String, enum: ['low', 'medium', 'high', 'critical'], default: 'high' },
  status: { type: String, enum: ['pending', 'matched', 'fulfilled', 'cancelled'], default: 'pending' },
  matches: [{
    donor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
    matchedAt: { type: Date, default: Date.now }
  }],
  created_at: { type: Date, default: Date.now }
});

// 2dsphere index for finding nearby donors relative to the request location
bloodRequestSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('BloodRequest', bloodRequestSchema);

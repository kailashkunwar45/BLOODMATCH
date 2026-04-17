const mongoose = require('mongoose');

const donorSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  bloodGroup: { type: String, enum: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], required: true },
  contact: { type: String, required: true },
  city: { type: String, required: true },
  location: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], required: true } // [longitude, latitude]
  },
  availability: { type: Boolean, default: true },
  lastDonation: { type: Date }
});

// Create 2dsphere index for proximity matching
donorSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Donor', donorSchema);

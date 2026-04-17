const Donor = require('../models/Donor');
const User = require('../models/User');

exports.updateProfile = async (req, res) => {
  try {
    const { bloodGroup, contact, city, coordinates, availability } = req.body;

    const donor = await Donor.findOneAndUpdate(
      { user: req.user._id },
      { 
        bloodGroup, 
        contact, 
        city, 
        location: { type: 'Point', coordinates }, 
        availability 
      },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getDonorProfile = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    res.status(200).json({ success: true, donor });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getNearestDonors = async (req, res) => {
  try {
    const { bloodGroup, coordinates } = req.query; // coordinates is [lng, lat]
    const parsedCoordinates = JSON.parse(coordinates);

    const donors = await Donor.find({
      bloodGroup,
      availability: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates: parsedCoordinates },
          $maxDistance: 50000 // 50km
        }
      }
    }).populate('user', 'name email');

    res.status(200).json({ success: true, donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllDonors = async (req, res) => {
  try {
    const donors = await Donor.find().populate('user', 'name email');
    res.status(200).json({ success: true, donors });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

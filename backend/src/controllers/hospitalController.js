const Hospital = require('../models/Hospital');
const ActivityLog = require('../models/ActivityLog');

exports.updateHospitalDetails = async (req, res) => {
  try {
    const { name, address, city, contact, coordinates } = req.body;

    const hospital = await Hospital.findOneAndUpdate(
      { admin: req.user._id },
      { 
        name, 
        address, 
        city, 
        contact, 
        location: { type: 'Point', coordinates } 
      },
      { new: true, upsert: true }
    );

    await ActivityLog.create({ user: req.user._id, action: `Updated hospital: ${name}` });

    res.status(200).json({ success: true, hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getHospitalProfile = async (req, res) => {
  try {
    const hospital = await Hospital.findOne({ admin: req.user._id });
    res.status(200).json({ success: true, hospital });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find().populate('admin', 'name email');
    res.status(200).json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

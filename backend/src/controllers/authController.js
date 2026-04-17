const jwt = require('jsonwebtoken');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

exports.registerUser = async (req, res) => {
  try {
    const { name, email, password, role, bloodGroup, contact, hospitalName, registrationNumber, city } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    if (role === 'hospital_admin') {
      const verifiedHospitals = require('../data/verifiedHospitals');
      const validHospital = verifiedHospitals.find(h => h.registrationNumber === registrationNumber);
      
      if (!validHospital) {
        return res.status(400).json({ success: false, message: 'Invalid or Unrecognized Hospital Registration Number' });
      }

      // Ensure this registration number isn't already used
      const Hospital = require('../models/Hospital');
      const existingHosp = await Hospital.findOne({ 'name': validHospital.name }); // Using name to check since reg num isn't in db yet
      if (existingHosp) {
         return res.status(400).json({ success: false, message: 'This hospital is already registered in the system.' });
      }
    }

    const user = await User.create({ name, email, password, role: role || 'user', bloodGroup, contact: contact || 'N/A' });

    if (user) {
      if (role === 'hospital_admin') {
         const Hospital = require('../models/Hospital');
         const verifiedHospitals = require('../data/verifiedHospitals');
         const validHospital = verifiedHospitals.find(h => h.registrationNumber === registrationNumber);
         
         await Hospital.create({
           admin: user._id,
           name: validHospital.name,
           city: validHospital.city,
           address: city || validHospital.city,
           contact: contact,
           location: { type: 'Point', coordinates: [85.3240, 27.7172] } // Default rough location for map
         });
      }

      await ActivityLog.create({ user: user._id, action: 'User registered' });
      res.status(201).json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        bloodGroup: user.bloodGroup,
        contact: user.contact,
        token: generateToken(user._id)
      });
    } else {
      res.status(400).json({ success: false, message: 'Invalid user data' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (user && (await user.comparePassword(password))) {
      await ActivityLog.create({ user: user._id, action: 'User logged in' });
      res.json({
        success: true,
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        contact: user.contact,
        bloodGroup: user.bloodGroup,
        token: generateToken(user._id)
      });
    } else {
      res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUserProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      success: true,
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      contact: user.contact,
      bloodGroup: user.bloodGroup
    });
  } else {
    res.status(404).json({ success: false, message: 'User not found' });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    user.name = req.body.name || user.name;
    user.contact = req.body.contact || user.contact;
    user.bloodGroup = req.body.bloodGroup || user.bloodGroup;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      success: true,
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      contact: updatedUser.contact,
      bloodGroup: updatedUser.bloodGroup,
      token: generateToken(updatedUser._id)
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

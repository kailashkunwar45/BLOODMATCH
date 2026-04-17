const User = require('../models/User');
const Donor = require('../models/Donor');
const Hospital = require('../models/Hospital');
const BloodRequest = require('../models/BloodRequest');
const ActivityLog = require('../models/ActivityLog');

exports.getStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const donors = await Donor.countDocuments({ availability: true });
    const hospitals = await Hospital.countDocuments();
    const requests = await BloodRequest.countDocuments();

    res.status(200).json({
      success: true,
      stats: { users, donors, hospitals, requests }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getActivityLogs = async (req, res) => {
  try {
    const logs = await ActivityLog.find()
      .populate('user', 'name email')
      .sort('-timestamp')
      .limit(50); // Get latest 50 logs for performance

    res.status(200).json({ success: true, logs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.sendMessage = async (req, res) => {
  try {
    const { bloodGroup, message } = req.body;
    
    // Find users with the specified blood group
    const users = await User.find({ bloodGroup, role: 'user' });
    
    if (users.length === 0) {
      return res.status(404).json({ success: false, message: `No users found with blood group ${bloodGroup}` });
    }

    const Notification = require('../models/Notification');
    
    const notifications = users.map(u => ({
      user: u._id,
      sender: req.user._id,
      type: 'admin_message',
      message: message
    }));

    await Notification.insertMany(notifications);
    await ActivityLog.create({ user: req.user._id, action: `Broadcasted message to ${users.length} users of group ${bloodGroup}` });

    res.status(200).json({ success: true, message: `Message sent to ${users.length} users` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '-password').sort('-created_at');
    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    if (id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own admin account.' });
    }
    
    const user = await User.findByIdAndDelete(id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    // Also cleanup associated records if any (optional but good for hard delete)
    if (user.role === 'hospital_admin') {
      await Hospital.findOneAndDelete({ admin: id });
    }
    await Donor.findOneAndDelete({ user: id });
    
    await ActivityLog.create({ user: req.user._id, action: `Deleted user account: ${user.email} (${user.name})` });
    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllHospitals = async (req, res) => {
  try {
    const hospitals = await Hospital.find()
      .populate('admin', 'name email contact')
      .sort('-created_at');
    res.status(200).json({ success: true, hospitals });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find()
      .populate('patient', 'name email contact')
      .populate('hospital', 'name city')
      .sort('-created_at');
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const BloodRequest = require('../models/BloodRequest');
const Donor = require('../models/Donor');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');

exports.createRequest = async (req, res) => {
  try {
    const { bloodGroup, hospital, coordinates, urgency } = req.body;

    const bloodRequest = await BloodRequest.create({
      patient: req.user._id,
      bloodGroup,
      hospital,
      location: { type: 'Point', coordinates },
      urgency
    });

    // 🚨 SMART MATCHING: Find nearby donors within 50km
    const matchedDonors = await Donor.find({
      bloodGroup,
      availability: true,
      location: {
        $near: {
          $geometry: { type: 'Point', coordinates },
          $maxDistance: 50000 // 50km
        }
      }
    });

    // Notify matched donors (nearby)
    const notifications = [];
    if (matchedDonors.length > 0) {
      matchedDonors.forEach(donor => {
        notifications.push({
          user: donor.user,
          type: 'request_match',
          message: `🚨 EMERGENCY: ${bloodGroup} blood needed nearby! Urgency: ${urgency}`
        });
      });
      // Update request with matches
      bloodRequest.matches = matchedDonors.map(donor => ({ donor: donor.user }));
      await bloodRequest.save();
    }

    // Notify ALL Admins
    const User = require('../models/User');
    const admins = await User.find({ role: { $in: ['admin'] } });
    admins.forEach(admin => {
      notifications.push({
        user: admin._id,
        type: 'system',
        message: `New ${bloodGroup} blood request posted. Urgency: ${urgency}`
      });
    });

    // Notify the Patient (creator)
    notifications.push({
      user: req.user._id,
      type: 'system',
      message: `Your ${bloodGroup} blood request was posted successfully!`
    });

    if (notifications.length > 0) {
      await Notification.insertMany(notifications);
    }

    await ActivityLog.create({ 
      user: req.user._id, 
      action: `Created blood request for ${bloodGroup}. Notified ${matchedDonors.length} donors.` 
    });

    res.status(201).json({ success: true, bloodRequest, informedCount: matchedDonors.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPatientRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ patient: req.user._id })
      .populate('hospital', 'name city')
      .populate('matches.donor', 'name contact bloodGroup')
      .sort('-created_at');
    
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMatchedRequestsForDonor = async (req, res) => {
  try {
    const donor = await Donor.findOne({ user: req.user._id });
    if (!donor) return res.status(404).json({ success: false, message: 'Donor profile not found' });

    const requests = await BloodRequest.find({
      'matches.donor': donor._id,
      status: { $ne: 'cancelled' }
    }).populate('patient', 'name').populate('hospital', 'name').sort('-created_at');

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateMatchStatus = async (req, res) => {
  try {
    const { requestId, status } = req.body; // status: 'accepted' | 'rejected'
    const donor = await Donor.findOne({ user: req.user._id });

    const bloodRequest = await BloodRequest.findOneAndUpdate(
      { _id: requestId, 'matches.donor': donor._id },
      { $set: { 'matches.$.status': status, status: status === 'accepted' ? 'matched' : 'pending' } },
      { new: true }
    );

    res.status(200).json({ success: true, bloodRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.cancelRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    await BloodRequest.findOneAndUpdate(
      { _id: requestId, patient: req.user._id },
      { status: 'cancelled' }
    );
    res.status(200).json({ success: true, message: 'Request cancelled' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getLinkedRequestsForHospital = async (req, res) => {
  try {
    const Hospital = require('../models/Hospital');
    const hospital = await Hospital.findOne({ admin: req.user._id });
    if (!hospital) return res.status(404).json({ success: false, message: 'Hospital profile not found' });

    const requests = await BloodRequest.find({ hospital: hospital._id })
      .populate('patient', 'name')
      .sort('-created_at');

    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllActiveRequests = async (req, res) => {
  try {
    const requests = await BloodRequest.find({ status: 'pending' })
      .populate('patient', 'name')
      .populate('hospital', 'name city')
      .sort('-created_at');
    
    res.status(200).json({ success: true, requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getBloodAvailability = async (req, res) => {
  try {
    const Donor = require('../models/User'); // Querying Users as donors
    
    const availability = await Donor.aggregate([
      { $match: { role: 'user', bloodGroup: { $exists: true } } },
      { $group: { _id: "$bloodGroup", count: { $sum: 1 } } }
    ]);

    const formatted = availability.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    res.status(200).json({ success: true, availability: formatted });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.offerDonation = async (req, res) => {
  try {
    const { requestId } = req.body;
    
    const bloodRequest = await BloodRequest.findById(requestId);
    if (!bloodRequest) return res.status(404).json({ success: false, message: 'Request not found' });

    // Block self-donation
    if (bloodRequest.patient.toString() === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot donate to your own request.' });
    }

    // Check if already offered
    const alreadyOffered = bloodRequest.matches.some(m => m.donor.toString() === req.user._id.toString());
    if (alreadyOffered) {
      return res.status(400).json({ success: false, message: 'You have already offered to donate to this request' });
    }

    bloodRequest.matches.push({ donor: req.user._id, status: 'accepted' });
    bloodRequest.status = 'matched'; // Instantly match if they volunteer publicly
    
    await bloodRequest.save();

    // Notify the patient
    const Notification = require('../models/Notification');
    await Notification.create({
      user: bloodRequest.patient,
      sender: req.user._id,
      type: 'request_match',
      message: `${req.user.name} (${req.user.bloodGroup}) has offered to donate blood for your request! Contact: ${req.user.contact}`
    });

    res.status(200).json({ success: true, bloodRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

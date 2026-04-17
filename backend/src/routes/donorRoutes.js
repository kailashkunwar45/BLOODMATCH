const express = require('express');
const router = express.Router();
const { updateProfile, getDonorProfile, getNearestDonors, getAllDonors } = require('../controllers/donorController');
const { auth, authorize } = require('../middleware/auth');

router.post('/update', auth, authorize('donor'), updateProfile);
router.get('/profile', auth, authorize('donor'), getDonorProfile);
router.get('/nearest', auth, getNearestDonors);
router.get('/all', auth, getAllDonors);

module.exports = router;

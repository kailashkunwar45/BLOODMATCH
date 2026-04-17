const express = require('express');
const router = express.Router();
const { updateHospitalDetails, getHospitalProfile, getAllHospitals } = require('../controllers/hospitalController');
const { auth, authorize } = require('../middleware/auth');

router.post('/update', auth, authorize('hospital_admin'), updateHospitalDetails);
router.get('/profile', auth, authorize('hospital_admin'), getHospitalProfile);
router.get('/all', auth, getAllHospitals);

module.exports = router;

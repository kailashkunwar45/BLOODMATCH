const express = require('express');
const router = express.Router();
const { createRequest, getPatientRequests, getMatchedRequestsForDonor, updateMatchStatus, cancelRequest, getLinkedRequestsForHospital, getAllActiveRequests, getBloodAvailability, offerDonation } = require('../controllers/requestController');
const { auth, authorize } = require('../middleware/auth');

router.post('/create', auth, createRequest);
router.get('/my-requests', auth, getPatientRequests);
router.get('/donor-matches', auth, getMatchedRequestsForDonor);
router.post('/update-match', auth, updateMatchStatus);
router.post('/cancel', auth, cancelRequest);
router.get('/hospital-requests', auth, authorize('hospital_admin'), getLinkedRequestsForHospital);

// New unified endpoints
router.get('/all-active', auth, getAllActiveRequests);
router.get('/availability', auth, getBloodAvailability);
router.post('/offer-donation', auth, offerDonation);

module.exports = router;

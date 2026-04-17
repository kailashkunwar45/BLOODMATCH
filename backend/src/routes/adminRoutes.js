const express = require('express');
const router = express.Router();
const { getStats, getActivityLogs, sendMessage, getAllUsers, deleteUser, getAllHospitals, getAllRequests } = require('../controllers/adminController');
const { auth, authorize } = require('../middleware/auth');

router.get('/stats', auth, authorize('admin'), getStats);
router.get('/logs', auth, authorize('admin'), getActivityLogs);
router.post('/message', auth, authorize('admin'), sendMessage);

// Management Routes
router.get('/users', auth, authorize('admin'), getAllUsers);
router.delete('/users/:id', auth, authorize('admin'), deleteUser);
router.get('/hospitals', auth, authorize('admin'), getAllHospitals);
router.get('/requests', auth, authorize('admin'), getAllRequests);

module.exports = router;

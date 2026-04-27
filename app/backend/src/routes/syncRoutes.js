const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const { pullChanges, pushChanges } = require('../controllers/syncController');

// All sync routes require authentication
router.get('/pull', auth, pullChanges);
router.post('/push', auth, pushChanges);

module.exports = router;

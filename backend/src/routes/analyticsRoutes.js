const express = require('express');
const router = express.Router();
const { getAnalyticsByPeriod } = require('../controllers/analyticsController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getAnalyticsByPeriod);

module.exports = router;
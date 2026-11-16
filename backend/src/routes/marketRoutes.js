const express = require('express');
const router = express.Router();
const { getMarketReferencePrices } = require('../controllers/marketController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/prices', protect, getMarketReferencePrices);

module.exports = router;
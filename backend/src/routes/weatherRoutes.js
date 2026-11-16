const express = require('express');
const router = express.Router();
const { getWeatherByCoords } = require('../controllers/weatherController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getWeatherByCoords);

module.exports = router;
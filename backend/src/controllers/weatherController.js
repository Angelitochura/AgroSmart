const { weatherBreaker } = require('../services/weatherCircuitBreaker');

// @desc    Obtener clima actual y pronóstico protegido con Circuit Breaker
// @route   GET /api/weather?lat=-17.3385&lon=-66.3198
const getWeatherByCoords = async (req, res) => {
  try {
    const lat = req.query.lat || -17.3385;
    const lon = req.query.lon || -66.3198;

    const startTime = Date.now();
    const weatherData = await weatherBreaker.fire(lat, lon);
    const responseTimeMs = Date.now() - startTime;

    res.status(200).json({
      ...weatherData,
      _architecture: {
        ...weatherData._architecture,
        responseTimeMs
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getWeatherByCoords };
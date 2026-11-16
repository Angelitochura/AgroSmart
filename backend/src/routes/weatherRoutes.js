/**
 * @swagger
 * /api/weather:
 *   get:
 *     summary: Obtener pronóstico agroclimático de Open-Meteo (RF-006)
 *     tags: [Clima]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         schema:
 *           type: number
 *           default: -17.3696
 *         description: Latitud de la parcela (Pairumani / Vinto)
 *       - in: query
 *         name: lon
 *         schema:
 *           type: number
 *           default: -66.3209
 *         description: Longitud de la parcela (Pairumani / Vinto)
 *     responses:
 *       200:
 *         description: Pronóstico climático obtenido con éxito
 *       401:
 *         description: No autorizado, sin token
 */
const express = require('express');
const router = express.Router();
const { getWeatherByCoords } = require('../controllers/weatherController');
const { protect } = require('../middlewares/authMiddleware');

router.get('/', protect, getWeatherByCoords);

module.exports = router;
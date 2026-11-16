const express = require('express');
const router = express.Router();
const {
  getCrops,
  createCrop,
  updateCrop,
  deleteCrop
} = require('../controllers/cropController');
const { protect } = require('../middlewares/authMiddleware');

/**
 * @swagger
 * /api/crops:
 *   get:
 *     summary: Obtener el listado de cultivos del usuario (RF-003)
 *     tags: [Cultivos]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de cultivos retornada con éxito
 *       401:
 *         description: No autorizado
 *   post:
 *     summary: Registrar un nuevo cultivo (RF-003)
 *     tags: [Cultivos]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - parcelName
 *               - plantingDate
 *             properties:
 *               name:
 *                 type: string
 *               cropType:
 *                 type: string
 *                 enum: [Flor, Hortaliza, Frutal, Cereal, Otro]
 *               parcelName:
 *                 type: string
 *               plantingDate:
 *                 type: string
 *                 format: date
 *               estimatedHarvestDate:
 *                 type: string
 *                 format: date
 *               notes:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cultivo creado con éxito
 *       400:
 *         description: Datos inválidos
 */
router.route('/').get(protect, getCrops).post(protect, createCrop);

/**
 * @swagger
 * /api/crops/{id}:
 *   put:
 *     summary: Actualizar estado o información de un cultivo (RF-003 / RF-004)
 *     tags: [Cultivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Sembrado, En cuidado, Cosechado]
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cultivo actualizado con éxito
 *       404:
 *         description: Cultivo no encontrado
 *   delete:
 *     summary: Eliminar un cultivo (RF-003)
 *     tags: [Cultivos]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Cultivo eliminado
 *       404:
 *         description: Cultivo no encontrado
 */
router.route('/:id').put(protect, updateCrop).delete(protect, deleteCrop);

module.exports = router;
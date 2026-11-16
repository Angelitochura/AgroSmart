const express = require('express');
const router = express.Router();
const {
  getParcels,
  createParcel,
  updateParcel,
  deleteParcel
} = require('../controllers/parcelController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getParcels)
  .post(protect, createParcel);

router.route('/:id')
  .put(protect, updateParcel)
  .delete(protect, deleteParcel);

module.exports = router;
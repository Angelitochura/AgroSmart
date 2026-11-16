const express = require('express');
const router = express.Router();
const {
  getSupplies,
  createSupply,
  updateSupply,
  deleteSupply
} = require('../controllers/supplyController');
const { protect } = require('../middlewares/authMiddleware');

router.route('/')
  .get(protect, getSupplies)
  .post(protect, createSupply);

router.route('/:id')
  .put(protect, updateSupply)
  .delete(protect, deleteSupply);

module.exports = router;
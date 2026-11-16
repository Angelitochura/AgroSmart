const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  toggleUserStatus
} = require('../controllers/adminController');
const { protect } = require('../middlewares/authMiddleware');

// Middleware local para verificar rol ADMIN
const adminOnly = (req, res, next) => {
  if (req.user && req.user.role === 'ADMIN') {
    next();
  } else {
    res.status(403).json({ message: 'Acceso denegado: se requiere rol Administrador' });
  }
};

router.get('/users', protect, adminOnly, getAllUsers);
router.post('/users', protect, adminOnly, createUserByAdmin);
router.put('/users/:id', protect, adminOnly, updateUserByAdmin);
router.patch('/users/:id/toggle-status', protect, adminOnly, toggleUserStatus);

module.exports = router;
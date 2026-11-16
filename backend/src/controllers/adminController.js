const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Listar todos los usuarios
// @route   GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear usuario desde el panel de administrador
// @route   POST /api/admin/users
const createUserByAdmin = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nombre, correo y contraseña son obligatorios' });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Ya existe un usuario con ese correo' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: role || 'AGRICULTOR',
      isActive: true
    });

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Editar datos o rol de un usuario
// @route   PUT /api/admin/users/:id
const updateUserByAdmin = async (req, res) => {
  try {
    const { name, email, role, password } = req.body;
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (name) user.name = name;
    if (email) user.email = email;
    if (role) user.role = role;

    if (password && password.trim() !== '') {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updated = await user.save();
    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      isActive: updated.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Habilitar o deshabilitar cuenta de usuario
// @route   PATCH /api/admin/users/:id/toggle-status
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    if (user._id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'No puedes deshabilitar tu propia cuenta de administrador' });
    }

    user.isActive = user.isActive === false ? true : false;
    await user.save();

    res.json({
      _id: user._id,
      name: user.name,
      isActive: user.isActive
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllUsers,
  createUserByAdmin,
  updateUserByAdmin,
  toggleUserStatus
};
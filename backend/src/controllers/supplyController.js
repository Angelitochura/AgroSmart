const Supply = require('../models/Supply');

// @desc    Obtener todos los insumos del usuario
// @route   GET /api/supplies
const getSupplies = async (req, res) => {
  try {
    const supplies = await Supply.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(supplies);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear un nuevo insumo
// @route   POST /api/supplies
const createSupply = async (req, res) => {
  try {
    const { name, category, quantity, unit, minStock, notes } = req.body;

    const supply = new Supply({
      user: req.user._id,
      name,
      category,
      quantity,
      unit,
      minStock,
      notes
    });

    const createdSupply = await supply.save();
    res.status(201).json(createdSupply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar un insumo
// @route   PUT /api/supplies/:id
const updateSupply = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);

    if (!supply) {
      return res.status(404).json({ message: 'Insumo no encontrado' });
    }

    if (supply.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    Object.assign(supply, req.body);
    const updatedSupply = await supply.save();
    res.json(updatedSupply);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar un insumo
// @route   DELETE /api/supplies/:id
const deleteSupply = async (req, res) => {
  try {
    const supply = await Supply.findById(req.params.id);

    if (!supply) {
      return res.status(404).json({ message: 'Insumo no encontrado' });
    }

    if (supply.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await supply.deleteOne();
    res.json({ message: 'Insumo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getSupplies,
  createSupply,
  updateSupply,
  deleteSupply
};
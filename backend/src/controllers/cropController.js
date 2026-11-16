const Crop = require('../models/Crop');

// @desc    Obtener todos los cultivos
// @route   GET /api/crops
const getCrops = async (req, res) => {
  try {
    const crops = await Crop.find({}).sort({ createdAt: -1 });
    res.json(crops);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear un nuevo cultivo
// @route   POST /api/crops
const createCrop = async (req, res) => {
  try {
    const {
      name,
      parcelName,
      plantingDate,
      status,
      pricePerUnit,
      unit,
      availableQuantity,
      description
    } = req.body;

    const crop = await Crop.create({
      user: req.user?._id,
      name,
      parcelName,
      plantingDate,
      status,
      pricePerUnit: Number(pricePerUnit) || 0,
      unit: unit || 'Docena',
      availableQuantity: Number(availableQuantity) || 0,
      description
    });

    res.status(201).json(crop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Actualizar un cultivo existente
// @route   PUT /api/crops/:id
const updateCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Cultivo no encontrado' });
    }

    const {
      name,
      parcelName,
      plantingDate,
      status,
      pricePerUnit,
      unit,
      availableQuantity,
      description
    } = req.body;

    crop.name = name ?? crop.name;
    crop.parcelName = parcelName ?? crop.parcelName;
    crop.plantingDate = plantingDate ?? crop.plantingDate;
    crop.status = status ?? crop.status;
    crop.pricePerUnit = pricePerUnit !== undefined ? Number(pricePerUnit) : crop.pricePerUnit;
    crop.unit = unit ?? crop.unit;
    crop.availableQuantity = availableQuantity !== undefined ? Number(availableQuantity) : crop.availableQuantity;
    crop.description = description ?? crop.description;

    const updatedCrop = await crop.save();
    res.json(updatedCrop);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Eliminar un cultivo
// @route   DELETE /api/crops/:id
const deleteCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);
    if (!crop) {
      return res.status(404).json({ message: 'Cultivo no encontrado' });
    }
    await crop.deleteOne();
    res.json({ message: 'Cultivo eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCrops, createCrop, updateCrop, deleteCrop };
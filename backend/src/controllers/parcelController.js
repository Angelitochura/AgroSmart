const Parcel = require('../models/Parcel');

// @desc    Obtener todas las parcelas del usuario
// @route   GET /api/parcels
const getParcels = async (req, res) => {
  try {
    const parcels = await Parcel.find({ user: req.user._id });
    res.json(parcels);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear una nueva parcela
// @route   POST /api/parcels
const createParcel = async (req, res) => {
  try {
    const { name, code, areaSize, unit, soilType, status, latitude, longitude, notes } = req.body;

    const parcel = new Parcel({
      user: req.user._id,
      name,
      code,
      areaSize,
      unit,
      soilType,
      status,
      latitude: latitude || -17.3385,
      longitude: longitude || -66.3198,
      notes
    });

    const createdParcel = await parcel.save();
    res.status(201).json(createdParcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar una parcela
// @route   PUT /api/parcels/:id
const updateParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }

    if (parcel.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    Object.assign(parcel, req.body);
    const updatedParcel = await parcel.save();
    res.json(updatedParcel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar una parcela
// @route   DELETE /api/parcels/:id
const deleteParcel = async (req, res) => {
  try {
    const parcel = await Parcel.findById(req.params.id);

    if (!parcel) {
      return res.status(404).json({ message: 'Parcela no encontrada' });
    }

    if (parcel.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await parcel.deleteOne();
    res.json({ message: 'Parcela eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getParcels,
  createParcel,
  updateParcel,
  deleteParcel
};
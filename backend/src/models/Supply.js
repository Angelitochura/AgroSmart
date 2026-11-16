const mongoose = require('mongoose');

const supplySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'El nombre del insumo es obligatorio'],
    trim: true
  },
  category: {
    type: String,
    enum: ['Fertilizante', 'Pesticida / Fungicida', 'Semillas', 'Herramienta / Equipo', 'Otro'],
    default: 'Fertilizante'
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: 0
  },
  unit: {
    type: String,
    enum: ['kg', 'L', 'g', 'ml', 'unidades', 'sacos'],
    default: 'kg'
  },
  minStock: {
    type: Number,
    required: [true, 'El stock mínimo es obligatorio'],
    default: 10
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Supply', supplySchema);
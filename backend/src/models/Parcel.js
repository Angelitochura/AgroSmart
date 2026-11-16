const mongoose = require('mongoose');

const parcelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: [true, 'El nombre de la parcela es obligatorio'],
    trim: true
  },
  code: {
    type: String,
    required: [true, 'El código identificador es obligatorio'],
    trim: true
  },
  areaSize: {
    type: Number,
    required: [true, 'La superficie es obligatoria']
  },
  unit: {
    type: String,
    enum: ['m2', 'ha'],
    default: 'm2'
  },
  soilType: {
    type: String,
    enum: ['Franco', 'Arcilloso', 'Arenoso', 'Franco-Arcilloso', 'Otro'],
    default: 'Franco'
  },
  status: {
    type: String,
    enum: ['Activa', 'En descanso', 'En preparación'],
    default: 'Activa'
  },
  latitude: {
    type: Number,
    default: -17.3385
  },
  longitude: {
    type: Number,
    default: -66.3198
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Parcel', parcelSchema);
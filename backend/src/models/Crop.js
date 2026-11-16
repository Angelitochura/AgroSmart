const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  parcelName: {
    type: String,
    default: 'Sin asignar'
  },
  plantingDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: 'Sembrado'
  },
  pricePerUnit: {
    type: Number,
    default: 0
  },
  unit: {
    type: String,
    default: 'Docena'
  },
  availableQuantity: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    default: ''
  }
}, { timestamps: true });

module.exports = mongoose.model('Crop', cropSchema);
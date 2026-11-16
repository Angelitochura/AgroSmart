const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  crop: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Crop',
    required: true
  },
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  quantity: {
    type: Number,
    required: [true, 'La cantidad es obligatoria'],
    min: 1
  },
  totalPrice: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['Pendiente', 'Aprobado', 'Rechazado', 'Completado'],
    default: 'Pendiente'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Order', orderSchema);
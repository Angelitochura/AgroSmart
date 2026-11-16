const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'El título de la tarea es obligatorio'],
    trim: true
  },
  taskType: {
    type: String,
    enum: ['Riego', 'Fertilización', 'Fumigación', 'Cosecha', 'Poda', 'Otro'],
    default: 'Riego'
  },
  dueDate: {
    type: Date,
    required: [true, 'La fecha límite es obligatoria']
  },
  cropName: {
    type: String,
    trim: true,
    default: 'General'
  },
  parcelName: {
    type: String,
    trim: true,
    default: 'General'
  },
  completed: {
    type: Boolean,
    default: false
  },
  priority: {
    type: String,
    enum: ['Baja', 'Media', 'Alta'],
    default: 'Media'
  },
  notes: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Task', taskSchema);
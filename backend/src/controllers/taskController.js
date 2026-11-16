const Task = require('../models/Task');

// @desc    Obtener todas las tareas del usuario
// @route   GET /api/tasks
const getTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user._id }).sort({ dueDate: 1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear una nueva tarea
// @route   POST /api/tasks
const createTask = async (req, res) => {
  try {
    const { title, taskType, dueDate, cropName, parcelName, priority, notes } = req.body;

    const task = new Task({
      user: req.user._id,
      title,
      taskType,
      dueDate,
      cropName,
      parcelName,
      priority,
      notes
    });

    const createdTask = await task.save();
    res.status(201).json(createdTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Actualizar/Cambiar estado de una tarea
// @route   PUT /api/tasks/:id
const updateTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    Object.assign(task, req.body);
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Eliminar una tarea
// @route   DELETE /api/tasks/:id
const deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);

    if (!task) {
      return res.status(404).json({ message: 'Tarea no encontrada' });
    }

    if (task.user.toString() !== req.user._id.toString()) {
      return res.status(401).json({ message: 'No autorizado' });
    }

    await task.deleteOne();
    res.json({ message: 'Tarea eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getTasks,
  createTask,
  updateTask,
  deleteTask
};
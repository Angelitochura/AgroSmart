const Order = require('../models/Order');
const Crop = require('../models/Crop');

// @desc    Obtener todas las solicitudes de compra
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('crop', 'name')
      .populate('buyer', 'name')
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Crear una nueva solicitud de compra
// @route   POST /api/orders
const createOrder = async (req, res) => {
  try {
    const { cropId, cropName, quantity, unitPrice, totalPrice, buyerName, notes } = req.body;
    const order = await Order.create({
      crop: cropId,
      cropName,
      buyer: req.user?._id,
      buyerName: buyerName || req.user?.name || 'Comprador',
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalPrice: Number(totalPrice),
      notes,
      status: 'Pendiente'
    });
    res.status(201).json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Aprobar o rechazar una solicitud de compra
// @route   PUT /api/orders/:id
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    const previousStatus = order.status;
    order.status = req.body.status || order.status;
    await order.save();

    // Descontar stock disponible del cultivo si se aprueba por primera vez
    if (previousStatus !== 'Aprobado' && order.status === 'Aprobado' && order.crop) {
      const crop = await Crop.findById(order.crop);
      if (crop && crop.availableQuantity >= order.quantity) {
        crop.availableQuantity -= order.quantity;
        await crop.save();
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getOrders, createOrder, updateOrderStatus };
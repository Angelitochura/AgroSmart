const Order = require('../models/Order');
const Crop = require('../models/Crop');

// @desc    Obtener todas las solicitudes de compra
// @route   GET /api/orders
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({})
      .populate('crop', 'name pricePerUnit unit')
      .populate('buyer', 'name email')
      .populate('farmer', 'name email')
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
    const { cropId, crop, quantity, totalPrice, notes } = req.body;
    const targetCropId = cropId || crop;

    const foundCrop = await Crop.findById(targetCropId);
    if (!foundCrop) {
      return res.status(404).json({ message: 'Producto / cultivo no encontrado' });
    }

    const qty = Number(quantity);
    const calculatedTotal = totalPrice !== undefined
      ? Number(totalPrice)
      : qty * (Number(foundCrop.pricePerUnit) || 0);

    const order = await Order.create({
      buyer: req.user._id,
      crop: foundCrop._id,
      farmer: foundCrop.user || foundCrop.farmer,
      quantity: qty,
      totalPrice: calculatedTotal,
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
      const foundCrop = await Crop.findById(order.crop);
      if (foundCrop && foundCrop.availableQuantity >= order.quantity) {
        foundCrop.availableQuantity -= order.quantity;
        await foundCrop.save();
      }
    }

    res.json(order);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

module.exports = { getOrders, createOrder, updateOrderStatus };
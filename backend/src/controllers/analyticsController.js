const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Task = require('../models/Task');
const Supply = require('../models/Supply');

// @desc    Obtener estadísticas de producción y ventas filtradas por periodo
// @route   GET /api/analytics?startDate=2026-01-01&endDate=2026-12-31
const getAnalyticsByPeriod = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.$gte = startDate ? new Date(`${startDate}T00:00:00.000Z`) : new Date('2000-01-01');
      dateFilter.$lte = endDate ? new Date(`${endDate}T23:59:59.999Z`) : new Date('2100-12-31');
    }

    const orderQuery = startDate || endDate ? { createdAt: dateFilter } : {};
    const cropQuery = startDate || endDate ? { plantingDate: dateFilter } : {};
    const taskQuery = startDate || endDate ? { dueDate: dateFilter } : {};

    const [orders, crops, tasks, supplies] = await Promise.all([
      Order.find(orderQuery).populate('crop', 'name unit'),
      Crop.find(cropQuery),
      Task.find(taskQuery),
      Supply.find({})
    ]);

    // 1. Métricas de Ventas
    const approvedOrders = orders.filter((o) => o.status === 'Aprobado');
    const pendingOrders = orders.filter((o) => o.status === 'Pendiente');
    const rejectedOrders = orders.filter((o) => o.status === 'Rechazado');

    const totalRevenue = approvedOrders.reduce((acc, o) => acc + (o.totalPrice || 0), 0);
    const totalUnitsSold = approvedOrders.reduce((acc, o) => acc + (o.quantity || 0), 0);

    // Agrupar ventas aprobadas por producto
    const salesByProductMap = {};
    approvedOrders.forEach((order) => {
      const productName = order.crop?.name || order.cropName || 'Producto General';
      if (!salesByProductMap[productName]) {
        salesByProductMap[productName] = { name: productName, revenue: 0, units: 0, orders: 0 };
      }
      salesByProductMap[productName].revenue += order.totalPrice || 0;
      salesByProductMap[productName].units += order.quantity || 0;
      salesByProductMap[productName].orders += 1;
    });
    const salesByProduct = Object.values(salesByProductMap).sort((a, b) => b.revenue - a.revenue);

    // Agrupar ventas por mes (YYYY-MM)
    const salesByMonthMap = {};
    approvedOrders.forEach((order) => {
      const d = new Date(order.createdAt);
      const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!salesByMonthMap[monthKey]) {
        salesByMonthMap[monthKey] = { month: monthKey, revenue: 0, count: 0 };
      }
      salesByMonthMap[monthKey].revenue += order.totalPrice || 0;
      salesByMonthMap[monthKey].count += 1;
    });
    const salesByMonth = Object.values(salesByMonthMap).sort((a, b) => a.month.localeCompare(b.month));

    // 2. Métricas de Producción (Cultivos por Estado y Parcela)
    const cropsByStatus = {
      Sembrado: 0,
      'En crecimiento': 0,
      'Listo para cosecha': 0,
      Cosechado: 0
    };
    const productionByParcelMap = {};

    crops.forEach((c) => {
      const st = c.status || 'Sembrado';
      cropsByStatus[st] = (cropsByStatus[st] || 0) + 1;

      const parcel = c.parcelName || 'Sin parcela';
      if (!productionByParcelMap[parcel]) {
        productionByParcelMap[parcel] = { parcel, cropsCount: 0, stockAvailable: 0 };
      }
      productionByParcelMap[parcel].cropsCount += 1;
      productionByParcelMap[parcel].stockAvailable += c.availableQuantity || 0;
    });

    // 3. Eficiencia de Tareas en el periodo
    const completedTasks = tasks.filter((t) => t.completed).length;
    const taskCompletionRate = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 100;

    res.json({
      period: {
        startDate: startDate || 'Inicio',
        endDate: endDate || 'Actualidad'
      },
      summary: {
        totalRevenue,
        totalUnitsSold,
        approvedOrdersCount: approvedOrders.length,
        pendingOrdersCount: pendingOrders.length,
        rejectedOrdersCount: rejectedOrders.length,
        totalCrops: crops.length,
        completedTasks,
        totalTasks: tasks.length,
        taskCompletionRate,
        totalSupplies: supplies.length
      },
      salesByProduct,
      salesByMonth,
      cropsByStatus,
      productionByParcel: Object.values(productionByParcelMap)
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getAnalyticsByPeriod };
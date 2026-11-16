const Crop = require('../models/Crop');

// @desc    Obtener precios de referencia mayoristas y promedio actual del catálogo
// @route   GET /api/market/prices
const getMarketReferencePrices = async (req, res) => {
  try {
    // Base de datos referencial de mercados mayoristas en Bolivia (Vinto/Quillacollo, La Paz, Santa Cruz)
    const referencePrices = [
      {
        id: 'ref-1',
        product: 'Rosas de Exportación (Tallo Largo)',
        category: 'Flores de Corte',
        unit: 'Docena',
        minPrice: 35,
        avgPrice: 45,
        maxPrice: 55,
        market: 'Mercado Mayorista Cochabamba / Quillacollo',
        trend: 'up',
        updatedAt: 'Actualizado hoy'
      },
      {
        id: 'ref-2',
        product: 'Claveles Estándar (Rojos / Blancos)',
        category: 'Flores de Corte',
        unit: 'Paquete (25 tallos)',
        minPrice: 25,
        avgPrice: 32,
        maxPrice: 40,
        market: 'Feria Agrícola Vinto / Pairumani',
        trend: 'stable',
        updatedAt: 'Actualizado hoy'
      },
      {
        id: 'ref-3',
        product: 'Crisantemos / Pompones',
        category: 'Flores de Corte',
        unit: 'Paquete',
        minPrice: 20,
        avgPrice: 28,
        maxPrice: 35,
        market: 'Mercado La Paz / El Alto',
        trend: 'up',
        updatedAt: 'Actualizado hoy'
      },
      {
        id: 'ref-4',
        product: 'Lilium Oriental / Asiático',
        category: 'Flores Premium',
        unit: 'Docena',
        minPrice: 65,
        avgPrice: 80,
        maxPrice: 95,
        market: 'Mercado Mayorista Santa Cruz',
        trend: 'stable',
        updatedAt: 'Actualizado hoy'
      },
      {
        id: 'ref-5',
        product: 'Gladiolos Variados',
        category: 'Flores de Corte',
        unit: 'Docena',
        minPrice: 18,
        avgPrice: 24,
        maxPrice: 30,
        market: 'Mercado Campesino Cochabamba',
        trend: 'down',
        updatedAt: 'Actualizado hoy'
      },
      {
        id: 'ref-6',
        product: 'Follaje Verde / Eucalipto',
        category: 'Follajes',
        unit: 'Paquete',
        minPrice: 12,
        avgPrice: 16,
        maxPrice: 22,
        market: 'Feria Agrícola Vinto',
        trend: 'stable',
        updatedAt: 'Actualizado hoy'
      }
    ];

    // Consultar productos publicados actualmente en AgroSmart para mostrar comparativa real
    const publishedCrops = await Crop.find({ pricePerUnit: { $gt: 0 } }).select('name pricePerUnit unit availableQuantity');

    res.json({
      referencePrices,
      platformCatalog: publishedCrops
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMarketReferencePrices };
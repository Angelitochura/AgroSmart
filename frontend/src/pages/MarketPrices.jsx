import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  Search, 
  Tag, 
  Store,
  Info
} from 'lucide-react';

export default function MarketPrices() {
  const [prices, setPrices] = useState([]);
  const [platformCatalog, setPlatformCatalog] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todas');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const res = await API.get('/market/prices');
        setPrices(res.data.referencePrices || []);
        setPlatformCatalog(res.data.platformCatalog || []);
      } catch (error) {
        console.error('Error al cargar precios de referencia', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMarketData();
  }, []);

  const categories = ['Todas', 'Flores de Corte', 'Flores Premium', 'Follajes'];

  const filteredPrices = prices.filter((item) => {
    const matchesSearch = item.product.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          item.market.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'Todas' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const getTrendBadge = (trend) => {
    if (trend === 'up') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
          <TrendingUp className="h-3 w-3" /> En alza
        </span>
      );
    }
    if (trend === 'down') {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-800 px-2.5 py-0.5 rounded-full">
          <TrendingDown className="h-3 w-3" /> A la baja
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gray-100 text-gray-700 px-2.5 py-0.5 rounded-full">
        <Minus className="h-3 w-3" /> Estable
      </span>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Encabezado */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            <Tag className="h-7 w-7 text-emerald-600" />
            Precios de Referencia del Mercado
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Consulta los rangos mayoristas referenciales en Bolivia para fijar precios competitivos en tu catálogo.
          </p>
        </div>

        {/* Filtros y Buscador */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar flor o mercado..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Precios de Referencia */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Cargando cotizaciones del mercado...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-600">
                    <th className="py-3.5 px-5">Producto / Variedad</th>
                    <th className="py-3.5 px-4">Unidad</th>
                    <th className="py-3.5 px-4">Mínimo</th>
                    <th className="py-3.5 px-4">Promedio Ref.</th>
                    <th className="py-3.5 px-4">Máximo</th>
                    <th className="py-3.5 px-4">Mercado Referencia</th>
                    <th className="py-3.5 px-4">Tendencia</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredPrices.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition">
                      <td className="py-4 px-5">
                        <p className="font-bold text-gray-900">{item.product}</p>
                        <span className="text-[11px] text-emerald-700 font-medium">{item.category}</span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-600 font-medium">{item.unit}</td>
                      <td className="py-4 px-4 text-xs text-gray-500">Bs. {item.minPrice}</td>
                      <td className="py-4 px-4">
                        <span className="text-sm font-black text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                          Bs. {item.avgPrice}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500">Bs. {item.maxPrice}</td>
                      <td className="py-4 px-4 text-xs text-gray-600">{item.market}</td>
                      <td className="py-4 px-4">{getTrendBadge(item.trend)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Comparativa con Ofertas Actuales en AgroSmart */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Store className="h-5 w-5 text-emerald-600" />
              Precios Activos en el Catálogo AgroSmart ({platformCatalog.length})
            </h3>
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Info className="h-3.5 w-3.5" /> Datos en tiempo real de productores registrados
            </span>
          </div>

          {platformCatalog.length === 0 ? (
            <p className="text-xs text-gray-500 py-3">
              Aún no hay cultivos publicados con precio en el catálogo. Edita uno de tus cultivos en el inicio para asignarle precio y verlo comparado aquí.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              {platformCatalog.map((crop) => (
                <div key={crop._id} className="p-3.5 rounded-xl border border-gray-200 bg-gray-50 flex justify-between items-center">
                  <div>
                    <p className="text-xs font-bold text-gray-900">{crop.name}</p>
                    <p className="text-[11px] text-gray-500">Stock: {crop.availableQuantity} {crop.unit}</p>
                  </div>
                  <span className="text-sm font-black text-emerald-700">
                    Bs. {crop.pricePerUnit} <span className="text-[10px] font-normal text-gray-500">/ {crop.unit}</span>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
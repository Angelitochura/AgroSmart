import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { 
  Package, 
  Plus, 
  AlertTriangle, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  TrendingDown
} from 'lucide-react';

export default function Supplies() {
  const [supplies, setSupplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    category: 'Fertilizante',
    quantity: '',
    unit: 'kg',
    minStock: 10,
    notes: ''
  });

  const fetchSupplies = async () => {
    try {
      const response = await API.get('/supplies');
      setSupplies(response.data);
    } catch (error) {
      console.error('Error al cargar inventario', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSupplies();
  }, []);

  const handleOpenModal = (supply = null) => {
    if (supply) {
      setEditingId(supply._id);
      setFormData({
        name: supply.name,
        category: supply.category || 'Fertilizante',
        quantity: supply.quantity,
        unit: supply.unit || 'kg',
        minStock: supply.minStock || 10,
        notes: supply.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        category: 'Fertilizante',
        quantity: '',
        unit: 'kg',
        minStock: 10,
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/supplies/${editingId}`, formData);
      } else {
        await API.post('/supplies', formData);
      }
      setShowModal(false);
      fetchSupplies();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar insumo');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar este insumo?')) {
      try {
        await API.delete(`/supplies/${id}`);
        fetchSupplies();
      } catch (error) {
        alert('Error al eliminar insumo');
      }
    }
  };

  // Métricas
  const lowStockSupplies = supplies.filter(s => s.quantity <= s.minStock);
  const optimalSuppliesCount = supplies.length - lowStockSupplies.length;
  const stockPercentage = supplies.length > 0 
    ? Math.round((optimalSuppliesCount / supplies.length) * 100) 
    : 100;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-7 w-7 text-emerald-600" />
              Inventario de Insumos Agrícolas
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Controla las existencias de fertilizantes, pesticidas, semillas y herramientas.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>+ Nuevo Insumo</span>
          </button>
        </div>

        {/* MÉTRICAS DE STOCK */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-gray-900">{supplies.length}</p>
              <p className="text-xs font-bold text-gray-600">Total de Insumos</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
              <Package className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-emerald-700">{stockPercentage}%</p>
              <p className="text-xs font-bold text-gray-600">Nivel General de Stock</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-rose-600">{lowStockSupplies.length}</p>
              <p className="text-xs font-bold text-gray-600">Insumos con Stock Bajo</p>
            </div>
            <div className="bg-rose-100 p-3 rounded-xl text-rose-700">
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* LISTADO DE INSUMOS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Listado de Insumos</h3>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Cargando inventario...</div>
          ) : supplies.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <Package className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="font-medium text-sm text-gray-600">No hay insumos registrados.</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                + Registrar Insumo
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {supplies.map((supply) => {
                const isLow = supply.quantity <= supply.minStock;

                return (
                  <div 
                    key={supply._id} 
                    className={`p-4 rounded-xl border flex flex-col justify-between transition ${
                      isLow ? 'bg-rose-50/40 border-rose-200' : 'bg-white border-gray-200'
                    }`}
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {supply.category}
                        </span>
                        {isLow ? (
                          <span className="flex items-center space-x-1 text-[10px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full">
                            <TrendingDown className="h-3 w-3" />
                            <span>Stock bajo</span>
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                            Ok
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-gray-900">{supply.name}</h4>

                      <div className="my-3 bg-white p-3 rounded-xl border border-gray-100 flex justify-between items-center">
                        <div>
                          <span className="text-[10px] text-gray-400 block">Cantidad Actual</span>
                          <span className={`text-xl font-black ${isLow ? 'text-rose-600' : 'text-gray-900'}`}>
                            {supply.quantity} <span className="text-xs font-normal text-gray-500">{supply.unit}</span>
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-gray-400 block">Stock Mínimo</span>
                          <span className="text-xs font-bold text-gray-600">{supply.minStock} {supply.unit}</span>
                        </div>
                      </div>

                      {supply.notes && (
                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100 mb-2">
                          "{supply.notes}"
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-3 flex justify-end space-x-1">
                      <button
                        onClick={() => handleOpenModal(supply)}
                        className="p-1.5 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(supply._id)}
                        className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </main>

      {/* MODAL CREAR / EDITAR INSUMO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              {editingId ? 'Editar Insumo' : 'Registrar Nuevo Insumo'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Insumo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ej: Fertilizante NPK 15-15-15"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Categoría</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="Fertilizante">Fertilizante</option>
                  <option value="Pesticida / Fungicida">Pesticida / Fungicida</option>
                  <option value="Semillas">Semillas</option>
                  <option value="Herramienta / Equipo">Herramienta / Equipo</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cantidad</label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ej: 50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unidad</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="kg">kg</option>
                    <option value="L">L</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="unidades">unidades</option>
                    <option value="sacos">sacos</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Stock Mínimo Alerta</label>
                <input
                  type="number"
                  required
                  min="1"
                  value={formData.minStock}
                  onChange={(e) => setFormData({ ...formData, minStock: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ej: 10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notas / Proveedor</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows={2}
                  placeholder="Ej: Adquirido en AgroQuímicos Quillacollo."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                >
                  {editingId ? 'Guardar Cambios' : 'Registrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { Store, ShoppingCart, PackageCheck, Clock, XCircle, Sprout } from 'lucide-react';

export default function BuyerMarketplace() {
  const { user } = useContext(AuthContext);
  const [crops, setCrops] = useState([]);
  const [myOrders, setMyOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedCrop, setSelectedCrop] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');

  const getBoliviaGreeting = () => {
    const boliviaHour = Number(
      new Intl.DateTimeFormat('en-US', {
        timeZone: 'America/La_Paz',
        hour: 'numeric',
        hour12: false
      }).format(new Date())
    );
    if (boliviaHour >= 0 && boliviaHour < 12) return '¡Buenos días';
    if (boliviaHour >= 12 && boliviaHour < 19) return '¡Buenas tardes';
    return '¡Buenas noches';
  };

  const fetchMarketplaceData = async () => {
    try {
      const [cropsRes, ordersRes] = await Promise.all([
        API.get('/crops'),
        API.get('/orders')
      ]);
      // Solo productos publicados en catálogo con precio y stock disponible
      const availableCatalog = cropsRes.data.filter(
        (c) => c.pricePerUnit > 0 && (c.availableQuantity || 0) > 0
      );
      setCrops(availableCatalog);
      setMyOrders(ordersRes.data);
    } catch (error) {
      console.error('Error al cargar catálogo del comprador', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMarketplaceData();
  }, []);

  const handleOpenOrderModal = (crop) => {
    setSelectedCrop(crop);
    setQuantity(1);
    setNotes('');
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!selectedCrop) return;

    try {
      await API.post('/orders', {
        cropId: selectedCrop._id,
        cropName: selectedCrop.name,
        quantity: Number(quantity),
        unitPrice: selectedCrop.pricePerUnit,
        totalPrice: Number(quantity) * selectedCrop.pricePerUnit,
        buyerName: user?.name,
        notes
      });
      setSelectedCrop(null);
      fetchMarketplaceData();
      alert('¡Solicitud de compra enviada al agricultor!');
    } catch (error) {
      alert(error.response?.data?.message || 'Error al enviar solicitud de pedido');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {getBoliviaGreeting()}, {user?.name || 'Comprador'}! 👋
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Catálogo directo de productores agrícolas de Pairumani / Vinto.
          </p>
        </div>

        {/* CATÁLOGO DE PRODUCTOS DISPONIBLES */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
            <Store className="h-5 w-5 text-emerald-600" />
            Productos Disponibles en Catálogo ({crops.length})
          </h2>

          {loading ? (
            <div className="bg-white p-8 rounded-2xl text-center text-gray-500 border border-gray-200">
              Cargando productos disponibles...
            </div>
          ) : crops.length === 0 ? (
            <div className="bg-white p-8 rounded-2xl text-center text-gray-400 border border-gray-200">
              Por el momento no hay cosechas publicadas en venta con stock disponible.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {crops.map((crop) => (
                <div key={crop._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-gray-900 text-lg">{crop.name}</h3>
                      <span className="bg-emerald-100 text-emerald-800 text-xs font-black px-2.5 py-1 rounded-xl">
                        Bs. {crop.pricePerUnit} / {crop.unit || 'Docena'}
                      </span>
                    </div>

                    <p className="text-xs text-gray-600 flex items-center gap-1">
                      <Sprout className="h-3.5 w-3.5 text-emerald-600" />
                      Origen: <strong>{crop.parcelName || 'Pairumani'}</strong> • Disponible: <strong>{crop.availableQuantity} {crop.unit || 'unid.'}</strong>
                    </p>

                    {crop.description && (
                      <p className="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl italic">
                        "{crop.description}"
                      </p>
                    )}
                  </div>

                  <button
                    onClick={() => handleOpenOrderModal(crop)}
                    className="w-full flex items-center justify-center gap-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold py-2.5 rounded-xl transition cursor-pointer"
                  >
                    <ShoppingCart className="h-4 w-4" />
                    <span>Solicitar Pedido</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* MIS PEDIDOS REALIZADOS */}
        <section className="space-y-4">
          <h2 className="text-lg font-bold text-gray-900">Mis Solicitudes de Compra ({myOrders.length})</h2>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
            {myOrders.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                Aún no has realizado solicitudes de pedido.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-600">
                      <th className="py-3 px-5">Producto</th>
                      <th className="py-3 px-4">Cantidad</th>
                      <th className="py-3 px-4">Total</th>
                      <th className="py-3 px-4">Fecha</th>
                      <th className="py-3 px-5">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {myOrders.map((order) => (
                      <tr key={order._id}>
                        <td className="py-3.5 px-5 font-bold text-gray-900">
                          {order.crop?.name || order.cropName || 'Producto'}
                        </td>
                        <td className="py-3.5 px-4 text-xs text-gray-700">{order.quantity} unid.</td>
                        <td className="py-3.5 px-4 font-bold text-emerald-700">Bs. {order.totalPrice}</td>
                        <td className="py-3.5 px-4 text-xs text-gray-500">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="py-3.5 px-5">
                          {order.status === 'Aprobado' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-emerald-100 text-emerald-800 px-2.5 py-0.5 rounded-full">
                              <PackageCheck className="h-3.5 w-3.5" /> Aprobado
                            </span>
                          )}
                          {order.status === 'Pendiente' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
                              <Clock className="h-3.5 w-3.5" /> Pendiente
                            </span>
                          )}
                          {order.status === 'Rechazado' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full">
                              <XCircle className="h-3.5 w-3.5" /> Rechazado
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* MODAL SOLICITAR PEDIDO */}
      {selectedCrop && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Solicitar Compra: {selectedCrop.name}</h3>
            <form onSubmit={handleCreateOrder} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Cantidad ({selectedCrop.unit || 'Docena'}) — Máx: {selectedCrop.availableQuantity}
                </label>
                <input
                  type="number"
                  min="1"
                  max={selectedCrop.availableQuantity}
                  required
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notas de entrega (Opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej: Entrega para florería centro Cochabamba"
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl flex justify-between items-center text-sm">
                <span className="font-semibold text-gray-700">Total a pagar:</span>
                <span className="font-black text-emerald-800 text-lg">
                  Bs. {(Number(quantity || 0) * selectedCrop.pricePerUnit).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedCrop(null)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-bold hover:bg-emerald-800 cursor-pointer"
                >
                  Confirmar Solicitud
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
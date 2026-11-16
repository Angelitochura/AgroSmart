import { useState } from 'react';
import API from '../api/axios';
import { X, CheckCircle, XCircle, Clock, ShoppingBag } from 'lucide-react';

export default function OrdersModal({ orders = [], onClose, onOrderUpdated }) {
  const [updatingId, setUpdatingId] = useState(null);

  const handleUpdateStatus = async (orderId, newStatus) => {
    setUpdatingId(orderId);
    try {
      await API.put(`/orders/${orderId}`, { status: newStatus });
      if (onOrderUpdated) {
        await onOrderUpdated();
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error al actualizar el estado del pedido');
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
        
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center space-x-2">
            <ShoppingBag className="h-5 w-5 text-emerald-700" />
            <h3 className="text-lg font-bold text-gray-900">
              Solicitudes de Compra ({orders.length})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {orders.length === 0 ? (
          <div className="py-10 text-center text-sm text-gray-400">
            No tienes solicitudes de compra registradas.
          </div>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {orders.map((order) => (
              <div
                key={order._id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-gray-900 text-sm">
                      {order.crop?.name || order.cropName || 'Producto agrícola'}
                    </h4>
                    {order.status === 'Pendiente' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                        <Clock className="h-3 w-3" /> Pendiente
                      </span>
                    )}
                    {order.status === 'Aprobado' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        <CheckCircle className="h-3 w-3" /> Aprobado
                      </span>
                    )}
                    {order.status === 'Rechazado' && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold bg-rose-100 text-rose-700 px-2 py-0.5 rounded-full">
                        <XCircle className="h-3 w-3" /> Rechazado
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-gray-600">
                    Comprador: <strong>{order.buyer?.name || order.buyerName || 'Cliente'}</strong> • Cantidad: <strong>{order.quantity} unid.</strong> • Total: <strong className="text-emerald-700">Bs. {order.totalPrice}</strong>
                  </p>

                  {order.notes && (
                    <p className="text-[11px] text-gray-500 italic">"{order.notes}"</p>
                  )}
                </div>

                {order.status === 'Pendiente' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleUpdateStatus(order._id, 'Aprobado')}
                      className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      Aprobar
                    </button>
                    <button
                      disabled={updatingId === order._id}
                      onClick={() => handleUpdateStatus(order._id, 'Rechazado')}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold rounded-lg transition cursor-pointer disabled:opacity-50"
                    >
                      Rechazar
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-end pt-2 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
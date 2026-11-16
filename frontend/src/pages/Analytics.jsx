import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { 
  BarChart3, 
  DollarSign, 
  ShoppingBag, 
  Sprout, 
  CheckCircle2, 
  Calendar,
  Filter,
  Download
} from 'lucide-react';

export default function Analytics() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAnalytics = async (start = startDate, end = endDate) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (start) params.append('startDate', start);
      if (end) params.append('endDate', end);

      const res = await API.get(`/analytics?${params.toString()}`);
      setData(res.data);
    } catch (error) {
      console.error('Error al cargar estadísticas', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchAnalytics(startDate, endDate);
  };

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    fetchAnalytics('', '');
  };

  const handleExportCSV = () => {
    if (!data) return;
    const rows = [
      ['Indicador', 'Valor'],
      ['Periodo Inicio', data.period.startDate],
      ['Periodo Fin', data.period.endDate],
      ['Ingresos Totales (Bs.)', data.summary.totalRevenue],
      ['Unidades Vendidas', data.summary.totalUnitsSold],
      ['Pedidos Aprobados', data.summary.approvedOrdersCount],
      ['Pedidos Pendientes', data.summary.pendingOrdersCount],
      ['Cultivos Registrados', data.summary.totalCrops],
      ['Cumplimiento de Tareas (%)', `${data.summary.taskCompletionRate}%`]
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((r) => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Reporte_AgroSmart_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const maxProductRevenue = data?.salesByProduct?.length > 0 
    ? Math.max(...data.salesByProduct.map((p) => p.revenue), 1) 
    : 1;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BarChart3 className="h-7 w-7 text-emerald-600" />
              Estadísticas de Producción y Ventas
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Analiza el rendimiento económico y agrícola de tus parcelas por periodo de tiempo.
            </p>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center justify-center space-x-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Exportar Reporte CSV</span>
          </button>
        </div>

        {/* Barra de Filtro por Periodo */}
        <form 
          onSubmit={handleFilterSubmit}
          className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row items-end gap-4"
        >
          <div className="w-full sm:w-auto flex-1">
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Desde (Fecha inicio)
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="w-full sm:w-auto flex-1">
            <label className="block text-[11px] font-bold text-gray-600 uppercase mb-1 flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-emerald-600" /> Hasta (Fecha fin)
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-2 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <button
              type="submit"
              className="flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition cursor-pointer flex-1 sm:flex-initial"
            >
              <Filter className="h-4 w-4" />
              <span>Filtrar Periodo</span>
            </button>
            {(startDate || endDate) && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="px-4 py-2.5 border border-gray-300 text-gray-600 hover:bg-gray-50 text-xs font-semibold rounded-xl cursor-pointer"
              >
                Limpiar
              </button>
            )}
          </div>
        </form>

        {loading || !data ? (
          <div className="bg-white rounded-2xl p-10 text-center text-gray-500 border border-gray-200">
            Calculando estadísticas del periodo...
          </div>
        ) : (
          <>
            {/* KPIs DEL PERIODO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
                <div>
                  <p className="text-3xl font-black text-gray-900">Bs. {data.summary.totalRevenue.toLocaleString()}</p>
                  <p className="text-xs font-bold text-gray-600 mt-1">Ingresos en el periodo</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">{data.summary.approvedOrdersCount} venta(s) aprobada(s)</p>
                </div>
                <div className="bg-emerald-100 p-3.5 rounded-2xl text-emerald-700">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
                <div>
                  <p className="text-3xl font-black text-gray-900">{data.summary.totalUnitsSold}</p>
                  <p className="text-xs font-bold text-gray-600 mt-1">Unidades comercializadas</p>
                  <p className="text-[11px] text-amber-600 font-semibold mt-1">{data.summary.pendingOrdersCount} pedido(s) en espera</p>
                </div>
                <div className="bg-blue-100 p-3.5 rounded-2xl text-blue-700">
                  <ShoppingBag className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
                <div>
                  <p className="text-3xl font-black text-gray-900">{data.summary.totalCrops}</p>
                  <p className="text-xs font-bold text-gray-600 mt-1">Cultivos en el periodo</p>
                  <p className="text-[11px] text-gray-400 mt-1">Producción registrada</p>
                </div>
                <div className="bg-emerald-100 p-3.5 rounded-2xl text-emerald-700">
                  <Sprout className="h-6 w-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
                <div>
                  <p className="text-3xl font-black text-gray-900">{data.summary.taskCompletionRate}%</p>
                  <p className="text-xs font-bold text-gray-600 mt-1">Eficiencia de labores</p>
                  <p className="text-[11px] text-emerald-600 font-semibold mt-1">
                    {data.summary.completedTasks} de {data.summary.totalTasks} tareas completadas
                  </p>
                </div>
                <div className="bg-purple-100 p-3.5 rounded-2xl text-purple-700">
                  <CheckCircle2 className="h-6 w-6" />
                </div>
              </div>
            </div>

            {/* GRÁFICOS DE BARRAS Y DISTRIBUCIÓN */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              {/* Ventas por Producto */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-4">
                <h3 className="text-base font-bold text-gray-900">Ingresos por Producto / Variedad</h3>
                
                {data.salesByProduct.length === 0 ? (
                  <p className="text-xs text-gray-400 py-8 text-center">
                    No se registran ventas aprobadas en el rango de fechas seleccionado.
                  </p>
                ) : (
                  <div className="space-y-4">
                    {data.salesByProduct.map((item) => {
                      const widthPct = Math.max(Math.round((item.revenue / maxProductRevenue) * 100), 8);
                      return (
                        <div key={item.name} className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-bold text-gray-800">{item.name}</span>
                            <span className="font-black text-emerald-700">
                              Bs. {item.revenue.toLocaleString()} ({item.units} unid.)
                            </span>
                          </div>
                          <div className="w-full bg-gray-100 h-3 rounded-full overflow-hidden">
                            <div 
                              className="bg-emerald-600 h-full rounded-full transition-all duration-500"
                              style={{ width: `${widthPct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Estado de Producción y Distribución por Parcela */}
              <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs space-y-5">
                <h3 className="text-base font-bold text-gray-900">Estado de Producción Agrícola</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  {Object.entries(data.cropsByStatus).map(([status, count]) => (
                    <div key={status} className="p-3.5 rounded-xl bg-gray-50 border border-gray-200 flex justify-between items-center">
                      <span className="text-xs font-semibold text-gray-700">{status}</span>
                      <span className="text-lg font-black text-emerald-700">{count}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t border-gray-100 pt-4 space-y-2">
                  <h4 className="text-xs font-bold uppercase text-gray-500">Producción por Parcela</h4>
                  {data.productionByParcel.length === 0 ? (
                    <p className="text-xs text-gray-400">Sin cultivos asignados a parcelas en este periodo.</p>
                  ) : (
                    <div className="space-y-2">
                      {data.productionByParcel.map((p) => (
                        <div key={p.parcel} className="flex justify-between items-center text-xs bg-emerald-50/60 px-3.5 py-2.5 rounded-xl border border-emerald-100">
                          <span className="font-bold text-gray-800">🌱 {p.parcel}</span>
                          <span className="text-emerald-800 font-semibold">
                            {p.cropsCount} cultivo(s) • {p.stockAvailable} unid. en catálogo
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>
          </>
        )}

      </main>
    </div>
  );
}
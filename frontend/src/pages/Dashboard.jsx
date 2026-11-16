import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import OrdersModal from '../components/OrdersModal';
import { 
  Sprout, 
  Store, 
  Package, 
  DollarSign, 
  CloudSun, 
  Plus,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit2,
  MapPin,
  CalendarClock,
  BellRing,
  X,
  ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [crops, setCrops] = useState([]);
  const [orders, setOrders] = useState([]);
  const [supplies, setSupplies] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showOrdersModal, setShowOrdersModal] = useState(false);
  const [showCropModal, setShowCropModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [editingCropId, setEditingCropId] = useState(null);

  // Selector de parcela para el clima (RF-006)
  const [selectedParcelId, setSelectedParcelId] = useState('default');
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [weather, setWeather] = useState({
    temp: 16,
    condition: 'Cargando...',
    min: 11,
    max: 24,
    humidity: 80,
    wind: 5,
    alert: {
      level: 'normal',
      title: 'Condiciones climáticas estables',
      message: 'Consultando estación meteorológica...'
    },
    forecast: []
  });

  const [cropForm, setCropForm] = useState({
    name: '',
    parcelName: '',
    plantingDate: new Date().toISOString().split('T')[0],
    status: 'Sembrado',
    pricePerUnit: '',
    unit: 'Docena',
    availableQuantity: '',
    description: ''
  });

  // Saludo dinámico en hora oficial de Bolivia (America/La_Paz - formato 24h)
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

  // Fecha actual formateada en zona horaria de Bolivia
  const getBoliviaFormattedDate = () => {
    return new Intl.DateTimeFormat('es-BO', {
      timeZone: 'America/La_Paz',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date());
  };

  // Consultar clima según coordenadas
  const fetchWeather = async (lat = -17.3385, lon = -66.3198) => {
    setWeatherLoading(true);
    try {
      const res = await API.get(`/weather?lat=${lat}&lon=${lon}`);
      setWeather(res.data);
    } catch (error) {
      console.error('Error al consultar clima de la parcela', error);
    } finally {
      setWeatherLoading(false);
    }
  };

  const fetchData = async () => {
    try {
      const [cropsRes, ordersRes, suppliesRes, parcelsRes, tasksRes] = await Promise.all([
        API.get('/crops'),
        API.get('/orders'),
        API.get('/supplies'),
        API.get('/parcels'),
        API.get('/tasks')
      ]);
      setCrops(cropsRes.data);
      setOrders(ordersRes.data);
      setSupplies(suppliesRes.data);
      setParcels(parcelsRes.data);
      setTasks(tasksRes.data);

      if (parcelsRes.data.length > 0) {
        const firstParcel = parcelsRes.data[0];
        setSelectedParcelId(firstParcel._id);
        await fetchWeather(firstParcel.latitude, firstParcel.longitude);
      } else {
        await fetchWeather(-17.3385, -66.3198);
      }
    } catch (error) {
      console.error('Error al cargar datos del dashboard', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleParcelWeatherChange = (parcelId) => {
    setSelectedParcelId(parcelId);
    if (parcelId === 'default') {
      fetchWeather(-17.3385, -66.3198);
    } else {
      const found = parcels.find(p => p._id === parcelId);
      if (found) {
        fetchWeather(found.latitude || -17.3385, found.longitude || -66.3198);
      }
    }
  };

  const handleOpenCropModal = (crop = null) => {
    if (crop) {
      setEditingCropId(crop._id);
      setCropForm({
        name: crop.name || '',
        parcelName: crop.parcelName || '',
        plantingDate: crop.plantingDate ? crop.plantingDate.split('T')[0] : new Date().toISOString().split('T')[0],
        status: crop.status || 'Sembrado',
        pricePerUnit: crop.pricePerUnit || '',
        unit: crop.unit || 'Docena',
        availableQuantity: crop.availableQuantity || '',
        description: crop.description || ''
      });
    } else {
      setEditingCropId(null);
      setCropForm({
        name: '',
        parcelName: parcels[0]?.name || '',
        plantingDate: new Date().toISOString().split('T')[0],
        status: 'Sembrado',
        pricePerUnit: '',
        unit: 'Docena',
        availableQuantity: '',
        description: ''
      });
    }
    setShowCropModal(true);
  };

  const handleCropSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...cropForm,
        pricePerUnit: cropForm.pricePerUnit ? Number(cropForm.pricePerUnit) : 0,
        availableQuantity: cropForm.availableQuantity ? Number(cropForm.availableQuantity) : 0
      };

      if (editingCropId) {
        await API.put(`/crops/${editingCropId}`, payload);
      } else {
        await API.post('/crops', payload);
      }
      setShowCropModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar el cultivo');
    }
  };

  const handleDeleteCrop = async (id) => {
    if (confirm('¿Estás seguro de eliminar este cultivo?')) {
      try {
        await API.delete(`/crops/${id}`);
        fetchData();
      } catch (error) {
        alert('Error al eliminar el cultivo');
      }
    }
  };

  // --- MOTOR DE ALERTAS AUTOMÁTICAS (RF-007: Clima + Fechas Próximas + Stock) ---
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const in48Hours = new Date(today);
  in48Hours.setDate(today.getDate() + 2);

  const upcomingTasks = tasks.filter((t) => {
    if (t.completed || !t.dueDate) return false;
    const due = new Date(t.dueDate);
    return due <= in48Hours;
  });

  const lowStockSupplies = supplies.filter((s) => s.quantity <= s.minStock);
  const currentParcelObj = parcels.find((p) => p._id === selectedParcelId);

  const activeAlerts = [];

  if (weather.alert?.level && weather.alert.level !== 'normal') {
    activeAlerts.push({
      id: 'weather-alert',
      type: 'clima',
      severity: weather.alert.level,
      title: `${weather.alert.title}${currentParcelObj ? ` (${currentParcelObj.name})` : ''}`,
      description: weather.alert.message,
      actionLabel: 'Ver parcelas',
      actionPath: '/parcels'
    });
  }

  upcomingTasks.forEach((task) => {
    const dueDateObj = new Date(task.dueDate);
    const isOverdue = dueDateObj < today;
    activeAlerts.push({
      id: `task-${task._id}`,
      type: 'fecha',
      severity: isOverdue || task.priority === 'Alta' ? 'danger' : 'warning',
      title: `${isOverdue ? 'Tarea vencida' : 'Fecha próxima'}: ${task.title}`,
      description: `${task.taskType} en ${task.parcelName} (${task.cropName}) • Programada: ${dueDateObj.toLocaleDateString()}`,
      actionLabel: 'Ir a Agenda',
      actionPath: '/tasks'
    });
  });

  lowStockSupplies.forEach((supply) => {
    activeAlerts.push({
      id: `supply-${supply._id}`,
      type: 'stock',
      severity: 'warning',
      title: `Stock bajo: ${supply.name}`,
      description: `Quedan ${supply.quantity} ${supply.unit} (mínimo recomendado: ${supply.minStock} ${supply.unit}).`,
      actionLabel: 'Reponer en Inventario',
      actionPath: '/supplies'
    });
  });

  const hasCriticalAlert = activeAlerts.some((a) => a.severity === 'danger');
  const hasAnyAlert = activeAlerts.length > 0;

  // Cálculos métricos dinámicos
  const activeCropsCount = crops.length;
  const catalogCount = crops.filter((c) => c.pricePerUnit && c.pricePerUnit > 0).length;
  const approvedOrders = orders.filter((o) => o.status === 'Aprobado');
  const totalSales = approvedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);
  const pendingOrdersCount = orders.filter((o) => o.status === 'Pendiente').length;

  const optimalSuppliesCount = supplies.length - lowStockSupplies.length;
  const stockPercentage = supplies.length > 0 
    ? Math.round((optimalSuppliesCount / supplies.length) * 100) 
    : 100;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar 
        pendingOrdersCount={pendingOrdersCount} 
        onOpenOrders={() => setShowOrdersModal(true)} 
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              {getBoliviaGreeting()}, {user?.name || 'Agricultor'}! 👋
            </h1>
            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              📍 Pairumani / Vinto, Quillacollo • {getBoliviaFormattedDate()}
            </p>
          </div>

          <button
            onClick={() => handleOpenCropModal()}
            className="flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>Nuevo cultivo</span>
          </button>
        </div>

        {/* BANNER DE ALERTAS AUTOMÁTICAS (CLIMA + FECHAS PRÓXIMAS + STOCK) */}
        <div className={`border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
          hasCriticalAlert ? 'bg-rose-50 border-rose-200' :
          hasAnyAlert ? 'bg-amber-50 border-amber-200' :
          'bg-emerald-50 border-emerald-200'
        }`}>
          <div className="flex items-center space-x-3">
            <div className={`p-2.5 rounded-xl shrink-0 ${
              hasCriticalAlert ? 'bg-rose-100 text-rose-700' :
              hasAnyAlert ? 'bg-amber-100 text-amber-700' :
              'bg-emerald-100 text-emerald-700'
            }`}>
              {hasAnyAlert ? <BellRing className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
            </div>
            <div>
              <h4 className={`text-sm font-bold ${
                hasCriticalAlert ? 'text-rose-900' :
                hasAnyAlert ? 'text-amber-900' :
                'text-emerald-900'
              }`}>
                {hasAnyAlert 
                  ? `Tienes ${activeAlerts.length} alerta(s) activa(s) que requieren atención`
                  : `Todo en orden • Clima estable en ${currentParcelObj ? currentParcelObj.name : 'tu zona'}`
                }
              </h4>
              <p className={`text-xs ${
                hasCriticalAlert ? 'text-rose-700' :
                hasAnyAlert ? 'text-amber-700' :
                'text-emerald-700'
              }`}>
                {hasAnyAlert 
                  ? activeAlerts[0].title + (activeAlerts.length > 1 ? ` y ${activeAlerts.length - 1} aviso(s) más.` : '.')
                  : 'Sin heladas previstas, sin tareas vencidas en las próximas 48 h y stock óptimo.'
                }
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowAlertsModal(true)}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white shrink-0 transition cursor-pointer ${
              hasCriticalAlert ? 'bg-rose-600 hover:bg-rose-700' :
              hasAnyAlert ? 'bg-amber-600 hover:bg-amber-700' :
              'bg-emerald-700 hover:bg-emerald-800'
            }`}
          >
            {hasAnyAlert ? `Ver alertas (${activeAlerts.length})` : 'Ver monitoreo'}
          </button>
        </div>

        {/* TARJETAS KPI DINÁMICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-3xl font-black text-gray-900">{activeCropsCount}</p>
              <p className="text-xs font-bold text-gray-600 mt-1">Cultivos activos</p>
              <p className="text-[11px] text-gray-400 mt-1">En base de datos</p>
            </div>
            <div className="bg-emerald-100 p-3.5 rounded-2xl text-emerald-700">
              <Sprout className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-3xl font-black text-gray-900">{catalogCount}</p>
              <p className="text-xs font-bold text-gray-600 mt-1">En catálogo de venta</p>
              <p className="text-[11px] font-semibold text-amber-600 mt-1">
                {pendingOrdersCount > 0 ? `${pendingOrdersCount} solicitud(es) pendiente(s)` : 'Sin solicitudes pendientes'}
              </p>
            </div>
            <div className="bg-pink-100 p-3.5 rounded-2xl text-pink-700">
              <Store className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-3xl font-black text-gray-900">{stockPercentage}%</p>
              <p className="text-xs font-bold text-gray-600 mt-1">Insumos en stock</p>
              <p className="text-[11px] font-semibold text-amber-600 mt-1">
                {lowStockSupplies.length > 0 ? `${lowStockSupplies.length} insumo(s) bajo mínimo` : 'Stock en nivel óptimo'}
              </p>
            </div>
            <div className="bg-amber-100 p-3.5 rounded-2xl text-amber-700">
              <Package className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-3xl font-black text-gray-900">Bs. {totalSales.toLocaleString()}</p>
              <p className="text-xs font-bold text-gray-600 mt-1">Ventas este mes</p>
              <p className="text-[11px] font-semibold text-emerald-600 mt-1">↗ Total Aprobado</p>
            </div>
            <div className="bg-emerald-100 p-3.5 rounded-2xl text-emerald-700">
              <DollarSign className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* SECCIÓN INFERIOR: CULTIVOS RECIENTES Y PRONÓSTICO POR PARCELA */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Mis Cultivos ({crops.length})</h3>
            
            {loading ? (
              <div className="bg-white rounded-2xl p-6 text-center text-gray-500 border border-gray-200">
                Cargando cultivos...
              </div>
            ) : crops.length === 0 ? (
              <div className="bg-white rounded-2xl p-8 text-center text-gray-400 border border-gray-200">
                No hay cultivos registrados. Haz clic en "Nuevo cultivo" para empezar.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {crops.map((crop) => (
                  <div key={crop._id} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex flex-col justify-between space-y-3">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <h4 className="font-bold text-gray-900 text-base">{crop.name}</h4>
                        <span className="text-[10px] uppercase font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                          {crop.status || 'Sembrado'}
                        </span>
                      </div>

                      <div className="text-xs text-gray-600 space-y-1">
                        <p>🌱 Parcela: <strong>{crop.parcelName || 'Sin asignar'}</strong></p>
                        <p>📅 Siembra: <strong>{crop.plantingDate ? new Date(crop.plantingDate).toLocaleDateString() : 'N/A'}</strong></p>
                        {crop.pricePerUnit > 0 && (
                          <p className="text-emerald-700 font-semibold">
                            🏷️ Catálogo: Bs. {crop.pricePerUnit} / {crop.unit || 'unidad'} ({crop.availableQuantity || 0} disp.)
                          </p>
                        )}
                      </div>

                      {crop.description && (
                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-xl">
                          "{crop.description}"
                        </p>
                      )}
                    </div>

                    <div className="border-t border-gray-100 pt-2 flex justify-end space-x-1">
                      <button
                        onClick={() => handleOpenCropModal(crop)}
                        className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                        title="Editar cultivo"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCrop(crop._id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                        title="Eliminar cultivo"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tarjeta Widget del Clima Dinámico por Parcela (RF-006) */}
          <div className="bg-emerald-900 text-white rounded-2xl p-6 shadow-md flex flex-col justify-between space-y-4">
            <div>
              <div className="flex justify-between items-start gap-2">
                <div className="w-full">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> PRONÓSTICO POR PARCELA
                  </span>
                  
                  <select
                    value={selectedParcelId}
                    onChange={(e) => handleParcelWeatherChange(e.target.value)}
                    className="mt-1.5 w-full bg-emerald-800/80 border border-emerald-700 text-white text-xs font-semibold rounded-lg px-2.5 py-1.5 outline-none focus:ring-1 focus:ring-emerald-400"
                  >
                    {parcels.length === 0 && (
                      <option value="default">Pairumani / Vinto (General)</option>
                    )}
                    {parcels.map((p) => (
                      <option key={p._id} value={p._id}>
                        {p.name} ({p.code})
                      </option>
                    ))}
                  </select>

                  {currentParcelObj && (
                    <p className="text-[10px] text-emerald-300/80 mt-1">
                      GPS: {currentParcelObj.latitude?.toFixed(4)}, {currentParcelObj.longitude?.toFixed(4)}
                    </p>
                  )}
                </div>
                <CloudSun className="h-8 w-8 text-emerald-300 shrink-0" />
              </div>

              {weatherLoading ? (
                <div className="my-8 text-center text-xs text-emerald-200">
                  Consultando satélite meteorológico...
                </div>
              ) : (
                <>
                  <div className="my-5">
                    <span className="text-5xl font-black">{weather.temp}°C</span>
                    <p className="text-sm font-semibold text-emerald-200 mt-1">
                      {weather.condition} • Mín: {weather.min}°C | Máx: {weather.max}°C
                    </p>
                  </div>

                  {weather.forecast && weather.forecast.length > 1 && (
                    <div className="bg-emerald-950/50 rounded-xl p-3 space-y-1.5 mb-3">
                      <p className="text-[10px] font-bold uppercase text-emerald-400">Próximos días</p>
                      {weather.forecast.slice(1, 4).map((day) => (
                        <div key={day.date} className="flex justify-between text-xs text-emerald-100">
                          <span>{new Date(day.date + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' })}</span>
                          <span className="text-emerald-300 text-[11px]">{day.condition}</span>
                          <span className="font-bold">{day.min}° / {day.max}°</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs border-t border-emerald-800/80 pt-3">
              <div>
                <span className="text-emerald-400 block text-[10px]">Humedad</span>
                <strong className="text-white text-sm">{weather.humidity}%</strong>
              </div>
              <div>
                <span className="text-emerald-400 block text-[10px]">Viento</span>
                <strong className="text-white text-sm">{weather.wind} km/h</strong>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* MODAL DE CENTRO DE ALERTAS AUTOMÁTICAS (RF-007) */}
      {showAlertsModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div className="flex items-center space-x-2">
                <BellRing className="h-5 w-5 text-amber-600" />
                <h3 className="text-lg font-bold text-gray-900">Centro de Alertas Automáticas</h3>
              </div>
              <button
                onClick={() => setShowAlertsModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 rounded-lg cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {activeAlerts.length === 0 ? (
              <div className="py-8 text-center space-y-2">
                <CheckCircle2 className="h-10 w-10 text-emerald-600 mx-auto" />
                <p className="font-bold text-gray-900 text-sm">¡Sin alertas pendientes!</p>
                <p className="text-xs text-gray-500">
                  El clima de tu parcela está estable, no tienes tareas próximas a vencer en las siguientes 48 horas y tus insumos están sobre el mínimo.
                </p>
              </div>
            ) : (
              <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
                {activeAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      alert.severity === 'danger' ? 'bg-rose-50/70 border-rose-200' : 'bg-amber-50/70 border-amber-200'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-1.5">
                        {alert.type === 'fecha' ? (
                          <CalendarClock className="h-4 w-4 text-rose-600 shrink-0" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
                        )}
                        <h4 className="text-xs font-bold text-gray-900">{alert.title}</h4>
                      </div>
                      <p className="text-xs text-gray-600">{alert.description}</p>
                    </div>

                    <button
                      onClick={() => {
                        setShowAlertsModal(false);
                        navigate(alert.actionPath);
                      }}
                      className="flex items-center space-x-1 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 text-[11px] font-bold px-3 py-1.5 rounded-lg shrink-0 cursor-pointer"
                    >
                      <span>{alert.actionLabel}</span>
                      <ArrowRight className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-gray-100">
              <button
                onClick={() => setShowAlertsModal(false)}
                className="px-4 py-2 bg-gray-900 text-white rounded-xl text-xs font-semibold hover:bg-gray-800 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR / EDITAR CULTIVO */}
      {showCropModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 my-8">
            <h3 className="text-xl font-bold text-gray-900">
              {editingCropId ? 'Editar Cultivo' : 'Registrar Nuevo Cultivo'}
            </h3>

            <form onSubmit={handleCropSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre del Cultivo / Variedad</label>
                <input
                  type="text"
                  required
                  value={cropForm.name}
                  onChange={(e) => setCropForm({ ...cropForm, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ej: Claveles Rojos Premium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parcela / Invernadero</label>
                  {parcels.length > 0 ? (
                    <select
                      value={cropForm.parcelName}
                      onChange={(e) => setCropForm({ ...cropForm, parcelName: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                    >
                      <option value="">Seleccionar parcela...</option>
                      {parcels.map(p => (
                        <option key={p._id} value={p.name}>{p.name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={cropForm.parcelName}
                      onChange={(e) => setCropForm({ ...cropForm, parcelName: e.target.value })}
                      className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                      placeholder="Ej: Invernadero A-1"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estado</label>
                  <select
                    value={cropForm.status}
                    onChange={(e) => setCropForm({ ...cropForm, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Sembrado">Sembrado</option>
                    <option value="En crecimiento">En crecimiento</option>
                    <option value="Listo para cosecha">Listo para cosecha</option>
                    <option value="Cosechado">Cosechado</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha de Siembra</label>
                <input
                  type="date"
                  required
                  value={cropForm.plantingDate}
                  onChange={(e) => setCropForm({ ...cropForm, plantingDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-100 space-y-3">
                <p className="text-[11px] font-bold text-emerald-800 uppercase">Datos de Venta / Catálogo (Opcional)</p>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Precio (Bs.)</label>
                    <input
                      type="number"
                      min="0"
                      value={cropForm.pricePerUnit}
                      onChange={(e) => setCropForm({ ...cropForm, pricePerUnit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white outline-none"
                      placeholder="Ej: 45"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Unidad</label>
                    <select
                      value={cropForm.unit}
                      onChange={(e) => setCropForm({ ...cropForm, unit: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white outline-none"
                    >
                      <option value="Docena">Docena</option>
                      <option value="Paquete">Paquete</option>
                      <option value="Kg">Kg</option>
                      <option value="Caja">Caja</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Stock Disp.</label>
                    <input
                      type="number"
                      min="0"
                      value={cropForm.availableQuantity}
                      onChange={(e) => setCropForm({ ...cropForm, availableQuantity: e.target.value })}
                      className="w-full border border-gray-300 rounded-lg p-2 text-xs bg-white outline-none"
                      placeholder="Ej: 30"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Descripción / Notas</label>
                <textarea
                  value={cropForm.description}
                  onChange={(e) => setCropForm({ ...cropForm, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows={2}
                  placeholder="Ej: Cosecha de alta calidad para florerías."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCropModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl text-xs font-semibold text-gray-600 hover:bg-gray-50 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-xl text-xs font-semibold hover:bg-emerald-800 cursor-pointer"
                >
                  {editingCropId ? 'Guardar Cambios' : 'Crear Cultivo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showOrdersModal && (
        <OrdersModal 
          orders={orders} 
          onClose={() => setShowOrdersModal(false)} 
          onOrderUpdated={fetchData}
        />
      )}
    </div>
  );
}
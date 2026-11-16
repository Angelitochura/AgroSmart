import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { 
  MapPin, 
  Plus, 
  Layers, 
  Trash2, 
  Edit2, 
  Maximize2, 
  CheckCircle2,
  Globe
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';

import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

const customIcon = L.icon({
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});

function LocationPicker({ position, onPositionChange }) {
  useMapEvents({
    click(e) {
      onPositionChange(e.latlng.lat, e.latlng.lng);
    },
  });

  return position ? <Marker position={position} icon={customIcon} /> : null;
}

export default function Parcels() {
  const [parcels, setParcels] = useState([]);
  const [crops, setCrops] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const defaultCenter = [-17.3385, -66.3198];

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    areaSize: '',
    unit: 'm2',
    soilType: 'Franco',
    status: 'Activa',
    latitude: defaultCenter[0],
    longitude: defaultCenter[1],
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [parcelsRes, cropsRes] = await Promise.all([
        API.get('/parcels'),
        API.get('/crops')
      ]);
      setParcels(parcelsRes.data);
      setCrops(cropsRes.data);
    } catch (error) {
      console.error('Error al cargar parcelas', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (parcel = null) => {
    if (parcel) {
      setEditingId(parcel._id);
      setFormData({
        name: parcel.name,
        code: parcel.code,
        areaSize: parcel.areaSize,
        unit: parcel.unit || 'm2',
        soilType: parcel.soilType || 'Franco',
        status: parcel.status || 'Activa',
        latitude: parcel.latitude || defaultCenter[0],
        longitude: parcel.longitude || defaultCenter[1],
        notes: parcel.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        name: '',
        code: `P-${Math.floor(100 + Math.random() * 900)}`,
        areaSize: '',
        unit: 'm2',
        soilType: 'Franco',
        status: 'Activa',
        latitude: defaultCenter[0],
        longitude: defaultCenter[1],
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/parcels/${editingId}`, formData);
      } else {
        await API.post('/parcels', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar parcela');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta parcela?')) {
      try {
        await API.delete(`/parcels/${id}`);
        fetchData();
      } catch (error) {
        alert('Error al eliminar parcela');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Layers className="h-7 w-7 text-emerald-600" />
              Mapa Satelital de Parcelas y Lotes
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Visualización georreferenciada en tiempo real de Pairumani / Vinto.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>+ Nueva parcela</span>
          </button>
        </div>

        {/* MÉTRICAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-gray-900">{parcels.length}</p>
              <p className="text-xs font-bold text-gray-600">Total de parcelas</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
              <MapPin className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-gray-900">
                {parcels.reduce((acc, p) => acc + (p.areaSize || 0), 0).toLocaleString()} m²
              </p>
              <p className="text-xs font-bold text-gray-600">Superficie Total</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
              <Maximize2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-gray-900">
                {parcels.filter(p => p.status === 'Activa').length}
              </p>
              <p className="text-xs font-bold text-gray-600">En Producción Activa</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl text-amber-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* VISOR MAPA SATELITAL PRINCIPAL (HÍBRIDO CON NOMBRES Y Z-INDEX FIJO) */}
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-xs p-4 space-y-3">
          <div className="flex items-center space-x-2 text-gray-800 font-bold text-sm">
            <Globe className="h-4 w-4 text-emerald-600" />
            <span>Vista Satelital General - Pairumani / Vinto</span>
          </div>

          <div className="h-80 w-full rounded-xl overflow-hidden border border-gray-200 relative z-0">
            <MapContainer 
              center={defaultCenter} 
              zoom={14} 
              style={{ height: '100%', width: '100%', zIndex: 1 }}
            >
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                attribution="&copy; Esri World Imagery"
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
              />
              <TileLayer
                url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
              />
              {parcels.map((parcel) => (
                <Marker 
                  key={parcel._id} 
                  position={[parcel.latitude || defaultCenter[0], parcel.longitude || defaultCenter[1]]}
                  icon={customIcon}
                >
                  <Popup>
                    <div className="text-xs space-y-1">
                      <strong className="text-emerald-800 text-sm">{parcel.name}</strong> ({parcel.code})
                      <p>Superficie: {parcel.areaSize} {parcel.unit}</p>
                      <p>Suelo: {parcel.soilType}</p>
                      <p>Estado: <strong>{parcel.status}</strong></p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
        </div>

        {/* LISTADO DE TARJETAS */}
        {loading ? (
          <div className="bg-white rounded-2xl p-8 text-center text-gray-500 border border-gray-200">
            Cargando parcelas...
          </div>
        ) : parcels.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-xs">
            <Layers className="h-12 w-12 text-emerald-600 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800">No hay parcelas registradas</h3>
            <p className="text-xs text-gray-500 mt-1 mb-4">Crea tu primer lote o invernadero para organizar tus cultivos.</p>
            <button
              onClick={() => handleOpenModal()}
              className="bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs px-4 py-2 rounded-xl transition"
            >
              + Agregar Parcela
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parcels.map((parcel) => {
              const cropsInParcel = crops.filter(c => 
                c.parcelName?.toLowerCase().trim() === parcel.name.toLowerCase().trim() ||
                c.parcelName?.toLowerCase().trim() === parcel.code.toLowerCase().trim()
              );

              return (
                <div 
                  key={parcel._id} 
                  className="bg-white rounded-2xl border border-gray-200 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div>
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          {parcel.code}
                        </span>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">{parcel.name}</h3>
                      </div>
                      <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                        parcel.status === 'Activa' ? 'bg-emerald-100 text-emerald-800' :
                        parcel.status === 'En descanso' ? 'bg-amber-100 text-amber-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {parcel.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 bg-gray-50 p-3 rounded-xl mb-4">
                      <div>
                        <span className="text-gray-400 block text-[10px]">Superficie:</span>
                        <strong className="text-gray-800">{parcel.areaSize} {parcel.unit}</strong>
                      </div>
                      <div>
                        <span className="text-gray-400 block text-[10px]">Tipo de Suelo:</span>
                        <strong className="text-gray-800">{parcel.soilType}</strong>
                      </div>
                    </div>

                    <div className="space-y-1.5 mb-4">
                      <p className="text-xs font-bold text-gray-700">Cultivos asignados ({cropsInParcel.length}):</p>
                      {cropsInParcel.length === 0 ? (
                        <p className="text-xs text-gray-400 italic">Ningún cultivo asignado actualmente.</p>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {cropsInParcel.map(crop => (
                            <span key={crop._id} className="text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-lg font-medium">
                              🌱 {crop.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {parcel.notes && (
                      <p className="text-xs text-gray-500 italic bg-gray-50 p-2.5 rounded-xl mb-2">
                        "{parcel.notes}"
                      </p>
                    )}
                  </div>

                  <div className="border-t border-gray-100 pt-3 flex justify-end space-x-1">
                    <button
                      onClick={() => handleOpenModal(parcel)}
                      className="p-2 text-gray-500 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(parcel._id)}
                      className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </main>

      {/* MODAL CON Z-INDEX CORRECTO Y SCROLL INTERNO */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4 my-8 relative z-50 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-900">
              {editingId ? 'Editar Parcela' : 'Registrar Nueva Parcela'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre de la Parcela / Invernadero</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ej: Invernadero A-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Código Identificador</label>
                  <input
                    type="text"
                    required
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Estado</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Activa">Activa</option>
                    <option value="En descanso">En descanso</option>
                    <option value="En preparación">En preparación</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Superficie</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.areaSize}
                    onChange={(e) => setFormData({ ...formData, areaSize: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="Ej: 500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Unidad</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="m2">m² (Metros Cuadrados)</option>
                    <option value="ha">ha (Hectáreas)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Suelo</label>
                <select
                  value={formData.soilType}
                  onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="Franco">Franco</option>
                  <option value="Arcilloso">Arcilloso</option>
                  <option value="Arenoso">Arenoso</option>
                  <option value="Franco-Arcilloso">Franco-Arcilloso</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              {/* MAPA INTERACTIVO DENTRO DEL MODAL */}
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  Ubicación exacta (Haz clic en el mapa para marcar)
                </label>
                <div className="h-48 w-full rounded-xl overflow-hidden border border-gray-300 relative z-10">
                  <MapContainer 
                    center={[formData.latitude, formData.longitude]} 
                    zoom={15} 
                    style={{ height: '100%', width: '100%', zIndex: 10 }}
                  >
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
                    />
                    <TileLayer
                      url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
                    />
                    <LocationPicker 
                      position={[formData.latitude, formData.longitude]} 
                      onPositionChange={(lat, lng) => setFormData({ ...formData, latitude: lat, longitude: lng })}
                    />
                  </MapContainer>
                </div>
                <p className="text-[11px] text-gray-500 mt-1">
                  Coordenadas: Lat {formData.latitude.toFixed(4)}, Lon {formData.longitude.toFixed(4)}
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notas / Observaciones</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows={2}
                  placeholder="Ej: Cuenta con sistema de riego por goteo."
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
                  {editingId ? 'Guardar Cambios' : 'Crear Parcela'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
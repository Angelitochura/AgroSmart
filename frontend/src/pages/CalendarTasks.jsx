import { useState, useEffect } from 'react';
import API from '../api/axios';
import Navbar from '../components/Navbar';
import { 
  Calendar as CalendarIcon, 
  Plus, 
  CheckCircle2, 
  Circle, 
  Trash2, 
  Edit2, 
  Droplet, 
  Bug, 
  Sprout, 
  Scissors, 
  Clock,
  AlertCircle
} from 'lucide-react';

export default function CalendarTasks() {
  const [tasks, setTasks] = useState([]);
  const [crops, setCrops] = useState([]);
  const [parcels, setParcels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    taskType: 'Riego',
    dueDate: '',
    cropName: 'General',
    parcelName: 'General',
    priority: 'Media',
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [tasksRes, cropsRes, parcelsRes] = await Promise.all([
        API.get('/tasks'),
        API.get('/crops'),
        API.get('/parcels')
      ]);
      setTasks(tasksRes.data);
      setCrops(cropsRes.data);
      setParcels(parcelsRes.data);
    } catch (error) {
      console.error('Error al cargar agenda de tareas', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingId(task._id);
      setFormData({
        title: task.title,
        taskType: task.taskType || 'Riego',
        dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
        cropName: task.cropName || 'General',
        parcelName: task.parcelName || 'General',
        priority: task.priority || 'Media',
        notes: task.notes || ''
      });
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        taskType: 'Riego',
        dueDate: new Date().toISOString().split('T')[0],
        cropName: crops[0]?.name || 'General',
        parcelName: parcels[0]?.name || 'General',
        priority: 'Media',
        notes: ''
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await API.put(`/tasks/${editingId}`, formData);
      } else {
        await API.post('/tasks', formData);
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar tarea');
    }
  };

  const handleToggleComplete = async (task) => {
    try {
      await API.put(`/tasks/${task._id}`, { completed: !task.completed });
      fetchData();
    } catch (error) {
      alert('Error al actualizar estado de la tarea');
    }
  };

  const handleDelete = async (id) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      try {
        await API.delete(`/tasks/${id}`);
        fetchData();
      } catch (error) {
        alert('Error al eliminar la tarea');
      }
    }
  };

  const getTaskIcon = (type) => {
    switch (type) {
      case 'Riego': return <Droplet className="h-4 w-4 text-blue-600" />;
      case 'Fumigación': return <Bug className="h-4 w-4 text-amber-600" />;
      case 'Fertilización': return <Sprout className="h-4 w-4 text-emerald-600" />;
      case 'Cosecha': return <CheckCircle2 className="h-4 w-4 text-purple-600" />;
      case 'Poda': return <Scissors className="h-4 w-4 text-rose-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const pendingTasks = tasks.filter(t => !t.completed);
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* ENCABEZADO */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <CalendarIcon className="h-7 w-7 text-emerald-600" />
              Calendario de Actividades Agrícolas
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Programa y organiza riegos, fertilizaciones, fumigaciones y tareas de cosecha.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <Plus className="h-5 w-5" />
            <span>+ Nueva Tarea</span>
          </button>
        </div>

        {/* MÉTRICAS DE TAREAS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-gray-900">{pendingTasks.length}</p>
              <p className="text-xs font-bold text-gray-600">Tareas Pendientes</p>
            </div>
            <div className="bg-amber-100 p-3 rounded-xl text-amber-700">
              <Clock className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-emerald-700">{completedTasks.length}</p>
              <p className="text-xs font-bold text-gray-600">Tareas Completadas</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex justify-between items-center">
            <div>
              <p className="text-2xl font-black text-rose-600">
                {pendingTasks.filter(t => t.priority === 'Alta').length}
              </p>
              <p className="text-xs font-bold text-gray-600">Alta Prioridad</p>
            </div>
            <div className="bg-rose-100 p-3 rounded-xl text-rose-700">
              <AlertCircle className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* LISTADO DE TAREAS */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-xs space-y-6">
          <h3 className="text-lg font-bold text-gray-900">Agenda de Labores</h3>

          {loading ? (
            <div className="py-8 text-center text-gray-500">Cargando tareas...</div>
          ) : tasks.length === 0 ? (
            <div className="py-12 text-center text-gray-400">
              <CalendarIcon className="h-10 w-10 mx-auto text-gray-300 mb-2" />
              <p className="font-medium text-sm text-gray-600">No tienes tareas programadas.</p>
              <button
                onClick={() => handleOpenModal()}
                className="mt-3 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold px-4 py-2 rounded-xl transition"
              >
                + Crear primera tarea
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div 
                  key={task._id} 
                  className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition ${
                    task.completed ? 'bg-gray-50 border-gray-200 opacity-75' : 'bg-white border-gray-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <button 
                      onClick={() => handleToggleComplete(task)}
                      className="mt-0.5 text-gray-400 hover:text-emerald-600 transition cursor-pointer"
                    >
                      {task.completed ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-400" />
                      )}
                    </button>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className={`font-bold text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                          {task.title}
                        </span>
                        
                        <span className="flex items-center space-x-1 text-[11px] font-semibold bg-gray-100 text-gray-700 px-2 py-0.5 rounded-md">
                          {getTaskIcon(task.taskType)}
                          <span>{task.taskType}</span>
                        </span>

                        <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${
                          task.priority === 'Alta' ? 'bg-rose-100 text-rose-800' :
                          task.priority === 'Media' ? 'bg-amber-100 text-amber-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {task.priority}
                        </span>
                      </div>

                      <p className="text-xs text-gray-600">
                        Fecha: <strong>{new Date(task.dueDate).toLocaleDateString()}</strong> • Cultivo: <strong>{task.cropName}</strong> • Parcela: <strong>{task.parcelName}</strong>
                      </p>

                      {task.notes && (
                        <p className="text-xs text-gray-500 italic bg-gray-50 p-2 rounded-lg border border-gray-100 mt-1">
                          "{task.notes}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center space-x-1 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => handleOpenModal(task)}
                      className="p-1.5 text-gray-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(task._id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </main>

      {/* MODAL PROGRAMAR / EDITAR TAREA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              {editingId ? 'Editar Tarea' : 'Programar Nueva Tarea'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Título de la Tarea</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="Ej: Riego por goteo matutino"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Tipo de Labor</label>
                  <select
                    value={formData.taskType}
                    onChange={(e) => setFormData({ ...formData, taskType: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Riego">Riego</option>
                    <option value="Fertilización">Fertilización</option>
                    <option value="Fumigación">Fumigación</option>
                    <option value="Cosecha">Cosecha</option>
                    <option value="Poda">Poda</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Prioridad</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="Baja">Baja</option>
                    <option value="Media">Media</option>
                    <option value="Alta">Alta</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Fecha Programada</label>
                <input
                  type="date"
                  required
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Cultivo Asociado</label>
                  <select
                    value={formData.cropName}
                    onChange={(e) => setFormData({ ...formData, cropName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="General">General (Sin cultivo)</option>
                    {crops.map(crop => (
                      <option key={crop._id} value={crop.name}>{crop.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Parcela / Lote</label>
                  <select
                    value={formData.parcelName}
                    onChange={(e) => setFormData({ ...formData, parcelName: e.target.value })}
                    className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                  >
                    <option value="General">General (Sin parcela)</option>
                    {parcels.map(parcel => (
                      <option key={parcel._id} value={parcel.name}>{parcel.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Notas / Instrucciones</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  rows={2}
                  placeholder="Ej: Aplicar 200 ml de fertilizante foliar por hilera."
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
                  {editingId ? 'Guardar Cambios' : 'Programar Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
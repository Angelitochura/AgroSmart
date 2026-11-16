import { useState, useEffect, useContext } from 'react';
import API from '../api/axios';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  ShieldCheck, 
  UserPlus, 
  Edit2, 
  UserX, 
  UserCheck, 
  Search,
  Users
} from 'lucide-react';

export default function AdminPanel() {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('TODOS');

  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'AGRICULTOR'
  });

  const fetchUsers = async () => {
    try {
      const res = await API.get('/admin/users');
      setUsers(res.data);
    } catch (error) {
      console.error('Error al cargar usuarios', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleOpenModal = (userToEdit = null) => {
    if (userToEdit) {
      setEditingUser(userToEdit);
      setFormData({
        name: userToEdit.name,
        email: userToEdit.email,
        password: '',
        role: userToEdit.role
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        role: 'AGRICULTOR'
      });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingUser) {
        await API.put(`/admin/users/${editingUser._id}`, formData);
      } else {
        await API.post('/admin/users', formData);
      }
      setShowModal(false);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al guardar la cuenta de usuario');
    }
  };

  const handleToggleStatus = async (targetUser) => {
    const actionText = targetUser.isActive === false ? 'habilitar' : 'deshabilitar';
    if (!confirm(`¿Seguro que deseas ${actionText} la cuenta de ${targetUser.name}?`)) return;

    try {
      await API.patch(`/admin/users/${targetUser._id}/toggle-status`);
      fetchUsers();
    } catch (error) {
      alert(error.response?.data?.message || 'Error al cambiar el estado del usuario');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch = u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          u.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'TODOS' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const activeCount = users.filter((u) => u.isActive !== false).length;
  const disabledCount = users.filter((u) => u.isActive === false).length;

  return (
    <div className="min-h-screen bg-gray-100 font-sans">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        
        {/* Encabezado */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldCheck className="h-8 w-8 text-emerald-600" />
              Panel de Administración de Usuarios
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Crea, edita roles y habilita o deshabilita el acceso de cuentas en AgroSmart.
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center space-x-2 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold px-5 py-2.5 rounded-xl transition shadow-sm cursor-pointer"
          >
            <UserPlus className="h-5 w-5" />
            <span>+ Nueva Cuenta</span>
          </button>
        </div>

        {/* Resumen Rápido */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-gray-900">{users.length}</p>
              <p className="text-xs font-bold text-gray-500">Total Cuentas Registradas</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-xl text-blue-700">
              <Users className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-emerald-700">{activeCount}</p>
              <p className="text-xs font-bold text-gray-500">Cuentas Activas</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-xl text-emerald-700">
              <UserCheck className="h-6 w-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-rose-600">{disabledCount}</p>
              <p className="text-xs font-bold text-gray-500">Cuentas Deshabilitadas</p>
            </div>
            <div className="bg-rose-100 p-3 rounded-xl text-rose-700">
              <UserX className="h-6 w-6" />
            </div>
          </div>
        </div>

        {/* Buscador y Filtros */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex flex-col sm:flex-row justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 text-gray-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o correo..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {['TODOS', 'AGRICULTOR', 'COMPRADOR', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => setRoleFilter(role)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  roleFilter === role
                    ? 'bg-emerald-700 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Usuarios */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-500 text-sm">Cargando usuarios del sistema...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200 text-[11px] uppercase font-bold text-gray-600">
                    <th className="py-3.5 px-5">Usuario</th>
                    <th className="py-3.5 px-4">Correo Electrónico</th>
                    <th className="py-3.5 px-4">Rol</th>
                    <th className="py-3.5 px-4">Estado</th>
                    <th className="py-3.5 px-4">Registro</th>
                    <th className="py-3.5 px-5 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {filteredUsers.map((u) => {
                    const isDisabled = u.isActive === false;
                    const isSelf = u._id === currentUser?._id;

                    return (
                      <tr key={u._id} className={`transition ${isDisabled ? 'bg-rose-50/30' : 'hover:bg-gray-50/80'}`}>
                        <td className="py-4 px-5 font-bold text-gray-900">
                          {u.name} {isSelf && <span className="text-[10px] text-emerald-700 font-semibold">(Tú)</span>}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-600">{u.email}</td>
                        <td className="py-4 px-4">
                          <span className={`text-[10px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                            u.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                            u.role === 'COMPRADOR' ? 'bg-blue-100 text-blue-800' :
                            'bg-emerald-100 text-emerald-800'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="py-4 px-4">
                          {isDisabled ? (
                            <span className="text-[11px] font-bold bg-rose-100 text-rose-700 px-2.5 py-0.5 rounded-full">
                              Deshabilitado
                            </span>
                          ) : (
                            <span className="text-[11px] font-bold bg-emerald-100 text-emerald-700 px-2.5 py-0.5 rounded-full">
                              Activo
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-4 text-xs text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="py-4 px-5 text-right space-x-2">
                          <button
                            onClick={() => handleOpenModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition cursor-pointer"
                            title="Editar cuenta"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                            <span>Editar</span>
                          </button>

                          {!isSelf && (
                            <button
                              onClick={() => handleToggleStatus(u)}
                              className={`inline-flex items-center gap-1 px-2.5 py-1.5 text-xs font-semibold rounded-lg transition cursor-pointer ${
                                isDisabled
                                  ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                                  : 'bg-rose-100 text-rose-700 hover:bg-rose-200'
                              }`}
                            >
                              {isDisabled ? (
                                <>
                                  <UserCheck className="h-3.5 w-3.5" />
                                  <span>Habilitar</span>
                                </>
                              ) : (
                                <>
                                  <UserX className="h-3.5 w-3.5" />
                                  <span>Deshabilitar</span>
                                </>
                              )}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </main>

      {/* MODAL CREAR / EDITAR CUENTA */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-xl font-bold text-gray-900">
              {editingUser ? 'Editar Cuenta de Usuario' : 'Crear Nueva Cuenta'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">Rol del Sistema</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
                >
                  <option value="AGRICULTOR">AGRICULTOR</option>
                  <option value="COMPRADOR">COMPRADOR</option>
                  <option value="ADMIN">ADMIN (Administrador)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 uppercase mb-1">
                  {editingUser ? 'Nueva Contraseña (dejar vacío para no cambiar)' : 'Contraseña'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full border border-gray-300 rounded-xl p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="••••••••"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-gray-100">
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
                  {editingUser ? 'Guardar Cambios' : 'Crear Cuenta'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
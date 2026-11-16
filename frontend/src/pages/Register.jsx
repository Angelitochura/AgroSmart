import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

export default function Register() {
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('AGRICULTOR');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await register(name, email, password, role);
      navigate(role === 'ADMIN' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al registrar usuario');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-3xl shadow-xl max-w-md w-full p-8 space-y-6 border border-gray-100">
        
        <div className="text-center space-y-2">
          <div className="bg-emerald-100 text-emerald-700 w-14 h-14 rounded-2xl flex items-center justify-center mx-auto">
            <Sprout className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-black text-gray-900">Crear Cuenta en AgroSmart</h1>
          <p className="text-xs text-gray-500">Únete a la plataforma agrícola inteligente</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold p-3 rounded-xl">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="Ej: Norma Mendoza"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="correo@ejemplo.com"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Tipo de Cuenta / Rol</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
            >
              <option value="AGRICULTOR">Agricultor / Productor</option>
              <option value="COMPRADOR">Comprador / Florería</option>
              <option value="ADMIN">Administrador del Sistema</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-300 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-800 hover:bg-emerald-900 text-white font-bold py-3 rounded-xl transition cursor-pointer"
          >
            Registrarse
          </button>
        </form>

        <p className="text-center text-xs text-gray-600">
          ¿Ya tienes una cuenta?{' '}
          <Link to="/login" className="text-emerald-700 font-bold hover:underline">
            Inicia sesión aquí
          </Link>
        </p>

      </div>
    </div>
  );
}
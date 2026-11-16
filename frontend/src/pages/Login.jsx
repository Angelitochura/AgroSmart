import { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Sprout } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Error al iniciar sesión');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-md p-8">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-green-100 p-3 rounded-full text-agroGreen mb-2">
            <Sprout size={36} />
          </div>
          <h2 className="text-2xl font-bold text-gray-800">Bienvenido a AgroSmart</h2>
          <p className="text-sm text-gray-500">Gestión Agrícola y Comercio de Flores</p>
        </div>

        {error && (
          <div className="bg-red-100 text-red-700 p-3 rounded-lg text-sm mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-agroGreen focus:outline-none"
              placeholder="tu@correo.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-agroGreen focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-emerald-700 hover:bg-emerald-800 text-white font-semibold py-2 px-4 rounded-lg transition cursor-pointer"
>
            Iniciar Sesión
          </button>
        </form>

        <p className="text-sm text-center text-gray-600 mt-6">
          ¿No tienes una cuenta?{' '}
          <Link to="/register" className="text-agroGreen font-semibold hover:underline">
            Regístrate aquí
          </Link>
        </p>
      </div>
    </div>
  );
}
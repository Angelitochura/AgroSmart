import { useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Sprout, 
  Package, 
  Store,
  Map, 
  Calendar, 
  Tag,
  BarChart3,
  ShieldCheck,
  Bell, 
  LogOut 
} from 'lucide-react';

export default function Navbar({ pendingOrdersCount = 0, onOpenOrders }) {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const role = (user?.role || user?.user?.role || '').toUpperCase();
  const displayName = user?.name || user?.user?.name || 'Usuario';

  let navItems = [];

  if (role === 'COMPRADOR') {
    navItems = [
      { label: 'Catálogo', icon: Store, path: '/dashboard' },
      { label: 'Precios Ref.', icon: Tag, path: '/market-prices' },
    ];
  } else if (role === 'ADMIN') {
    navItems = [
      { label: 'Usuarios', icon: ShieldCheck, path: '/admin' },
      { label: 'Precios Ref.', icon: Tag, path: '/market-prices' },
    ];
  } else {
    navItems = [
      { label: 'Cultivos', icon: Sprout, path: '/dashboard' },
      { label: 'Parcelas', icon: Map, path: '/parcels' },
      { label: 'Agenda / Tareas', icon: Calendar, path: '/tasks' },
      { label: 'Inventario', icon: Package, path: '/supplies' },
      { label: 'Precios Ref.', icon: Tag, path: '/market-prices' },
      { label: 'Estadísticas', icon: BarChart3, path: '/analytics' },
    ];
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo y Nombre */}
          <div 
            onClick={() => navigate('/dashboard')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-sm">
              <Sprout className="h-6 w-6" />
            </div>
            <span className="text-xl font-bold text-gray-900 tracking-tight">
              Agro<span className="text-emerald-600">Smart</span>
            </span>
          </div>

          {/* Enlaces de Navegación según Rol */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              return (
                <button
                  key={item.label}
                  onClick={() => navigate(item.path)}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700 font-semibold'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Controles Derecha (Campana solo para Agricultor, Perfil y Salir) */}
          <div className="flex items-center space-x-4">
            {role === 'AGRICULTOR' && (
              <button 
                onClick={onOpenOrders}
                className="p-2 text-gray-500 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition relative cursor-pointer"
                title="Notificaciones / Solicitudes"
              >
                <Bell className="h-5 w-5" />
                {pendingOrdersCount > 0 && (
                  <span className="absolute top-1 right-1 h-4 w-4 bg-amber-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {pendingOrdersCount}
                  </span>
                )}
              </button>
            )}

            <div className="flex items-center space-x-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-200">
              <div className="bg-emerald-700 text-white font-bold h-8 w-8 rounded-full flex items-center justify-center text-xs">
                {displayName ? displayName.substring(0, 2).toUpperCase() : 'US'}
              </div>
              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-gray-800 leading-tight">{displayName}</p>
                <span className="text-[10px] uppercase font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">
                  {role || 'USUARIO'}
                </span>
              </div>
            </div>

            <button
              onClick={logout}
              className="flex items-center space-x-1 text-sm bg-red-50 text-red-600 hover:bg-red-100 px-3 py-1.5 rounded-lg transition font-medium cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
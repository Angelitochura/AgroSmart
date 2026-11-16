import { useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BuyerMarketplace from './pages/BuyerMarketplace';
import Parcels from './pages/Parcels';
import CalendarTasks from './pages/CalendarTasks';
import Supplies from './pages/Supplies';
import MarketPrices from './pages/MarketPrices';
import Analytics from './pages/Analytics';
import AdminPanel from './pages/AdminPanel';
import ProtectedRoute from './components/ProtectedRoute';

function RoleHome() {
  const { user } = useContext(AuthContext);
  const role = (user?.role || user?.user?.role || '').toUpperCase();

  if (role === 'COMPRADOR') return <BuyerMarketplace />;
  if (role === 'ADMIN') return <AdminPanel />;
  return <Dashboard />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <RoleHome />
              </ProtectedRoute>
            } 
          />
          <Route path="/parcels" element={<ProtectedRoute><Parcels /></ProtectedRoute>} />
          <Route path="/tasks" element={<ProtectedRoute><CalendarTasks /></ProtectedRoute>} />
          <Route path="/supplies" element={<ProtectedRoute><Supplies /></ProtectedRoute>} />
          <Route path="/market-prices" element={<ProtectedRoute><MarketPrices /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute><AdminPanel /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
// Spendor — App
// Same routing as before. Bottom-nav padding bumped to match the new nav
// height; spinner accent switched to mint to match the global vibe.

import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import BottomNav from './components/BottomNav';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import ScanReceiptPage from './pages/ScanReceiptPage';
import ResistedPage from './pages/ResistedPage';
import WaitingListPage from './pages/WaitingListPage';
import InsightsPage from './pages/InsightsPage';
import ProfilePage from './pages/ProfilePage';

function ProtectedLayout() {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-green/30 border-t-green rounded-full animate-spin" />
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return (
    <div className="min-h-screen pb-24">
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/scan" element={<ScanReceiptPage />} />
        <Route path="/resisted" element={<ResistedPage />} />
        <Route path="/waiting" element={<WaitingListPage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
      <BottomNav />
    </div>
  );
}

function AppRoutes() {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage />} />
      <Route path="/*" element={<ProtectedLayout />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

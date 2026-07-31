import { ReactNode, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { isSupabaseConfigured } from './lib/supabase';

// Components & Pages
import Layout from './components/Layout';
import SetupRequired from './components/SetupRequired';
import Login from './components/Login';
import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Rooms from './pages/Rooms';
import Payments from './pages/Payments';
import History from './pages/History';
import Documents from './pages/Documents';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MyProfile from './pages/MyProfile';
import UserAccess from './pages/UserAccess';
import ActivityLogs from './pages/ActivityLogs';
import SplashScreen from './components/SplashScreen';

function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, loading, accessDeniedMessage } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F8F7] dark:bg-dark-canvas">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#23796F] dark:border-emerald-500"></div>
      </div>
    );
  }

  if (accessDeniedMessage || !user) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AdminOnlyRoute({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth();
  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  if (!isSupabaseConfigured()) {
    return <SetupRequired />;
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="profile" element={<MyProfile />} />
          <Route path="members" element={<Members />} />
          <Route path="rooms" element={<Rooms />} />
          <Route path="payments" element={<Payments />} />
          <Route path="history" element={<History />} />
          <Route path="documents" element={<Documents />} />
          <Route path="reports" element={<AdminOnlyRoute><Reports /></AdminOnlyRoute>} />
          <Route path="user-access" element={<AdminOnlyRoute><UserAccess /></AdminOnlyRoute>} />
          <Route path="activity-logs" element={<AdminOnlyRoute><ActivityLogs /></AdminOnlyRoute>} />
          <Route path="settings" element={<AdminOnlyRoute><Settings /></AdminOnlyRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <ThemeProvider>
      <AuthProvider>
        {showSplash ? (
          <SplashScreen onComplete={() => setShowSplash(false)} />
        ) : (
          <AppRoutes />
        )}
      </AuthProvider>
    </ThemeProvider>
  );
}

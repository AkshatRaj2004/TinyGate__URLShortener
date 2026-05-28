import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';

import ProtectedRoute    from './components/layout/ProtectedRoute';
import DashboardLayout   from './components/layout/DashboardLayout';

import Home      from './pages/Home';
import Login     from './pages/Login';
import Register  from './pages/Register';
import Dashboard from './pages/Dashboard';
import Links     from './pages/Links';
import Analytics from './pages/Analytics';
import NotFound  from './pages/NotFound';

const App = () => (
  <AuthProvider>
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/"         element={<Home />} />
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected — all nested under DashboardLayout */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard"                       element={<Dashboard />} />
            <Route path="/dashboard/links"                 element={<Links />} />
            <Route path="/dashboard/analytics/:id"         element={<Analytics />} />
            {/* Redirect /dashboard/* unknowns to dashboard */}
            <Route path="/dashboard/*"                     element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>

    <Toaster
      position="top-right"
      toastOptions={{
        duration: 3500,
        style: {
          background: '#1a1a2e',
          color: '#f3f4f6',
          border: '1px solid rgba(147,51,234,0.25)',
          borderRadius: '12px',
          fontSize: '14px',
          backdropFilter: 'blur(12px)',
        },
        success: {
          iconTheme: { primary: '#10b981', secondary: '#1a1a2e' },
        },
        error: {
          iconTheme: { primary: '#ef4444', secondary: '#1a1a2e' },
        },
      }}
    />
  </AuthProvider>
);

export default App;

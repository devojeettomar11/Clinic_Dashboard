import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import useAuthStore from './features/auth/store/authStore';
import LoginPage from './pages/LoginPage';

import {
  ClinicLayout,
  ClinicDashboardPage,
  PackagesPage,
  LabTestsPage,
  BookingsPage,
  BookingDetailPage,
  RevenuePage,
  ClinicSetupPage,
  SettingsPage,
} from './features/clinic';

// ── Guards ────────────────────────────────────────────────────────────────────
const PrivateRoute = ({ children }) => {
  const { token } = useAuthStore();
  return token ? children : <Navigate to="/login" replace />;
};

const PublicRoute = ({ children }) => {
  const { token } = useAuthStore();
  return !token ? children : <Navigate to="/clinic/dashboard" replace />;
};

// ── App ────────────────────────────────────────────────────────────────────────
export default function App() {
  const { fetchUser, token } = useAuthStore();

  useEffect(() => {
    if (token) fetchUser();
  }, [token]);

  return (
    <ToastProvider>
      <BrowserRouter>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

          {/* Clinic Admin */}
          <Route
            path="/clinic"
            element={<PrivateRoute><ClinicLayout /></PrivateRoute>}
          >
            <Route index element={<Navigate to="dashboard" replace />} />
            <Route path="dashboard" element={<ClinicDashboardPage />} />
            <Route path="packages"  element={<PackagesPage />} />
            <Route path="lab-tests" element={<LabTestsPage />} />
            <Route path="bookings"  element={<BookingsPage />} />
            <Route path="bookings/:id" element={<BookingDetailPage />} />
            <Route path="revenue"   element={<RevenuePage />} />
            <Route path="setup"     element={<ClinicSetupPage />} />
            <Route path="settings"  element={<SettingsPage />} />
          </Route>

          {/* Default redirect */}
          <Route path="/"  element={<Navigate to="/clinic/dashboard" replace />} />
          <Route path="*"  element={<Navigate to="/clinic/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

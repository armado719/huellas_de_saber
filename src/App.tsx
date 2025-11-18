import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Estudiantes from './pages/Estudiantes';
import Profesores from './pages/Profesores';
import Asistencia from './pages/Asistencia';
import Calificaciones from './pages/Calificaciones';
import Boletines from './pages/Boletines';
import Horarios from './pages/Horarios';
import Mensajes from './pages/Mensajes';
import Pagos from './pages/Pagos';
import Recursos from './pages/Recursos';

const AppRoutes: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Login />}
      />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/estudiantes"
        element={
          <ProtectedRoute>
            <Layout>
              <Estudiantes />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/profesores"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Profesores />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/asistencia"
        element={
          <ProtectedRoute>
            <Layout>
              <Asistencia />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/calificaciones"
        element={
          <ProtectedRoute>
            <Layout>
              <Calificaciones />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/boletines"
        element={
          <ProtectedRoute>
            <Layout>
              <Boletines />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/horarios"
        element={
          <ProtectedRoute>
            <Layout>
              <Horarios />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/mensajes"
        element={
          <ProtectedRoute>
            <Layout>
              <Mensajes />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/pagos"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <Layout>
              <Pagos />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route
        path="/recursos"
        element={
          <ProtectedRoute>
            <Layout>
              <Recursos />
            </Layout>
          </ProtectedRoute>
        }
      />

      <Route path="/" element={<Navigate to="/dashboard" />} />
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;

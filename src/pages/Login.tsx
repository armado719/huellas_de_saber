import { AlertCircle, Lock, Mail } from 'lucide-react';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { DATOS_COLEGIO } from '../types';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const success = await login(email, password);

    if (success) {
      navigate('/dashboard');
    } else {
      setError('Credenciales inválidas');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-4 border-primary">
        <div className="bg-primary p-8 text-white text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white rounded-full p-4 shadow-lg">
              <img
                src="/images/escudo.png"
                alt="Escudo Huellas Del Saber"
                className="w-16 h-16 object-contain"
              />
            </div>
          </div>
          <h1 className="text-2xl font-bold mb-2 drop-shadow-lg">{DATOS_COLEGIO.nombreCompleto}</h1>
          <p className="text-sm mt-2 opacity-90">Sistema de Gestión Escolar</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8">
          <div className="mb-6">
            <label className="label">
              <Mail className="w-4 h-4 inline mr-2" />
              Correo Electrónico
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-field"
              placeholder="correo@huellasdelsaber.edu.co"
              required
            />
          </div>

          <div className="mb-6">
            <label className="label">
              <Lock className="w-4 h-4 inline mr-2" />
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center text-red-700">
              <AlertCircle className="w-5 h-5 mr-2" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
          </button>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-600 text-center">
              <strong>Demo credenciales:</strong>
            </p>
            <p className="text-xs text-gray-500 mt-2">
              Admin: admin@huellasdelsaber.edu.co / admin123
            </p>
            <p className="text-xs text-gray-500">
              Profesor: profesor@huellasdelsaber.edu.co / profesor123
            </p>
          </div>
        </form>

        <div className="bg-gray-50 px-8 py-6 text-center text-xs text-gray-700">
          <p className="font-semibold text-sm mb-2">{DATOS_COLEGIO.nombreCompleto}</p>
          <p className="mb-1">NIT: {DATOS_COLEGIO.nit}</p>
          <p className="mb-1">{DATOS_COLEGIO.direccion}</p>
          <p className="mb-1">{DATOS_COLEGIO.ciudad}, {DATOS_COLEGIO.departamento}</p>
          <p className="mb-1">Tel: {DATOS_COLEGIO.telefono}</p>
          <p>{DATOS_COLEGIO.email}</p>
        </div>
      </div>
    </div>
  );
};

export default Login;

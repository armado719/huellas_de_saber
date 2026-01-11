import {
    AlertCircle,
    Calendar,
    TrendingDown,
    TrendingUp,
    UserCheck,
    Users,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { estudiantesService } from '../services/estudiantesService';
import { pagosService } from '../services/pagosService';
import { profesoresService } from '../services/profesoresService';
import { Estudiante, Nivel, Pago, Profesor } from '../types';

const Dashboard: React.FC = () => {
  const [estudiantes, setEstudiantes] = useState<Estudiante[]>([]);
  const [profesores, setProfesores] = useState<Profesor[]>([]);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError(null);

      const [estudiantesData, profesoresData, pagosData] = await Promise.all([
        estudiantesService.getAll(),
        profesoresService.getAll(),
        pagosService.getAll(),
      ]);

      setEstudiantes(estudiantesData);
      setProfesores(profesoresData);
      setPagos(pagosData);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const totalEstudiantes = estudiantes.filter((e) => e.activo).length;
  const totalProfesores = profesores.filter((p) => p.activo).length;

  const estudiantesPorNivel = estudiantes
    .filter((e) => e.activo)
    .reduce((acc, est) => {
      acc[est.nivel] = (acc[est.nivel] || 0) + 1;
      return acc;
    }, {} as Record<Nivel, number>);

  const pagosPagados = pagos
    .filter((p) => p.estado === 'pagado')
    .reduce((sum, p) => sum + p.monto, 0);

  const pagosPendientes = pagos
    .filter((p) => p.estado !== 'pagado')
    .reduce((sum, p) => sum + (p.monto - (p.montoPagado || 0)), 0);

  // Asistencia hoy - por ahora usamos un valor por defecto
  // TODO: Implementar cuando el endpoint de asistencia esté listo
  const porcentajeAsistencia = 0;

  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Párvulos'];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Dashboard</h1>
        <p className="text-gray-600">
          Bienvenido al sistema de gestión escolar
        </p>
      </div>

      {/* Indicadores de Loading y Error */}
      {loading && (
        <div className="card text-center py-8">
          <p className="text-gray-600">Cargando estadísticas...</p>
        </div>
      )}

      {error && (
        <div className="card text-center py-8 bg-red-50">
          <p className="text-red-600">{error}</p>
          <button onClick={cargarDatos} className="btn-primary mt-4">
            Reintentar
          </button>
        </div>
      )}

      {/* Stats Cards */}
      {!loading && !error && (
      <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card bg-primary text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Estudiantes</p>
              <p className="text-3xl font-bold">{totalEstudiantes}</p>
            </div>
            <Users className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-primary text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Total Profesores</p>
              <p className="text-3xl font-bold">{totalProfesores}</p>
            </div>
            <UserCheck className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-primary text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Asistencia Hoy</p>
              <p className="text-3xl font-bold">{porcentajeAsistencia}%</p>
            </div>
            <Calendar className="w-12 h-12 opacity-80" />
          </div>
        </div>

        <div className="card bg-primary text-white shadow-xl hover:shadow-2xl transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Pagos Recaudados</p>
              <p className="text-2xl font-bold">
                ${(pagosPagados / 1000000).toFixed(1)}M
              </p>
            </div>
            <TrendingUp className="w-12 h-12 opacity-80" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Estudiantes por Nivel */}
        <div className="card border-t-4 border-primary">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <Users className="w-6 h-6 text-primary mr-2" />
            Estudiantes por Nivel
          </h2>
          <div className="space-y-3">
            {niveles.map((nivel, index) => {
              const count = estudiantesPorNivel[nivel] || 0;
              const percentage = (count / totalEstudiantes) * 100;
              const colors = ['bg-primary', 'bg-primary/80', 'bg-primary/60', 'bg-primary/90'];
              return (
                <div key={nivel}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {nivel}
                    </span>
                    <span className="text-sm font-bold text-primary">
                      {count} estudiantes
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className={`${colors[index]} h-3 rounded-full transition-all shadow-sm`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Estado de Pagos */}
        <div className="card border-t-4 border-primary">
          <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
            <TrendingUp className="w-6 h-6 text-primary mr-2" />
            Estado de Pagos
          </h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border-l-4 border-green-500">
              <div>
                <p className="text-sm text-gray-600">Pagos Recibidos</p>
                <p className="text-2xl font-bold text-green-700">
                  ${pagosPagados.toLocaleString('es-CO')}
                </p>
              </div>
              <TrendingUp className="w-10 h-10 text-green-500" />
            </div>

            <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg border-l-4 border-red-500">
              <div>
                <p className="text-sm text-gray-600">Pagos Pendientes</p>
                <p className="text-2xl font-bold text-red-700">
                  ${pagosPendientes.toLocaleString('es-CO')}
                </p>
              </div>
              <TrendingDown className="w-10 h-10 text-red-500" />
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Total Esperado</p>
              <p className="text-xl font-bold text-blue-700">
                ${(pagosPagados + pagosPendientes).toLocaleString('es-CO')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alertas y Notificaciones */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <AlertCircle className="w-6 h-6 text-secondary mr-2" />
          Alertas Recientes
        </h2>
        <div className="space-y-3">
          <div className="flex items-start p-3 bg-yellow-50 border-l-4 border-yellow-500 rounded">
            <AlertCircle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">
                {pagos.filter((p) => p.estado === 'vencido').length} pagos vencidos
              </p>
              <p className="text-sm text-gray-600">
                Revisar sección de pagos para más detalles
              </p>
            </div>
          </div>

          <div className="flex items-start p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
            <Calendar className="w-5 h-5 text-blue-600 mr-3 mt-0.5" />
            <div>
              <p className="font-semibold text-gray-800">
                Próxima reunión de padres
              </p>
              <p className="text-sm text-gray-600">
                Programada para el 20 de abril - Entrega de boletines
              </p>
            </div>
          </div>
        </div>
      </div>
      </>
      )}
    </div>
  );
};

export default Dashboard;

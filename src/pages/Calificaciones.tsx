import {
  AlertTriangle,
  GraduationCap,
  Loader2,
  Save,
  Search,
  X,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { estudiantesService } from '../services/estudiantesService';
import { Calificacion, CalificacionDetalle, Dimension, Estudiante, Nivel, Periodo, Valoracion } from '../types';

const Calificaciones: React.FC = () => {
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel>('Transición');
  const [periodoSeleccionado, setPeriodoSeleccionado] = useState<Periodo>(1);
  const [añoSeleccionado, setAñoSeleccionado] = useState(2024);
  const [showModal, setShowModal] = useState(false);
  const [estudianteSeleccionado, setEstudianteSeleccionado] = useState<string | null>(null);
  const [calificaciones, setCalificaciones] = useState<Calificacion[]>([]);
  const [estudiantes, setEstudiantes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const estudiantesData = await estudiantesService.getAll();
      setEstudiantes(estudiantesData);
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar los datos. Por favor, intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Transición'];
  const dimensiones: Dimension[] = [
    'Cognitiva',
    'Comunicativa',
    'Corporal',
    'Socio-Afectiva',
    'Estética',
    'Ética',
  ];

  const estudiantesDelNivel = estudiantes.filter(
    (est) =>
      est.nivel === nivelSeleccionado &&
      est.activo &&
      (searchTerm === '' ||
        est.nombres.toLowerCase().includes(searchTerm.toLowerCase()) ||
        est.apellidos.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const getCalificacion = (estudianteId: string) => {
    return calificaciones.find(
      (cal) =>
        cal.estudianteId === estudianteId &&
        cal.periodo === periodoSeleccionado &&
        cal.año === añoSeleccionado
    );
  };

  const getValoracionColor = (valoracion: Valoracion) => {
    switch (valoracion) {
      case 'Superior':
        return 'bg-green-500';
      case 'Alto':
        return 'bg-blue-500';
      case 'Básico':
        return 'bg-yellow-500';
      case 'Bajo':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <div className="alert alert-error">
          <AlertTriangle className="w-4 h-4 inline mr-2" />
          {error}
        </div>
      )}
      {isLoading ? (
        <div className="flex justify-center items-center h-full">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : (
        <>
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <GraduationCap className="w-8 h-8 text-primary mr-3" />
          Sistema de Calificaciones
        </h1>
        <p className="text-gray-600">
          Gestiona las calificaciones por dimensiones de cada estudiante
        </p>
      </div>

      {/* Filtros */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">Nivel</label>
            <select
              value={nivelSeleccionado}
              onChange={(e) => setNivelSeleccionado(e.target.value as Nivel)}
              className="input-field"
            >
              {niveles.map((nivel) => (
                <option key={nivel} value={nivel}>
                  {nivel}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Periodo</label>
            <select
              value={periodoSeleccionado}
              onChange={(e) => setPeriodoSeleccionado(Number(e.target.value) as Periodo)}
              className="input-field"
            >
              <option value={1}>Periodo 1</option>
              <option value={2}>Periodo 2</option>
              <option value={3}>Periodo 3</option>
              <option value={4}>Periodo 4</option>
            </select>
          </div>
          <div>
            <label className="label">Año</label>
            <select
              value={añoSeleccionado}
              onChange={(e) => setAñoSeleccionado(Number(e.target.value))}
              className="input-field"
            >
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </div>
          <div>
            <label className="label">
              <Search className="w-4 h-4 inline mr-2" />
              Buscar
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field"
              placeholder="Buscar estudiante..."
            />
          </div>
        </div>
      </div>

      {/* Lista de Estudiantes */}
      <div className="card">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Estudiantes - {nivelSeleccionado} - Periodo {periodoSeleccionado}
        </h2>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="text-left py-3 px-4">Estudiante</th>
                {dimensiones.map((dimension) => (
                  <th key={dimension} className="text-center py-3 px-4">
                    {dimension}
                  </th>
                ))}
                <th className="text-center py-3 px-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantesDelNivel.map((estudiante) => {
                const calificacion = getCalificacion(estudiante.id);
                return (
                  <tr
                    key={estudiante.id}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <td className="py-3 px-4">
                      <div>
                        <p className="font-semibold text-gray-800">
                          {estudiante.nombres} {estudiante.apellidos}
                        </p>
                        <p className="text-xs text-gray-600">{estudiante.id}</p>
                      </div>
                    </td>
                    {dimensiones.map((dimension) => {
                      const calDimension = calificacion?.calificaciones.find(
                        (c) => c.dimension === dimension
                      );
                      return (
                        <td key={dimension} className="py-3 px-4 text-center">
                          {calDimension ? (
                            <span
                              className={`px-3 py-1 rounded-full text-white text-xs font-semibold ${getValoracionColor(
                                calDimension.valoracion
                              )}`}
                            >
                              {calDimension.valoracion}
                            </span>
                          ) : (
                            <span className="text-gray-400 text-xs">-</span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => {
                          setEstudianteSeleccionado(estudiante.id);
                          setShowModal(true);
                        }}
                        className="btn-primary text-sm"
                      >
                        {calificacion ? 'Editar' : 'Calificar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          {estudiantesDelNivel.length === 0 && (
            <div className="text-center py-12">
              <GraduationCap className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No se encontraron estudiantes</p>
            </div>
          )}
        </div>
      </div>

      {/* Modal de Calificación */}
      {showModal && estudianteSeleccionado && (
        <CalificacionModal
          estudianteId={estudianteSeleccionado}
          periodo={periodoSeleccionado}
          año={añoSeleccionado}
          calificacionExistente={getCalificacion(estudianteSeleccionado)}
          onClose={() => {
            setShowModal(false);
            setEstudianteSeleccionado(null);
          }}
          onSave={(calificacion) => {
            const existingIndex = calificaciones.findIndex(
              (c) =>
                c.estudianteId === calificacion.estudianteId &&
                c.periodo === calificacion.periodo &&
                c.año === calificacion.año
            );

            if (existingIndex >= 0) {
              const updated = [...calificaciones];
              updated[existingIndex] = calificacion;
              setCalificaciones(updated);
            } else {
              setCalificaciones([...calificaciones, calificacion]);
            }

            setShowModal(false);
            setEstudianteSeleccionado(null);
          }}
          userId={user?.id || '1'}
          estudiantes={estudiantes}
        />
      )}
      </>
      )}
    </div>
  );
};

interface CalificacionModalProps {
  estudianteId: string;
  periodo: Periodo;
  año: number;
  calificacionExistente?: Calificacion;
  onClose: () => void;
  onSave: (calificacion: Calificacion) => void;
  userId: string;
  estudiantes: Estudiante[];
}

const CalificacionModal: React.FC<CalificacionModalProps> = ({
  estudianteId,
  periodo,
  año,
  calificacionExistente,
  onClose,
  onSave,
  userId,
  estudiantes,
}) => {
  const estudiante = estudiantes.find((e: Estudiante) => e.id === estudianteId) as Estudiante;
  const dimensiones: Dimension[] = [
    'Cognitiva',
    'Comunicativa',
    'Corporal',
    'Socio-Afectiva',
    'Estética',
    'Ética',
  ];

  const valoraciones: Valoracion[] = ['Superior', 'Alto', 'Básico', 'Bajo'];

  const [calificaciones, setCalificaciones] = useState<CalificacionDetalle[]>(
    calificacionExistente?.calificaciones ||
      dimensiones.map((dimension) => ({
        dimension,
        valoracion: 'Alto',
        observaciones: '',
      }))
  );

  const [observacionesGenerales, setObservacionesGenerales] = useState(
    calificacionExistente?.observacionesGenerales || ''
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nuevaCalificacion: Calificacion = {
      id: calificacionExistente?.id || `cal${Date.now()}`,
      estudianteId,
      periodo,
      año,
      calificaciones,
      observacionesGenerales,
      registradoPor: userId,
      fechaRegistro: new Date().toISOString(),
    };

    onSave(nuevaCalificacion);
  };

  const updateCalificacion = (
    dimension: Dimension,
    field: 'valoracion' | 'observaciones',
    value: string
  ) => {
    setCalificaciones(
      calificaciones.map((cal) =>
        cal.dimension === dimension ? { ...cal, [field]: value } : cal
      )
    );
  };

  return (
    <div className="modal-overlay">
      <div className="modal-container-md">
        <div className="modal-header">
          <div>
            <h2>Calificación por Dimensiones</h2>
            <p>
              {estudiante?.nombres} {estudiante?.apellidos} - Periodo {periodo} - {año}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body space-y-3">
          {calificaciones.map((cal) => (
            <div key={cal.dimension} className="border border-gray-200 rounded-lg p-3">
              <h3 className="text-sm font-bold text-primary mb-2">
                {cal.dimension}
              </h3>
              <div className="form-grid-2">
                <div>
                  <label className="label-compact">Valoración</label>
                  <select
                    value={cal.valoracion}
                    onChange={(e) =>
                      updateCalificacion(
                        cal.dimension,
                        'valoracion',
                        e.target.value
                      )
                    }
                    className="input-compact"
                    required
                  >
                    {valoraciones.map((val) => (
                      <option key={val} value={val}>
                        {val}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="label-compact">Observaciones</label>
                  <textarea
                    value={cal.observaciones}
                    onChange={(e) =>
                      updateCalificacion(
                        cal.dimension,
                        'observaciones',
                        e.target.value
                      )
                    }
                    className="textarea-compact"
                    placeholder={`Observaciones sobre ${cal.dimension}...`}
                  />
                </div>
              </div>
            </div>
          ))}

          <div>
            <label className="label-compact">Observaciones Generales del Periodo</label>
            <textarea
              value={observacionesGenerales}
              onChange={(e) => setObservacionesGenerales(e.target.value)}
              className="textarea-compact"
              placeholder="Observaciones generales sobre el desempeño del estudiante..."
            />
          </div>
        </form>

        <div className="modal-footer">
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              className="btn-primary flex items-center text-sm py-2 px-4"
            >
              <Save className="w-4 h-4 mr-2" />
              Guardar Calificación
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calificaciones;

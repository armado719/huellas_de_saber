import {
  AlertTriangle,
  Calendar,
  Check,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  ClipboardCheck,
  Clock,
  Download,
  FileText,
  Filter,
  History,
  Loader2,
  Save,
  X,
  XCircle,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { estudiantesService } from '../services/estudiantesService';
import {
  Acudiente,
  AsistenciaRegistro,
  EstadoAsistencia,
  Justificacion,
  MotivoJustificacion,
  Nivel,
} from '../types';

const Asistencia: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.rol === 'admin';
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel>('Párvulos');
  const [asistencias, setAsistencias] = useState<AsistenciaRegistro[]>([]);
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
  const [registrosActuales, setRegistrosActuales] = useState<
    Record<string, {
      estado: EstadoAsistencia;
      horaLlegada?: string;
      observaciones?: string;
      justificacion?: Justificacion;
    }>
  >({});
  const [expandedObs, setExpandedObs] = useState<Record<string, boolean>>({});
  const [showJustificacionModal, setShowJustificacionModal] = useState(false);
  const [selectedEstudianteJust, setSelectedEstudianteJust] = useState<string | null>(null);
  const [showHistorialModal, setShowHistorialModal] = useState(false);
  const [verSoloAusentes, setVerSoloAusentes] = useState(false);
  const [enviarNotificaciones, setEnviarNotificaciones] = useState(true);

  const [justificacionForm, setJustificacionForm] = useState<{
    motivo: MotivoJustificacion | '';
    descripcion: string;
    documento: string;
    justificadoPor: string;
    aprobada: boolean;
  }>({
    motivo: '',
    descripcion: '',
    documento: '',
    justificadoPor: '',
    aprobada: false,
  });

  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín'];

  const estudiantesDelNivel = estudiantes.filter(
    (est) => est.nivel === nivelSeleccionado && est.activo
  );

  const estudiantesFiltrados = verSoloAusentes
    ? estudiantesDelNivel.filter((est) => {
        const asistencia = getAsistenciaEstudiante(est.id);
        return asistencia?.estado === 'ausente' || asistencia?.estado === 'justificado';
      })
    : estudiantesDelNivel;

  function getAsistenciaEstudiante(estudianteId: string) {
    if (registrosActuales[estudianteId] !== undefined) {
      return registrosActuales[estudianteId];
    }
    const asistenciaGuardada = asistencias.find(
      (a) => a.estudianteId === estudianteId && a.fecha === fecha
    );
    return asistenciaGuardada
      ? {
          estado: asistenciaGuardada.estado || (asistenciaGuardada.presente ? 'presente' : 'ausente') as EstadoAsistencia,
          horaLlegada: asistenciaGuardada.horaLlegada,
          observaciones: asistenciaGuardada.observaciones,
          justificacion: asistenciaGuardada.justificacion,
        }
      : null;
  }

  const handleSetEstado = (estudianteId: string, estado: EstadoAsistencia) => {
    setRegistrosActuales({
      ...registrosActuales,
      [estudianteId]: {
        ...registrosActuales[estudianteId],
        estado,
        horaLlegada: estado === 'presente' || estado === 'retardo'
          ? registrosActuales[estudianteId]?.horaLlegada || new Date().toTimeString().slice(0, 5)
          : undefined,
        observaciones: registrosActuales[estudianteId]?.observaciones || '',
      },
    });
  };

  const handleHoraLlegada = (estudianteId: string, hora: string) => {
    setRegistrosActuales({
      ...registrosActuales,
      [estudianteId]: {
        ...registrosActuales[estudianteId],
        horaLlegada: hora,
      },
    });
  };

  const handleObservaciones = (estudianteId: string, observaciones: string) => {
    setRegistrosActuales({
      ...registrosActuales,
      [estudianteId]: {
        ...registrosActuales[estudianteId],
        observaciones,
      },
    });
  };

  const openJustificacionModal = (estudianteId: string) => {
    setSelectedEstudianteJust(estudianteId);
    setJustificacionForm({
      motivo: '',
      descripcion: '',
      documento: '',
      justificadoPor: '',
      aprobada: false,
    });
    setShowJustificacionModal(true);
  };

  const handleSaveJustificacion = () => {
    if (!selectedEstudianteJust || !justificacionForm.motivo || !justificacionForm.descripcion) {
      alert('Por favor complete los campos obligatorios');
      return;
    }

    const justificacion: Justificacion = {
      id: `just${Date.now()}`,
      motivo: justificacionForm.motivo,
      descripcion: justificacionForm.descripcion,
      documento: justificacionForm.documento || undefined,
      fechaJustificacion: new Date().toISOString().split('T')[0],
      justificadoPor: justificacionForm.justificadoPor || 'Acudiente',
      aprobada: justificacionForm.aprobada,
    };

    setRegistrosActuales({
      ...registrosActuales,
      [selectedEstudianteJust]: {
        ...registrosActuales[selectedEstudianteJust],
        estado: 'justificado',
        justificacion,
      },
    });

    setShowJustificacionModal(false);
    setSelectedEstudianteJust(null);
  };

  const handleGuardar = () => {
    const estudiantesSinMarcar = estudiantesDelNivel.filter(
      (est) => !getAsistenciaEstudiante(est.id)
    );

    if (estudiantesSinMarcar.length > 0) {
      alert(`Hay ${estudiantesSinMarcar.length} estudiantes sin marcar asistencia`);
      return;
    }

    const estudiantesConRetardoSinHora = Object.entries(registrosActuales).filter(
      ([_, data]) => data.estado === 'retardo' && !data.horaLlegada
    );

    if (estudiantesConRetardoSinHora.length > 0) {
      alert('Los estudiantes con retardo deben tener hora de llegada');
      return;
    }

    const fechaSeleccionada = new Date(fecha);
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    if (fechaSeleccionada > hoy) {
      alert('No se puede registrar asistencia para fechas futuras');
      return;
    }

    const confirmacion = confirm(
      `¿Confirmar asistencia del ${new Date(fecha).toLocaleDateString('es-CO')} para ${nivelSeleccionado}?`
    );

    if (!confirmacion) return;

    const nuevasAsistencias: AsistenciaRegistro[] = Object.entries(
      registrosActuales
    ).map(([estudianteId, data]) => ({
      id: `asis${Date.now()}_${estudianteId}`,
      estudianteId,
      fecha,
      presente: data.estado === 'presente' || data.estado === 'retardo',
      estado: data.estado,
      horaLlegada: data.horaLlegada,
      observaciones: data.observaciones,
      justificacion: data.justificacion,
      registradoPor: user?.id || '1',
    }));

    setAsistencias([
      ...asistencias.filter((a) => a.fecha !== fecha),
      ...nuevasAsistencias,
    ]);

    setRegistrosActuales({});

    if (enviarNotificaciones) {
      alert('Asistencia guardada exitosamente. Se enviarán notificaciones a los acudientes de estudiantes ausentes.');
    } else {
      alert('Asistencia guardada exitosamente');
    }
  };

  const getEstadoIcon = (estado: EstadoAsistencia) => {
    switch (estado) {
      case 'presente':
        return <CheckCircle className="w-5 h-5" />;
      case 'ausente':
        return <XCircle className="w-5 h-5" />;
      case 'justificado':
        return <FileText className="w-5 h-5" />;
      case 'retardo':
        return <Clock className="w-5 h-5" />;
    }
  };

  const getEstadoColor = (estado: EstadoAsistencia, selected: boolean) => {
    if (!selected) return 'bg-gray-100 text-gray-600 hover:bg-gray-200';
    switch (estado) {
      case 'presente':
        return 'bg-green-500 text-white';
      case 'ausente':
        return 'bg-red-500 text-white';
      case 'justificado':
        return 'bg-blue-500 text-white';
      case 'retardo':
        return 'bg-orange-500 text-white';
    }
  };

  // Estadísticas
  const stats = {
    total: estudiantesDelNivel.length,
    presentes: estudiantesDelNivel.filter((est) => {
      const a = getAsistenciaEstudiante(est.id);
      return a?.estado === 'presente';
    }).length,
    ausentes: estudiantesDelNivel.filter((est) => {
      const a = getAsistenciaEstudiante(est.id);
      return a?.estado === 'ausente';
    }).length,
    justificados: estudiantesDelNivel.filter((est) => {
      const a = getAsistenciaEstudiante(est.id);
      return a?.estado === 'justificado';
    }).length,
    retardos: estudiantesDelNivel.filter((est) => {
      const a = getAsistenciaEstudiante(est.id);
      return a?.estado === 'retardo';
    }).length,
    sinJustificar: estudiantesDelNivel.filter((est) => {
      const a = getAsistenciaEstudiante(est.id);
      return a?.estado === 'ausente' && !a?.justificacion;
    }).length,
  };

  const porcentajeAsistencia =
    stats.total > 0
      ? Math.round(((stats.presentes + stats.retardos) / stats.total) * 100)
      : 0;

  const horaActual = new Date().toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
  });

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
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <ClipboardCheck className="w-8 h-8 text-primary mr-3" />
            Control de Asistencia
          </h1>
          <p className="text-gray-600">
            Registra la asistencia diaria de los estudiantes
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-600">Hora actual</p>
          <p className="text-2xl font-bold text-primary">{horaActual}</p>
        </div>
      </div>

      {/* Filtros y Acciones */}
      <div className="card">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="label">
              <Calendar className="w-4 h-4 inline mr-2" />
              Fecha
            </label>
            <input
              type="date"
              value={fecha}
              onChange={(e) => setFecha(e.target.value)}
              className="input-field"
            />
          </div>
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
          <div className="flex items-end space-x-2">
            <button
              onClick={() => setShowHistorialModal(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <History className="w-4 h-4 mr-2" />
              Ver Historial
            </button>
            <button
              onClick={() => alert('Función de exportación - Próximamente')}
              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </button>
          </div>
          <div className="flex items-end">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={verSoloAusentes}
                onChange={(e) => setVerSoloAusentes(e.target.checked)}
                className="mr-2 w-4 h-4 text-primary rounded"
              />
              <Filter className="w-4 h-4 mr-1 text-gray-600" />
              <span className="text-sm text-gray-700">Ver solo ausentes</span>
            </label>
          </div>
        </div>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <div className="card bg-blue-50 border-l-4 border-blue-500">
          <p className="text-xs text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-blue-700">{stats.total}</p>
        </div>
        <div className="card bg-green-50 border-l-4 border-green-500">
          <p className="text-xs text-gray-600 mb-1">Presentes</p>
          <p className="text-2xl font-bold text-green-700">{stats.presentes}</p>
        </div>
        <div className="card bg-red-50 border-l-4 border-red-500">
          <p className="text-xs text-gray-600 mb-1">Ausentes</p>
          <p className="text-2xl font-bold text-red-700">{stats.ausentes}</p>
        </div>
        <div className="card bg-blue-50 border-l-4 border-blue-400">
          <p className="text-xs text-gray-600 mb-1">Justificados</p>
          <p className="text-2xl font-bold text-blue-600">{stats.justificados}</p>
        </div>
        <div className="card bg-orange-50 border-l-4 border-orange-500">
          <p className="text-xs text-gray-600 mb-1">Retardos</p>
          <p className="text-2xl font-bold text-orange-700">{stats.retardos}</p>
        </div>
        <div className="card bg-primary/10 border-l-4 border-primary">
          <p className="text-xs text-gray-600 mb-1">% Asistencia</p>
          <p className="text-2xl font-bold text-primary">{porcentajeAsistencia}%</p>
        </div>
      </div>

      {stats.sinJustificar > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
          <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
          <span className="text-red-700 font-medium">
            {stats.sinJustificar} ausencia(s) sin justificar
          </span>
        </div>
      )}

      {/* Lista de Asistencia */}
      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">
            Lista de Asistencia - {nivelSeleccionado}
          </h2>
          <div className="flex items-center space-x-4">
            <label className="flex items-center text-sm">
              <input
                type="checkbox"
                checked={enviarNotificaciones}
                onChange={(e) => setEnviarNotificaciones(e.target.checked)}
                className="mr-2 w-4 h-4 text-primary rounded"
              />
              Enviar notificaciones de ausencia
            </label>
            <button
              onClick={handleGuardar}
              className="btn-primary flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              Guardar Asistencia
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {estudiantesFiltrados.map((estudiante) => {
            const asistencia = getAsistenciaEstudiante(estudiante.id);
            const estadoActual = asistencia?.estado;
            const isExpanded = expandedObs[estudiante.id] || false;

            return (
              <div
                key={estudiante.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center">
                      <h3 className="font-semibold text-gray-800">
                        {estudiante.nombres} {estudiante.apellidos}
                      </h3>
                      {asistencia?.estado === 'ausente' && !asistencia.justificacion && (
                        <span className="ml-2 px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                          Sin Justificar
                        </span>
                      )}
                      {asistencia?.justificacion?.aprobada && (
                        <span className="ml-2 text-green-600">
                          <Check className="w-4 h-4 inline" />
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {estudiante.codigo || estudiante.id}
                    </p>
                  </div>
                  <div className="flex space-x-2">
                    {(['presente', 'ausente', 'justificado', 'retardo'] as EstadoAsistencia[]).map(
                      (estado) => (
                        <button
                          key={estado}
                          onClick={() => handleSetEstado(estudiante.id, estado)}
                          className={`flex items-center px-3 py-2 rounded-lg transition-all text-sm ${getEstadoColor(
                            estado,
                            estadoActual === estado
                          )}`}
                          title={estado.charAt(0).toUpperCase() + estado.slice(1)}
                        >
                          {getEstadoIcon(estado)}
                          <span className="ml-1 hidden md:inline capitalize">{estado}</span>
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Hora de llegada para Presente o Retardo */}
                {(estadoActual === 'presente' || estadoActual === 'retardo') && (
                  <div className="mb-3">
                    <label className="label text-xs">
                      <Clock className="w-3 h-3 inline mr-1" />
                      Hora de Llegada {estadoActual === 'retardo' && <span className="text-secondary">*</span>}
                    </label>
                    <input
                      type="time"
                      value={asistencia?.horaLlegada || ''}
                      onChange={(e) => handleHoraLlegada(estudiante.id, e.target.value)}
                      className="input-field w-48"
                    />
                  </div>
                )}

                {/* Botón Justificar para Ausente */}
                {estadoActual === 'ausente' && !asistencia?.justificacion && (
                  <button
                    onClick={() => openJustificacionModal(estudiante.id)}
                    className="text-sm px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors mb-3"
                  >
                    <FileText className="w-3 h-3 inline mr-1" />
                    Justificar
                  </button>
                )}

                {/* Observaciones colapsable */}
                <div>
                  <button
                    onClick={() =>
                      setExpandedObs({ ...expandedObs, [estudiante.id]: !isExpanded })
                    }
                    className="text-xs text-gray-600 flex items-center hover:text-primary"
                  >
                    {isExpanded ? (
                      <ChevronUp className="w-3 h-3 mr-1" />
                    ) : (
                      <ChevronDown className="w-3 h-3 mr-1" />
                    )}
                    Observaciones
                  </button>
                  {isExpanded && (
                    <textarea
                      value={asistencia?.observaciones || ''}
                      onChange={(e) => handleObservaciones(estudiante.id, e.target.value)}
                      className="input-field mt-2"
                      rows={2}
                      placeholder="Observaciones adicionales..."
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {estudiantesFiltrados.length === 0 && (
          <div className="text-center py-12">
            <ClipboardCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">
              {verSoloAusentes ? 'No hay estudiantes ausentes' : 'No hay estudiantes en este nivel'}
            </p>
          </div>
        )}
      </div>

      {/* Modal de Justificación */}
      {showJustificacionModal && selectedEstudianteJust && (
        <div className="modal-overlay">
          <div className="modal-container-sm">
            <div className="modal-header">
              <div>
                <h2>Justificar Ausencia</h2>
                <p>
                  {estudiantes.find((e) => e.id === selectedEstudianteJust)?.nombres}{' '}
                  {estudiantes.find((e) => e.id === selectedEstudianteJust)?.apellidos}
                </p>
              </div>
              <button
                onClick={() => setShowJustificacionModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body space-y-3">
              <div>
                <label className="label-compact">Fecha de Ausencia</label>
                <input
                  type="text"
                  value={new Date(fecha).toLocaleDateString('es-CO')}
                  className="input-compact bg-gray-100"
                  disabled
                />
              </div>

              <div>
                <label className="label-compact">
                  Motivo <span className="text-secondary">*</span>
                </label>
                <select
                  value={justificacionForm.motivo}
                  onChange={(e) =>
                    setJustificacionForm({
                      ...justificacionForm,
                      motivo: e.target.value as MotivoJustificacion,
                    })
                  }
                  className="input-compact"
                >
                  <option value="">Seleccione...</option>
                  <option value="Enfermedad">Enfermedad</option>
                  <option value="Cita Médica">Cita Médica</option>
                  <option value="Calamidad Doméstica">Calamidad Doméstica</option>
                  <option value="Viaje">Viaje</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div>
                <label className="label-compact">
                  Descripción <span className="text-secondary">*</span>
                </label>
                <textarea
                  value={justificacionForm.descripcion}
                  onChange={(e) =>
                    setJustificacionForm({
                      ...justificacionForm,
                      descripcion: e.target.value,
                    })
                  }
                  className="textarea-compact"
                  placeholder="Describa el motivo de la ausencia..."
                />
              </div>

              <div>
                <label className="label-compact">Adjuntar Documento (opcional)</label>
                <input
                  type="text"
                  value={justificacionForm.documento}
                  onChange={(e) =>
                    setJustificacionForm({
                      ...justificacionForm,
                      documento: e.target.value,
                    })
                  }
                  className="input-compact"
                  placeholder="URL del documento"
                />
              </div>

              <div>
                <label className="label-compact">Justificado por</label>
                <select
                  value={justificacionForm.justificadoPor}
                  onChange={(e) =>
                    setJustificacionForm({
                      ...justificacionForm,
                      justificadoPor: e.target.value,
                    })
                  }
                  className="input-compact"
                >
                  <option value="">Seleccione acudiente...</option>
                  {estudiantes
                    .find((e) => e.id === selectedEstudianteJust)
                    ?.acudientes.map((acu: Acudiente) => (
                      <option key={acu.id} value={acu.nombres}>
                        {acu.nombres} ({acu.parentesco})
                      </option>
                    ))}
                </select>
              </div>

              {isAdmin && (
                <div>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={justificacionForm.aprobada}
                      onChange={(e) =>
                        setJustificacionForm({
                          ...justificacionForm,
                          aprobada: e.target.checked,
                        })
                      }
                      className="mr-2 w-4 h-4 text-primary rounded"
                    />
                    <span className="text-xs text-gray-700">Aprobar justificación</span>
                  </label>
                </div>
              )}
            </div>

            <div className="modal-footer flex justify-end space-x-2">
              <button
                onClick={() => setShowJustificacionModal(false)}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button onClick={handleSaveJustificacion} className="btn-primary text-sm py-2 px-4">
                <Save className="w-4 h-4 mr-2 inline" />
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Historial */}
      {showHistorialModal && (
        <div className="modal-overlay">
          <div className="modal-container-lg">
            <div className="modal-header">
              <h2>Historial de Asistencia</h2>
              <button
                onClick={() => setShowHistorialModal(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              <div className="form-grid-3 mb-4">
                <div>
                  <label className="label-compact">Estudiante</label>
                  <select className="input-compact">
                    <option value="">Todos</option>
                    {estudiantes.map((est) => (
                      <option key={est.id} value={est.id}>
                        {est.nombres} {est.apellidos}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label-compact">Desde</label>
                  <input type="date" className="input-compact" />
                </div>
                <div>
                  <label className="label-compact">Hasta</label>
                  <input type="date" className="input-compact" />
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="bg-green-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Presentes</p>
                  <p className="text-lg font-bold text-green-700">85%</p>
                </div>
                <div className="bg-red-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Ausentes</p>
                  <p className="text-lg font-bold text-red-700">8%</p>
                </div>
                <div className="bg-blue-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Justificados</p>
                  <p className="text-lg font-bold text-blue-700">5%</p>
                </div>
                <div className="bg-orange-50 p-2 rounded-lg text-center">
                  <p className="text-xs text-gray-600">Retardos</p>
                  <p className="text-lg font-bold text-orange-700">2%</p>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b-2 border-gray-200">
                      <th className="text-left py-2 px-3">Fecha</th>
                      <th className="text-left py-2 px-3">Estudiante</th>
                      <th className="text-left py-2 px-3">Nivel</th>
                      <th className="text-center py-2 px-3">Estado</th>
                      <th className="text-left py-2 px-3">Hora</th>
                      <th className="text-left py-2 px-3">Observaciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {asistencias.slice(0, 10).map((reg) => {
                      const est = estudiantes.find((e) => e.id === reg.estudianteId);
                      return (
                        <tr key={reg.id} className="border-b border-gray-100">
                          <td className="py-1.5 px-3 text-xs">
                            {new Date(reg.fecha).toLocaleDateString('es-CO')}
                          </td>
                          <td className="py-1.5 px-3 text-xs">
                            {est?.nombres} {est?.apellidos}
                          </td>
                          <td className="py-1.5 px-3 text-xs">{est?.nivel}</td>
                          <td className="py-1.5 px-3 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded-full text-xs font-semibold ${
                                reg.presente ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                              }`}
                            >
                              {reg.estado || (reg.presente ? 'Presente' : 'Ausente')}
                            </span>
                          </td>
                          <td className="py-1.5 px-3 text-xs">{reg.horaLlegada || '-'}</td>
                          <td className="py-1.5 px-3 text-xs text-gray-600">
                            {reg.observaciones || '-'}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer flex justify-end space-x-2">
              <button className="px-4 py-2 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                <Download className="w-4 h-4 mr-2 inline" />
                Exportar
              </button>
              <button
                onClick={() => setShowHistorialModal(false)}
                className="btn-primary text-sm py-2 px-4"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
    )}
    </div>
  );
};

export default Asistencia;

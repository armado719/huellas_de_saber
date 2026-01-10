import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import {
  AlertCircle,
  Calendar,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit,
  Eye,
  FileDown,
  MapPin,
  Plus,
  Printer,
  Users,
  X,
} from 'lucide-react';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { horariosService } from '../services/horariosService';
import { profesoresService } from '../services/profesoresService';
import {
  DiaSemana,
  EventoCalendario,
  Horario,
  Nivel,
  PrioridadEvento,
  TipoActividad,
  TipoEvento,
} from '../types';

const Horarios: React.FC = () => {
  const [nivelSeleccionado, setNivelSeleccionado] = useState<Nivel>('Transición');
  const [viestaCompacta, setVistaCompacta] = useState(false);
  const [mostrarModalClase, setMostrarModalClase] = useState(false);
  const [mostrarModalEvento, setMostrarModalEvento] = useState(false);
  const [mostrarCalendarioMensual, setMostrarCalendarioMensual] = useState(false);
  const [claseEditando, setClaseEditando] = useState<Horario | null>(null);
  const [filtroEvento, setFiltroEvento] = useState<TipoEvento | 'Todos'>('Todos');
  const [mesActual, setMesActual] = useState(new Date());
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [eventos, setEventos] = useState<EventoCalendario[]>([]);
  const [profesores, setProfesores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const horarioRef = useRef<HTMLDivElement>(null);

  const niveles: Nivel[] = ['Caminadores', 'Párvulos', 'Prejardín', 'Jardín', 'Transición'];
  const diasSemana: DiaSemana[] = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'];

  // Cargar datos reales desde el backend
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);
        const [horariosData, profesoresData] = await Promise.all([
          horariosService.getAll(),
          profesoresService.getAll(),
        ]);
        setHorarios(horariosData);
        setProfesores(profesoresData);
      } catch (error) {
        console.error('Error al cargar datos:', error);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, []);

  // Horarios de 7:00 AM a 2:00 PM
  const franjaHoraria = [
    '07:00-08:00',
    '08:00-09:00',
    '09:00-10:00',
    '10:00-10:30',
    '10:30-11:30',
    '11:30-12:00',
    '12:00-13:00',
    '13:00-14:00',
  ];

  const horariosDelNivel = useMemo(
    () => horarios.filter((h) => h.nivel === nivelSeleccionado),
    [horarios, nivelSeleccionado]
  );

  const getProfesorNombre = (profesorId: string) => {
    const profesor = profesores.find((p) => p.id === profesorId);
    return profesor ? `${profesor.nombres} ${profesor.apellidos}` : 'N/A';
  };

  const eventosFiltrados = useMemo(() => {
    let eventosBase = eventos.filter((e) => new Date(e.fecha) >= new Date());
    if (filtroEvento !== 'Todos') {
      eventosBase = eventosBase.filter((e) => e.tipo === filtroEvento);
    }
    return eventosBase
      .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime())
      .slice(0, 8);
  }, [eventos, filtroEvento]);

  const getTipoEventoColor = (tipo: TipoEvento) => {
    switch (tipo) {
      case 'Festivo':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'Reunión':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Actividad':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Evaluación':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'Ceremonia':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTipoEventoIcon = (tipo: TipoEvento) => {
    switch (tipo) {
      case 'Festivo':
        return '🎉';
      case 'Reunión':
        return '📅';
      case 'Actividad':
        return '🎭';
      case 'Evaluación':
        return '📝';
      case 'Ceremonia':
        return '🎓';
      default:
        return '📌';
    }
  };

  // ============ FUNCIONES PARA MODAL DE CLASE ============
  const abrirModalClase = (clase?: Horario) => {
    setClaseEditando(clase || null);
    setMostrarModalClase(true);
  };

  const cerrarModalClase = () => {
    setMostrarModalClase(false);
    setClaseEditando(null);
  };

  const guardarClase = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const datosClase = {
      nivel: formData.get('nivel') as Nivel,
      diaSemana: parseInt(formData.get('diaSemana') as string),
      diaSemanaTexto: diasSemana[parseInt(formData.get('diaSemana') as string) - 1],
      horaInicio: formData.get('horaInicio') as string,
      horaFin: formData.get('horaFin') as string,
      materia: formData.get('materia') as string,
      tipoActividad: formData.get('tipoActividad') as TipoActividad,
      profesorId: formData.get('profesorId') as string,
      aula: formData.get('aula') as string || undefined,
      color: formData.get('color') as string || undefined,
      observaciones: formData.get('observaciones') as string || undefined,
    };

    try {
      if (claseEditando) {
        const horarioActualizado = await horariosService.update(claseEditando.id, datosClase);
        setHorarios(horarios.map((h) => (h.id === claseEditando.id ? horarioActualizado : h)));
      } else {
        const nuevoHorario = await horariosService.create(datosClase);
        setHorarios([...horarios, nuevoHorario]);
      }
      cerrarModalClase();
    } catch (error) {
      console.error('Error al guardar clase:', error);
      alert('Error al guardar la clase. Por favor, intente nuevamente.');
    }
  };

  // ============ FUNCIONES PARA MODAL DE EVENTO ============
  const guardarEvento = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const nuevoEvento: EventoCalendario = {
      id: `evt${Date.now()}`,
      titulo: formData.get('titulo') as string,
      descripcion: formData.get('descripcion') as string,
      fecha: formData.get('fecha') as string,
      fechaFin: formData.get('fechaFin') as string || undefined,
      horaInicio: formData.get('horaInicio') as string || undefined,
      horaFin: formData.get('horaFin') as string || undefined,
      tipo: formData.get('tipo') as TipoEvento,
      lugar: formData.get('lugar') as string || undefined,
      responsableId: formData.get('responsableId') as string || undefined,
      prioridad: formData.get('prioridad') as PrioridadEvento,
      enviarRecordatorio: formData.get('enviarRecordatorio') === 'on',
    };

    setEventos([...eventos, nuevoEvento]);
    setMostrarModalEvento(false);
  };

  // ============ FUNCIONES PARA CALENDARIO MENSUAL ============
  const getDiasDelMes = (fecha: Date) => {
    const año = fecha.getFullYear();
    const mes = fecha.getMonth();
    const primerDia = new Date(año, mes, 1);
    const ultimoDia = new Date(año, mes + 1, 0);
    const diasPrevios = primerDia.getDay(); // 0 = domingo
    const totalDias = ultimoDia.getDate();

    const dias: (Date | null)[] = [];

    // Días del mes anterior
    for (let i = 0; i < diasPrevios; i++) {
      dias.push(null);
    }

    // Días del mes actual
    for (let i = 1; i <= totalDias; i++) {
      dias.push(new Date(año, mes, i));
    }

    return dias;
  };

  const getEventosDelDia = (fecha: Date | null) => {
    if (!fecha) return [];
    const fechaStr = fecha.toISOString().split('T')[0];
    return eventos.filter((e) => e.fecha === fechaStr);
  };

  const cambiarMes = (incremento: number) => {
    setMesActual(new Date(mesActual.getFullYear(), mesActual.getMonth() + incremento, 1));
  };

  const irAHoy = () => {
    setMesActual(new Date());
  };

  // ============ FUNCIÓN PARA EXPORTAR PDF ============
  const exportarHorarioPDF = async () => {
    if (!horarioRef.current) return;

    try {
      const canvas = await html2canvas(horarioRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 10;

      pdf.addImage(
        imgData,
        'PNG',
        imgX,
        imgY,
        imgWidth * ratio,
        imgHeight * ratio
      );

      pdf.save(`Horario_${nivelSeleccionado}_${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error al generar PDF:', error);
      alert('Error al generar el PDF. Por favor, intente nuevamente.');
    }
  };

  // ============ FUNCIÓN PARA IMPRIMIR ============
  const imprimirHorario = () => {
    window.print();
  };

  // Mostrar loading mientras se cargan los datos
  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <Calendar className="w-8 h-8 text-primary mr-3" />
            Horarios y Calendario
          </h1>
          <p className="text-gray-600">
            Gestiona los horarios de clase y eventos del calendario escolar
          </p>
        </div>
        <div className="card text-center py-12">
          <p className="text-gray-600">Cargando horarios y profesores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
          <Calendar className="w-8 h-8 text-primary mr-3" />
          Horarios y Calendario
        </h1>
        <p className="text-gray-600">
          Gestiona los horarios de clase y eventos del calendario escolar
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* ========================================
            SECCIÓN 1: HORARIO DE CLASES
        ======================================== */}
        <div className="xl:col-span-2">
          <div className="card">
            {/* Header de Horarios */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 gap-3">
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-primary mr-2" />
                <h2 className="text-xl font-bold text-gray-800">Horario de Clases</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={nivelSeleccionado}
                  onChange={(e) => setNivelSeleccionado(e.target.value as Nivel)}
                  className="input-field w-auto text-sm"
                >
                  {niveles.map((nivel) => (
                    <option key={nivel} value={nivel}>
                      {nivel}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => abrirModalClase()}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Agregar Clase
              </button>
              <button
                onClick={exportarHorarioPDF}
                className="btn-outline text-sm flex items-center gap-1"
              >
                <FileDown className="w-4 h-4" />
                Exportar PDF
              </button>
              <button
                onClick={imprimirHorario}
                className="btn-outline text-sm flex items-center gap-1"
              >
                <Printer className="w-4 h-4" />
                Imprimir
              </button>
              <button
                onClick={() => setVistaCompacta(!viestaCompacta)}
                className="btn-outline text-sm flex items-center gap-1"
              >
                <Eye className="w-4 h-4" />
                {viestaCompacta ? 'Vista Completa' : 'Vista Compacta'}
              </button>
            </div>

            {/* Tabla de Horarios */}
            <div ref={horarioRef} className="overflow-x-auto print:overflow-visible">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-300 bg-gray-50">
                    <th className="text-left py-3 px-2 md:px-4 font-semibold text-gray-700 text-sm">
                      Hora
                    </th>
                    {diasSemana.map((dia) => (
                      <th
                        key={dia}
                        className="text-center py-3 px-2 md:px-4 font-semibold text-gray-700 text-sm"
                      >
                        {dia}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {franjaHoraria.map((hora) => {
                    const [horaInicio] = hora.split('-');
                    return (
                      <tr key={hora} className="border-b border-gray-200 hover:bg-gray-50">
                        <td className="py-2 md:py-3 px-2 md:px-4 font-medium text-xs md:text-sm text-gray-600 whitespace-nowrap">
                          {hora}
                        </td>
                        {diasSemana.map((_, diaIndex) => {
                          const horario = horariosDelNivel.find(
                            (h) =>
                              h.diaSemana === diaIndex + 1 && h.horaInicio === horaInicio
                          );
                          return (
                            <td
                              key={diaIndex}
                              className="py-2 md:py-3 px-1 md:px-2 text-center align-top"
                            >
                              {horario ? (
                                <div
                                  className={`p-2 rounded-lg cursor-pointer hover:shadow-md transition-all group relative`}
                                  style={{ backgroundColor: horario.color }}
                                  onClick={() => abrirModalClase(horario)}
                                  title={`${horario.materia} - ${getProfesorNombre(horario.profesorId)}\n${horario.aula || ''}`}
                                >
                                  <p className="font-semibold text-xs md:text-sm leading-tight">
                                    {horario.materia}
                                  </p>
                                  {!viestaCompacta && horario.tipoActividad !== 'Descanso' && horario.tipoActividad !== 'Almuerzo' && (
                                    <p className="text-xs mt-1 opacity-80">
                                      {getProfesorNombre(horario.profesorId).split(' ').slice(0, 2).join(' ')}
                                    </p>
                                  )}
                                  {horario.aula && !viestaCompacta && (
                                    <p className="text-xs opacity-70 mt-0.5">{horario.aula}</p>
                                  )}
                                  {/* Ícono de editar al hacer hover */}
                                  <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Edit className="w-3 h-3 text-gray-700" />
                                  </div>
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    // Pre-rellenar datos para nueva clase
                                    const formData: Horario = {
                                      id: '',
                                      nivel: nivelSeleccionado,
                                      diaSemana: diaIndex + 1,
                                      horaInicio,
                                      horaFin: '',
                                      materia: '',
                                      tipoActividad: 'Académica',
                                      profesorId: profesores[0]?.id || '',
                                      color: '#D1FAE5',
                                      observaciones: '',
                                    };
                                    abrirModalClase(formData);
                                  }}
                                  className="text-gray-300 hover:text-primary transition-colors w-full py-2"
                                >
                                  <Plus className="w-4 h-4 mx-auto" />
                                </button>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Leyenda de Colores */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-sm font-semibold text-gray-700 mb-2">Leyenda de Colores:</p>
              <div className="flex flex-wrap gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#D1FAE5' }}></div>
                  <span className="text-xs text-gray-600">Académicas</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E9D5FF' }}></div>
                  <span className="text-xs text-gray-600">Arte y Creatividad</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#DBEAFE' }}></div>
                  <span className="text-xs text-gray-600">Educación Física</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FEF3C7' }}></div>
                  <span className="text-xs text-gray-600">Descansos</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#FED7AA' }}></div>
                  <span className="text-xs text-gray-600">Almuerzo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded" style={{ backgroundColor: '#E0E7FF' }}></div>
                  <span className="text-xs text-gray-600">Otros</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            SECCIÓN 2: PRÓXIMOS EVENTOS
        ======================================== */}
        <div className="xl:col-span-1">
          <div className="card">
            {/* Header de Eventos */}
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800 flex items-center">
                <Calendar className="w-6 h-6 text-primary mr-2" />
                Próximos Eventos
              </h2>
            </div>

            {/* Botones de Acción */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                onClick={() => setMostrarModalEvento(true)}
                className="btn-primary text-sm flex items-center gap-1"
              >
                <Plus className="w-4 h-4" />
                Nuevo Evento
              </button>
              <button
                onClick={() => setMostrarCalendarioMensual(true)}
                className="btn-outline text-sm flex items-center gap-1"
              >
                <CalendarDays className="w-4 h-4" />
                Ver Calendario
              </button>
            </div>

            {/* Filtros */}
            <div className="mb-4">
              <select
                value={filtroEvento}
                onChange={(e) => setFiltroEvento(e.target.value as TipoEvento | 'Todos')}
                className="input-field w-full text-sm"
              >
                <option value="Todos">Todos los eventos</option>
                <option value="Festivo">Festivos</option>
                <option value="Reunión">Reuniones</option>
                <option value="Actividad">Actividades</option>
                <option value="Evaluación">Evaluaciones</option>
                <option value="Ceremonia">Ceremonias</option>
              </select>
            </div>

            {/* Lista de Eventos */}
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {eventosFiltrados.map((evento) => (
                <div
                  key={evento.id}
                  className={`border rounded-lg p-3 hover:shadow-md transition-shadow ${getTipoEventoColor(
                    evento.tipo
                  )}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-start gap-2 flex-1">
                      <span className="text-xl">{getTipoEventoIcon(evento.tipo)}</span>
                      <div className="flex-1">
                        <h3 className="font-semibold text-sm leading-tight">
                          {evento.titulo}
                        </h3>
                        {evento.prioridad === 'Urgente' && (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-red-600 mt-1">
                            <AlertCircle className="w-3 h-3" />
                            Urgente
                          </span>
                        )}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-1 rounded text-xs font-medium border ${getTipoEventoColor(
                        evento.tipo
                      )}`}
                    >
                      {evento.tipo}
                    </span>
                  </div>

                  <p className="text-xs mb-2 leading-relaxed">{evento.descripcion}</p>

                  <div className="space-y-1">
                    <div className="flex items-center text-xs">
                      <Calendar className="w-3 h-3 mr-1.5" />
                      {new Date(evento.fecha).toLocaleDateString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>

                    {evento.horaInicio && (
                      <div className="flex items-center text-xs">
                        <Clock className="w-3 h-3 mr-1.5" />
                        {evento.horaInicio}
                        {evento.horaFin && ` - ${evento.horaFin}`}
                      </div>
                    )}

                    {evento.lugar && (
                      <div className="flex items-center text-xs">
                        <MapPin className="w-3 h-3 mr-1.5" />
                        {evento.lugar}
                      </div>
                    )}

                    {evento.niveles && evento.niveles.length > 0 && (
                      <div className="flex items-center text-xs">
                        <Users className="w-3 h-3 mr-1.5" />
                        {evento.niveles.join(', ')}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {eventosFiltrados.length === 0 && (
                <div className="text-center py-8">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    No hay eventos {filtroEvento !== 'Todos' && `de tipo "${filtroEvento}"`}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          MODAL: AGREGAR/EDITAR CLASE
      ======================================== */}
      {mostrarModalClase && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h3 className="text-xl font-bold">
                {claseEditando ? 'Editar Clase' : 'Agregar Nueva Clase'}
              </h3>
              <button onClick={cerrarModalClase} className="text-gray-500 hover:text-gray-700">
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={guardarClase}>
              <div className="modal-body">
                <div className="form-grid-2">
                  {/* Nivel */}
                  <div>
                    <label className="label">Nivel/Grupo *</label>
                    <select
                      name="nivel"
                      defaultValue={claseEditando?.nivel || nivelSeleccionado}
                      className="input-field"
                      required
                    >
                      {niveles.map((nivel) => (
                        <option key={nivel} value={nivel}>
                          {nivel}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Día de la Semana */}
                  <div>
                    <label className="label">Día de la Semana *</label>
                    <select
                      name="diaSemana"
                      defaultValue={claseEditando?.diaSemana || 1}
                      className="input-field"
                      required
                    >
                      {diasSemana.map((dia, index) => (
                        <option key={dia} value={index + 1}>
                          {dia}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Hora Inicio */}
                  <div>
                    <label className="label">Hora Inicio *</label>
                    <input
                      type="time"
                      name="horaInicio"
                      defaultValue={claseEditando?.horaInicio || '08:00'}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Hora Fin */}
                  <div>
                    <label className="label">Hora Fin *</label>
                    <input
                      type="time"
                      name="horaFin"
                      defaultValue={claseEditando?.horaFin || '09:00'}
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Materia/Actividad */}
                  <div>
                    <label className="label">Materia/Actividad *</label>
                    <input
                      type="text"
                      name="materia"
                      defaultValue={claseEditando?.materia || ''}
                      placeholder="Ej: Matemáticas, Lenguaje, Arte..."
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Tipo de Actividad */}
                  <div>
                    <label className="label">Tipo de Actividad *</label>
                    <select
                      name="tipoActividad"
                      defaultValue={claseEditando?.tipoActividad || 'Académica'}
                      className="input-field"
                      required
                    >
                      <option value="Académica">Académica</option>
                      <option value="Artística">Artística</option>
                      <option value="Física">Física</option>
                      <option value="Descanso">Descanso</option>
                      <option value="Almuerzo">Almuerzo</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Profesor Asignado */}
                  <div>
                    <label className="label">Profesor Asignado *</label>
                    <select
                      name="profesorId"
                      defaultValue={claseEditando?.profesorId || profesores[0]?.id}
                      className="input-field"
                      required
                    >
                      {profesores.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.nombres} {prof.apellidos}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Aula/Salón */}
                  <div>
                    <label className="label">Aula/Salón</label>
                    <input
                      type="text"
                      name="aula"
                      defaultValue={claseEditando?.aula || ''}
                      placeholder="Ej: Salón Transición, Cancha..."
                      className="input-field"
                    />
                  </div>

                  {/* Color */}
                  <div className="col-span-2">
                    <label className="label">Color</label>
                    <input
                      type="color"
                      name="color"
                      defaultValue={claseEditando?.color || '#D1FAE5'}
                      className="input-field h-10"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Sugerencias: Académicas (#D1FAE5), Artísticas (#E9D5FF), Físicas (#DBEAFE), Descansos (#FEF3C7), Almuerzo (#FED7AA)
                    </p>
                  </div>

                  {/* Observaciones */}
                  <div className="col-span-2">
                    <label className="label">Observaciones</label>
                    <textarea
                      name="observaciones"
                      defaultValue={claseEditando?.observaciones || ''}
                      rows={3}
                      className="input-field"
                      placeholder="Notas adicionales sobre esta clase..."
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" onClick={cerrarModalClase} className="btn-outline">
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  {claseEditando ? 'Guardar Cambios' : 'Crear Clase'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL: NUEVO EVENTO
      ======================================== */}
      {mostrarModalEvento && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h3 className="text-xl font-bold">Crear Nuevo Evento</h3>
              <button
                onClick={() => setMostrarModalEvento(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={guardarEvento}>
              <div className="modal-body">
                <div className="form-grid-2">
                  {/* Título */}
                  <div className="col-span-2">
                    <label className="label">Título del Evento *</label>
                    <input
                      type="text"
                      name="titulo"
                      placeholder="Ej: Día de la Familia, Reunión de Padres..."
                      className="input-field"
                      required
                    />
                  </div>

                  {/* Tipo de Evento */}
                  <div>
                    <label className="label">Tipo de Evento *</label>
                    <select name="tipo" className="input-field" required>
                      <option value="Festivo">Festivo</option>
                      <option value="Reunión">Reunión</option>
                      <option value="Actividad">Actividad</option>
                      <option value="Evaluación">Evaluación</option>
                      <option value="Ceremonia">Ceremonia</option>
                      <option value="Otro">Otro</option>
                    </select>
                  </div>

                  {/* Prioridad */}
                  <div>
                    <label className="label">Prioridad *</label>
                    <select name="prioridad" className="input-field" required>
                      <option value="Normal">Normal</option>
                      <option value="Importante">Importante</option>
                      <option value="Urgente">Urgente</option>
                    </select>
                  </div>

                  {/* Fecha Inicio */}
                  <div>
                    <label className="label">Fecha Inicio *</label>
                    <input type="date" name="fecha" className="input-field" required />
                  </div>

                  {/* Fecha Fin */}
                  <div>
                    <label className="label">Fecha Fin</label>
                    <input type="date" name="fechaFin" className="input-field" />
                  </div>

                  {/* Hora Inicio */}
                  <div>
                    <label className="label">Hora Inicio</label>
                    <input type="time" name="horaInicio" className="input-field" />
                  </div>

                  {/* Hora Fin */}
                  <div>
                    <label className="label">Hora Fin</label>
                    <input type="time" name="horaFin" className="input-field" />
                  </div>

                  {/* Lugar */}
                  <div className="col-span-2">
                    <label className="label">Lugar</label>
                    <input
                      type="text"
                      name="lugar"
                      placeholder="Ej: Auditorio, Patio Central..."
                      className="input-field"
                    />
                  </div>

                  {/* Responsable */}
                  <div>
                    <label className="label">Responsable</label>
                    <select name="responsableId" className="input-field">
                      <option value="">Seleccionar...</option>
                      {profesores.map((prof) => (
                        <option key={prof.id} value={prof.id}>
                          {prof.nombres} {prof.apellidos}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Enviar Recordatorio */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      name="enviarRecordatorio"
                      id="enviarRecordatorio"
                      className="mr-2"
                    />
                    <label htmlFor="enviarRecordatorio" className="text-sm text-gray-700">
                      Enviar Recordatorio
                    </label>
                  </div>

                  {/* Descripción */}
                  <div className="col-span-2">
                    <label className="label">Descripción *</label>
                    <textarea
                      name="descripcion"
                      rows={4}
                      className="input-field"
                      placeholder="Describe los detalles del evento..."
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  onClick={() => setMostrarModalEvento(false)}
                  className="btn-outline"
                >
                  Cancelar
                </button>
                <button type="submit" className="btn-primary">
                  Crear Evento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL: CALENDARIO MENSUAL
      ======================================== */}
      {mostrarCalendarioMensual && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h3 className="text-xl font-bold">Calendario Mensual</h3>
              <button
                onClick={() => setMostrarCalendarioMensual(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              {/* Navegación del Mes */}
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => cambiarMes(-1)}
                  className="btn-outline flex items-center gap-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>
                <h4 className="text-lg font-bold">
                  {mesActual.toLocaleDateString('es-CO', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </h4>
                <button
                  onClick={() => cambiarMes(1)}
                  className="btn-outline flex items-center gap-1"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              <div className="mb-4">
                <button onClick={irAHoy} className="btn-primary text-sm">
                  Ir a Hoy
                </button>
              </div>

              {/* Calendario */}
              <div className="grid grid-cols-7 gap-2">
                {/* Días de la semana */}
                {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map((dia) => (
                  <div
                    key={dia}
                    className="text-center font-semibold text-sm text-gray-600 py-2"
                  >
                    {dia}
                  </div>
                ))}

                {/* Días del mes */}
                {getDiasDelMes(mesActual).map((fecha, index) => {
                  const eventosDelDia = getEventosDelDia(fecha);
                  const esHoy =
                    fecha &&
                    fecha.toDateString() === new Date().toDateString();

                  return (
                    <div
                      key={index}
                      className={`min-h-[80px] border rounded-lg p-2 ${
                        fecha
                          ? 'bg-white hover:bg-gray-50 cursor-pointer'
                          : 'bg-gray-100'
                      } ${esHoy ? 'border-primary border-2' : 'border-gray-200'}`}
                    >
                      {fecha && (
                        <>
                          <div
                            className={`text-sm font-semibold mb-1 ${
                              esHoy ? 'text-primary' : 'text-gray-700'
                            }`}
                          >
                            {fecha.getDate()}
                          </div>
                          <div className="space-y-1">
                            {eventosDelDia.slice(0, 2).map((evento) => (
                              <div
                                key={evento.id}
                                className={`text-xs px-1 py-0.5 rounded truncate ${getTipoEventoColor(
                                  evento.tipo
                                )}`}
                                title={evento.titulo}
                              >
                                {getTipoEventoIcon(evento.tipo)} {evento.titulo}
                              </div>
                            ))}
                            {eventosDelDia.length > 2 && (
                              <div className="text-xs text-gray-500">
                                +{eventosDelDia.length - 2} más
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Leyenda */}
              <div className="mt-6 pt-4 border-t">
                <p className="text-sm font-semibold mb-2">Leyenda:</p>
                <div className="flex flex-wrap gap-3">
                  <div className="flex items-center gap-1 text-xs">
                    <span>🎉</span> Festivo
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span>📅</span> Reunión
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span>🎭</span> Actividad
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span>📝</span> Evaluación
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    <span>🎓</span> Ceremonia
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setMostrarCalendarioMensual(false)}
                className="btn-primary"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para impresión */}
      <style>{`
        @media print {
          .btn-primary,
          .btn-outline,
          .btn-secondary,
          button {
            display: none !important;
          }
          .card {
            box-shadow: none !important;
            border: 1px solid #e5e7eb !important;
          }
          .modal-overlay {
            display: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  );
};

export default Horarios;

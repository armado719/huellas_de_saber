import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Inbox,
  Mail,
  MailOpen,
  X,
  Plus,
  Search,
  Filter,
  Trash2,
  Reply,
  Forward,
  Star,
  Paperclip,
  Check,
  CheckCheck,
  XCircle,
  AlertCircle,
  ArrowLeft,
  Clock,
} from 'lucide-react';
import { mockMensajes, mockProfesores } from '../data/mockData';
import { Mensaje, PrioridadMensaje } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Mensajes: React.FC = () => {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>(mockMensajes);
  const [showNuevoMensaje, setShowNuevoMensaje] = useState(false);
  const [showRespuesta, setShowRespuesta] = useState(false);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<Mensaje | null>(null);
  const [vistaActual, setVistaActual] = useState<'recibidos' | 'enviados'>('recibidos');
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<'todos' | 'noLeidos' | 'importantes' | 'adjuntos'>('todos');
  const [mensajesSeleccionados, setMensajesSeleccionados] = useState<string[]>([]);
  const [showConfirmacion, setShowConfirmacion] = useState(false);
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState('');

  const [nuevoMensaje, setNuevoMensaje] = useState({
    destinatarioId: [] as string[],
    asunto: '',
    contenido: '',
    prioridad: 'Normal' as PrioridadMensaje,
    importante: false,
  });

  // Función para normalizar destinatarioId a array
  const normalizarDestinatario = (destinatarioId: string | string[]): string[] => {
    return Array.isArray(destinatarioId) ? destinatarioId : [destinatarioId];
  };

  // Obtener mensajes recibidos y enviados
  const mensajesRecibidos = useMemo(() => {
    return mensajes.filter((m) => {
      const destinatarios = normalizarDestinatario(m.destinatarioId);
      return destinatarios.includes(user?.id || '1');
    });
  }, [mensajes, user]);

  const mensajesEnviados = useMemo(() => {
    return mensajes.filter((m) => m.remitenteId === user?.id);
  }, [mensajes, user]);

  // Aplicar búsqueda y filtros
  const mensajesFiltrados = useMemo(() => {
    let lista = vistaActual === 'recibidos' ? mensajesRecibidos : mensajesEnviados;

    // Aplicar búsqueda
    if (busqueda) {
      lista = lista.filter(
        (m) =>
          m.asunto.toLowerCase().includes(busqueda.toLowerCase()) ||
          m.contenido.toLowerCase().includes(busqueda.toLowerCase()) ||
          getNombreUsuario(
            vistaActual === 'recibidos' ? m.remitenteId : m.destinatarioId
          )
            .toLowerCase()
            .includes(busqueda.toLowerCase())
      );
    }

    // Aplicar filtros
    if (filtro === 'noLeidos' && vistaActual === 'recibidos') {
      lista = lista.filter((m) => !m.leido);
    } else if (filtro === 'importantes') {
      lista = lista.filter((m) => m.importante || m.prioridad === 'Importante' || m.prioridad === 'Urgente');
    } else if (filtro === 'adjuntos') {
      lista = lista.filter((m) => m.tieneAdjunto);
    }

    return lista;
  }, [mensajesRecibidos, mensajesEnviados, vistaActual, busqueda, filtro]);

  const noLeidos = mensajesRecibidos.filter((m) => !m.leido).length;

  const getNombreUsuario = (id: string | string[]) => {
    // Si es un array, devolver "Múltiples destinatarios"
    if (Array.isArray(id)) {
      if (id.length === 0) return 'Sin destinatario';
      if (id.length === 1) return getNombreUsuario(id[0]);
      return `${id.length} destinatarios`;
    }

    if (id === '1') return 'Administrador Principal';
    const profesor = mockProfesores.find((p) => p.id === id);
    return profesor ? `${profesor.nombres} ${profesor.apellidos}` : 'Usuario';
  };

  const getIniciales = (nombre: string) => {
    const palabras = nombre.split(' ');
    return palabras
      .slice(0, 2)
      .map((p) => p[0])
      .join('')
      .toUpperCase();
  };

  const getTiempoRelativo = (fecha: string) => {
    const ahora = new Date();
    const fechaMensaje = new Date(fecha);
    const diferencia = ahora.getTime() - fechaMensaje.getTime();

    const minutos = Math.floor(diferencia / 60000);
    const horas = Math.floor(diferencia / 3600000);
    const dias = Math.floor(diferencia / 86400000);

    if (minutos < 1) return 'Ahora';
    if (minutos < 60) return `Hace ${minutos} min`;
    if (horas < 24) return `Hace ${horas} hora${horas > 1 ? 's' : ''}`;
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias} días`;

    return fechaMensaje.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const handleEnviarMensaje = () => {
    if (
      nuevoMensaje.destinatarioId.length === 0 ||
      !nuevoMensaje.asunto ||
      !nuevoMensaje.contenido
    ) {
      alert('Por favor completa todos los campos obligatorios');
      return;
    }

    if (nuevoMensaje.asunto.length < 5) {
      alert('El asunto debe tener al menos 5 caracteres');
      return;
    }

    if (nuevoMensaje.contenido.length < 10) {
      alert('El mensaje debe tener al menos 10 caracteres');
      return;
    }

    const mensaje: Mensaje = {
      id: `msg${Date.now()}`,
      remitenteId: user?.id || '1',
      destinatarioId:
        nuevoMensaje.destinatarioId.length === 1
          ? nuevoMensaje.destinatarioId[0]
          : nuevoMensaje.destinatarioId,
      asunto: nuevoMensaje.asunto,
      contenido: nuevoMensaje.contenido,
      fecha: new Date().toISOString(),
      leido: false,
      importante: nuevoMensaje.importante,
      prioridad: nuevoMensaje.prioridad,
      estado: 'Enviado',
    };

    setMensajes([...mensajes, mensaje]);
    setNuevoMensaje({
      destinatarioId: [],
      asunto: '',
      contenido: '',
      prioridad: 'Normal',
      importante: false,
    });
    setShowNuevoMensaje(false);
    mostrarConfirmacionTemporal('Mensaje enviado correctamente ✓');
  };

  const handleResponder = () => {
    if (!mensajeSeleccionado) return;

    setNuevoMensaje({
      destinatarioId: [mensajeSeleccionado.remitenteId],
      asunto: mensajeSeleccionado.asunto.startsWith('Re:')
        ? mensajeSeleccionado.asunto
        : `Re: ${mensajeSeleccionado.asunto}`,
      contenido: '',
      prioridad: 'Normal',
      importante: false,
    });
    setShowRespuesta(true);
  };

  const handleEnviarRespuesta = () => {
    if (!nuevoMensaje.contenido) {
      alert('Por favor escribe tu respuesta');
      return;
    }

    const mensaje: Mensaje = {
      id: `msg${Date.now()}`,
      remitenteId: user?.id || '1',
      destinatarioId: nuevoMensaje.destinatarioId[0],
      asunto: nuevoMensaje.asunto,
      contenido: nuevoMensaje.contenido,
      fecha: new Date().toISOString(),
      leido: false,
      estado: 'Enviado',
      respondidoA: mensajeSeleccionado?.id,
    };

    setMensajes([...mensajes, mensaje]);
    setShowRespuesta(false);
    setNuevoMensaje({
      destinatarioId: [],
      asunto: '',
      contenido: '',
      prioridad: 'Normal',
      importante: false,
    });
    mostrarConfirmacionTemporal('Respuesta enviada correctamente ✓');
  };

  const handleLeerMensaje = (mensaje: Mensaje) => {
    if (!mensaje.leido && vistaActual === 'recibidos') {
      setMensajes(
        mensajes.map((m) => (m.id === mensaje.id ? { ...m, leido: true } : m))
      );
    }
    setMensajeSeleccionado(mensaje);
  };

  const handleMarcarLeido = () => {
    if (mensajesSeleccionados.length === 0) {
      alert('Selecciona al menos un mensaje');
      return;
    }

    setMensajes(
      mensajes.map((m) =>
        mensajesSeleccionados.includes(m.id) ? { ...m, leido: true } : m
      )
    );
    setMensajesSeleccionados([]);
    mostrarConfirmacionTemporal('Mensajes marcados como leídos');
  };

  const handleMarcarNoLeido = () => {
    if (!mensajeSeleccionado) return;

    setMensajes(
      mensajes.map((m) =>
        m.id === mensajeSeleccionado.id ? { ...m, leido: false } : m
      )
    );
    setMensajeSeleccionado(null);
    mostrarConfirmacionTemporal('Mensaje marcado como no leído');
  };

  const handleMarcarImportante = () => {
    if (!mensajeSeleccionado) return;

    setMensajes(
      mensajes.map((m) =>
        m.id === mensajeSeleccionado.id ? { ...m, importante: !m.importante } : m
      )
    );
    setMensajeSeleccionado({
      ...mensajeSeleccionado,
      importante: !mensajeSeleccionado.importante,
    });
    mostrarConfirmacionTemporal(
      mensajeSeleccionado.importante
        ? 'Mensaje desmarcado como importante'
        : 'Mensaje marcado como importante'
    );
  };

  const handleEliminarSeleccionados = () => {
    if (mensajesSeleccionados.length === 0) {
      alert('Selecciona al menos un mensaje');
      return;
    }

    if (confirm(`¿Eliminar ${mensajesSeleccionados.length} mensaje(s)?`)) {
      setMensajes(mensajes.filter((m) => !mensajesSeleccionados.includes(m.id)));
      setMensajesSeleccionados([]);
      mostrarConfirmacionTemporal('Mensajes eliminados');
    }
  };

  const handleEliminarMensaje = () => {
    if (!mensajeSeleccionado) return;

    if (confirm('¿Eliminar este mensaje?')) {
      setMensajes(mensajes.filter((m) => m.id !== mensajeSeleccionado.id));
      setMensajeSeleccionado(null);
      mostrarConfirmacionTemporal('Mensaje eliminado');
    }
  };

  const toggleSeleccionarMensaje = (id: string) => {
    if (mensajesSeleccionados.includes(id)) {
      setMensajesSeleccionados(mensajesSeleccionados.filter((m) => m !== id));
    } else {
      setMensajesSeleccionados([...mensajesSeleccionados, id]);
    }
  };

  const toggleDestinatario = (id: string) => {
    if (nuevoMensaje.destinatarioId.includes(id)) {
      setNuevoMensaje({
        ...nuevoMensaje,
        destinatarioId: nuevoMensaje.destinatarioId.filter((d) => d !== id),
      });
    } else {
      setNuevoMensaje({
        ...nuevoMensaje,
        destinatarioId: [...nuevoMensaje.destinatarioId, id],
      });
    }
  };

  const seleccionarTodosProfesores = () => {
    const todosIds = mockProfesores.map((p) => p.id);
    setNuevoMensaje({ ...nuevoMensaje, destinatarioId: todosIds });
  };

  const mostrarConfirmacionTemporal = (mensaje: string) => {
    setMensajeConfirmacion(mensaje);
    setShowConfirmacion(true);
    setTimeout(() => setShowConfirmacion(false), 3000);
  };

  const getEstadoIcon = (estado?: string) => {
    switch (estado) {
      case 'Leído':
        return <CheckCheck className="w-4 h-4 text-blue-600" title="Leído" />;
      case 'Entregado':
        return <Check className="w-4 h-4 text-gray-600" title="Entregado" />;
      case 'No Entregado':
        return <XCircle className="w-4 h-4 text-red-600" title="No entregado" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" title="Enviado" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <MessageSquare className="w-8 h-8 text-primary mr-3" />
            Mensajería Interna
          </h1>
          <p className="text-gray-600">
            {noLeidos} mensaje{noLeidos !== 1 ? 's' : ''} no leído{noLeidos !== 1 ? 's' : ''} de{' '}
            {mensajesRecibidos.length} total
          </p>
        </div>
        <button onClick={() => setShowNuevoMensaje(true)} className="btn-primary flex items-center">
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Mensaje
        </button>
      </div>

      {/* Notificación de Confirmación */}
      {showConfirmacion && (
        <div className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-2 animate-fade-in">
          <Check className="w-5 h-5" />
          {mensajeConfirmacion}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* ========================================
            SIDEBAR
        ======================================== */}
        <div className="lg:col-span-1">
          <div className="card space-y-2">
            <button
              onClick={() => {
                setVistaActual('recibidos');
                setMensajeSeleccionado(null);
                setMensajesSeleccionados([]);
              }}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                vistaActual === 'recibidos'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <div className="flex items-center">
                <Inbox className="w-5 h-5 mr-3" />
                <span className="font-medium">Recibidos</span>
              </div>
              {noLeidos > 0 && (
                <span className="bg-secondary text-white text-xs font-bold px-2 py-1 rounded-full">
                  {noLeidos}
                </span>
              )}
            </button>
            <button
              onClick={() => {
                setVistaActual('enviados');
                setMensajeSeleccionado(null);
                setMensajesSeleccionados([]);
              }}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                vistaActual === 'enviados'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <Send className="w-5 h-5 mr-3" />
              <span className="font-medium">Enviados</span>
            </button>
          </div>

          {/* Estadísticas */}
          <div className="card mt-4">
            <h3 className="font-semibold text-gray-700 mb-3">Estadísticas</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total recibidos:</span>
                <span className="font-semibold">{mensajesRecibidos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Total enviados:</span>
                <span className="font-semibold">{mensajesEnviados.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">No leídos:</span>
                <span className="font-semibold text-secondary">{noLeidos}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================
            LISTA DE MENSAJES O VISTA DETALLADA
        ======================================== */}
        <div className="lg:col-span-3">
          {!mensajeSeleccionado ? (
            <div className="card">
              {/* Barra de Búsqueda y Filtros */}
              <div className="mb-4 space-y-3">
                <div className="flex flex-col md:flex-row gap-3">
                  {/* Búsqueda */}
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Buscar por remitente o asunto..."
                      value={busqueda}
                      onChange={(e) => setBusqueda(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>

                  {/* Filtros */}
                  <select
                    value={filtro}
                    onChange={(e) =>
                      setFiltro(e.target.value as typeof filtro)
                    }
                    className="input-field w-full md:w-48"
                  >
                    <option value="todos">Todos</option>
                    <option value="noLeidos">No leídos</option>
                    <option value="importantes">Importantes</option>
                    <option value="adjuntos">Con archivos</option>
                  </select>
                </div>

                {/* Acciones */}
                {mensajesSeleccionados.length > 0 && (
                  <div className="flex gap-2 items-center">
                    <span className="text-sm text-gray-600">
                      {mensajesSeleccionados.length} seleccionado(s)
                    </span>
                    {vistaActual === 'recibidos' && (
                      <button
                        onClick={handleMarcarLeido}
                        className="btn-outline text-sm flex items-center gap-1"
                      >
                        <MailOpen className="w-4 h-4" />
                        Marcar leído
                      </button>
                    )}
                    <button
                      onClick={handleEliminarSeleccionados}
                      className="btn-outline text-sm text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-1"
                    >
                      <Trash2 className="w-4 h-4" />
                      Eliminar
                    </button>
                  </div>
                )}
              </div>

              {/* Lista de Mensajes */}
              <div className="space-y-2 max-h-[600px] overflow-y-auto">
                {mensajesFiltrados.map((mensaje) => {
                  const nombreUsuario =
                    vistaActual === 'recibidos'
                      ? getNombreUsuario(mensaje.remitenteId)
                      : getNombreUsuario(mensaje.destinatarioId);

                  return (
                    <div
                      key={mensaje.id}
                      onClick={() => handleLeerMensaje(mensaje)}
                      className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-all ${
                        !mensaje.leido && vistaActual === 'recibidos'
                          ? 'bg-gray-50 border-l-4 border-l-primary font-semibold'
                          : 'border-gray-200 hover:bg-gray-50'
                      } ${
                        mensajesSeleccionados.includes(mensaje.id)
                          ? 'ring-2 ring-primary'
                          : ''
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Checkbox */}
                        <input
                          type="checkbox"
                          checked={mensajesSeleccionados.includes(mensaje.id)}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSeleccionarMensaje(mensaje.id);
                          }}
                          className="mt-1"
                        />

                        {/* Avatar */}
                        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shrink-0">
                          {getIniciales(nombreUsuario)}
                        </div>

                        {/* Contenido */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <div className="flex items-center gap-2 flex-1">
                              <p
                                className={`${
                                  !mensaje.leido && vistaActual === 'recibidos'
                                    ? 'font-bold'
                                    : 'font-medium'
                                } text-gray-800 truncate`}
                              >
                                {nombreUsuario}
                              </p>
                              {mensaje.importante && (
                                <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                              )}
                              {mensaje.tieneAdjunto && (
                                <Paperclip className="w-4 h-4 text-gray-500 shrink-0" />
                              )}
                              {mensaje.respondidoA && (
                                <Reply className="w-4 h-4 text-gray-500 shrink-0" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                              {vistaActual === 'enviados' && getEstadoIcon(mensaje.estado)}
                              <span className="text-xs text-gray-500">
                                {getTiempoRelativo(mensaje.fecha)}
                              </span>
                            </div>
                          </div>

                          <p
                            className={`text-sm mb-1 truncate ${
                              !mensaje.leido && vistaActual === 'recibidos'
                                ? 'font-semibold text-gray-900'
                                : 'text-gray-700'
                            }`}
                          >
                            {mensaje.asunto}
                          </p>

                          <p className="text-sm text-gray-600 line-clamp-1">
                            {mensaje.contenido}
                          </p>

                          {mensaje.prioridad && mensaje.prioridad !== 'Normal' && (
                            <span
                              className={`inline-block mt-1 text-xs px-2 py-0.5 rounded ${
                                mensaje.prioridad === 'Urgente'
                                  ? 'bg-red-100 text-red-700'
                                  : 'bg-orange-100 text-orange-700'
                              }`}
                            >
                              {mensaje.prioridad}
                            </span>
                          )}
                        </div>

                        {/* Ícono de estado leído/no leído */}
                        <div className="shrink-0">
                          {!mensaje.leido && vistaActual === 'recibidos' ? (
                            <Mail className="w-5 h-5 text-primary" />
                          ) : (
                            <MailOpen className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {mensajesFiltrados.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500 text-lg mb-2">No hay mensajes</p>
                    <p className="text-gray-400 text-sm">
                      {busqueda
                        ? 'No se encontraron mensajes con ese criterio de búsqueda'
                        : filtro !== 'todos'
                        ? `No hay mensajes ${filtro === 'noLeidos' ? 'no leídos' : filtro === 'importantes' ? 'importantes' : 'con archivos adjuntos'}`
                        : vistaActual === 'recibidos'
                        ? 'Tu bandeja de entrada está vacía'
                        : 'No has enviado mensajes'}
                    </p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ========================================
                VISTA DETALLADA DEL MENSAJE
            ======================================== */
            <div className="card">
              {/* Header */}
              <div className="flex justify-between items-start mb-6 pb-4 border-b">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <button
                      onClick={() => setMensajeSeleccionado(null)}
                      className="p-2 hover:bg-gray-100 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-800">
                      {mensajeSeleccionado.asunto}
                    </h2>
                    {mensajeSeleccionado.importante && (
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  {mensajeSeleccionado.prioridad &&
                    mensajeSeleccionado.prioridad !== 'Normal' && (
                      <span
                        className={`inline-flex items-center gap-1 text-sm px-3 py-1 rounded ${
                          mensajeSeleccionado.prioridad === 'Urgente'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-orange-100 text-orange-700'
                        }`}
                      >
                        <AlertCircle className="w-4 h-4" />
                        {mensajeSeleccionado.prioridad}
                      </span>
                    )}
                </div>
              </div>

              {/* Información del remitente/destinatario */}
              <div className="mb-6 space-y-3">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
                    {getIniciales(getNombreUsuario(mensajeSeleccionado.remitenteId))}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600">
                      <strong>De:</strong>{' '}
                      {getNombreUsuario(mensajeSeleccionado.remitenteId)}
                    </p>
                    <p className="text-sm text-gray-600">
                      <strong>Para:</strong>{' '}
                      {getNombreUsuario(mensajeSeleccionado.destinatarioId)}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <strong>Fecha:</strong>{' '}
                      {new Date(mensajeSeleccionado.fecha).toLocaleString('es-CO', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              </div>

              {/* Cuerpo del mensaje */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">
                  {mensajeSeleccionado.contenido}
                </p>
              </div>

              {/* Botones de acción */}
              <div className="flex flex-wrap gap-2 pt-4 border-t">
                {vistaActual === 'recibidos' && (
                  <button
                    onClick={handleResponder}
                    className="btn-primary flex items-center gap-2"
                  >
                    <Reply className="w-5 h-5" />
                    Responder
                  </button>
                )}
                <button
                  onClick={handleMarcarImportante}
                  className="btn-outline flex items-center gap-2"
                >
                  <Star
                    className={`w-5 h-5 ${
                      mensajeSeleccionado.importante
                        ? 'fill-yellow-500 text-yellow-500'
                        : ''
                    }`}
                  />
                  {mensajeSeleccionado.importante ? 'Quitar' : 'Marcar'} importante
                </button>
                {vistaActual === 'recibidos' && (
                  <button
                    onClick={handleMarcarNoLeido}
                    className="btn-outline flex items-center gap-2"
                  >
                    <Mail className="w-5 h-5" />
                    Marcar como no leído
                  </button>
                )}
                <button
                  onClick={handleEliminarMensaje}
                  className="btn-outline text-red-600 border-red-600 hover:bg-red-50 flex items-center gap-2"
                >
                  <Trash2 className="w-5 h-5" />
                  Eliminar
                </button>
                <button
                  onClick={() => setMensajeSeleccionado(null)}
                  className="btn-outline ml-auto flex items-center gap-2"
                >
                  <X className="w-5 h-5" />
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          MODAL: NUEVO MENSAJE
      ======================================== */}
      {showNuevoMensaje && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h2 className="text-xl font-bold">Nuevo Mensaje</h2>
              <button
                onClick={() => setShowNuevoMensaje(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              <div className="space-y-4">
                {/* Destinatarios */}
                <div>
                  <label className="label">Destinatarios *</label>
                  <div className="border rounded-lg p-3 max-h-40 overflow-y-auto mb-2">
                    <div className="space-y-2">
                      {/* Opción: Todos los profesores */}
                      <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                        <input
                          type="checkbox"
                          checked={
                            nuevoMensaje.destinatarioId.length ===
                            mockProfesores.length
                          }
                          onChange={seleccionarTodosProfesores}
                          id="todos-profesores"
                        />
                        <label
                          htmlFor="todos-profesores"
                          className="font-semibold text-gray-700 cursor-pointer"
                        >
                          Todos los Profesores ({mockProfesores.length})
                        </label>
                      </div>

                      <div className="border-t pt-2">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          ADMINISTRADORES
                        </p>
                        <div className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                          <input
                            type="checkbox"
                            checked={nuevoMensaje.destinatarioId.includes('1')}
                            onChange={() => toggleDestinatario('1')}
                            id="dest-1"
                          />
                          <label htmlFor="dest-1" className="cursor-pointer">
                            Administrador Principal
                          </label>
                        </div>
                      </div>

                      <div className="border-t pt-2">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                          PROFESORES
                        </p>
                        {mockProfesores.map((profesor) => (
                          <div
                            key={profesor.id}
                            className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded"
                          >
                            <input
                              type="checkbox"
                              checked={nuevoMensaje.destinatarioId.includes(
                                profesor.id
                              )}
                              onChange={() => toggleDestinatario(profesor.id)}
                              id={`dest-${profesor.id}`}
                            />
                            <label
                              htmlFor={`dest-${profesor.id}`}
                              className="cursor-pointer"
                            >
                              {profesor.nombres} {profesor.apellidos}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500">
                    {nuevoMensaje.destinatarioId.length} destinatario(s)
                    seleccionado(s)
                  </p>
                </div>

                {/* Prioridad */}
                <div>
                  <label className="label">Prioridad</label>
                  <select
                    value={nuevoMensaje.prioridad}
                    onChange={(e) =>
                      setNuevoMensaje({
                        ...nuevoMensaje,
                        prioridad: e.target.value as PrioridadMensaje,
                      })
                    }
                    className="input-field"
                  >
                    <option value="Normal">Normal</option>
                    <option value="Importante">Importante</option>
                    <option value="Urgente">Urgente</option>
                  </select>
                </div>

                {/* Marcar como importante */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={nuevoMensaje.importante}
                    onChange={(e) =>
                      setNuevoMensaje({
                        ...nuevoMensaje,
                        importante: e.target.checked,
                      })
                    }
                    id="importante"
                  />
                  <label htmlFor="importante" className="text-sm text-gray-700">
                    Marcar como importante
                  </label>
                </div>

                {/* Asunto */}
                <div>
                  <label className="label">Asunto *</label>
                  <input
                    type="text"
                    value={nuevoMensaje.asunto}
                    onChange={(e) =>
                      setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })
                    }
                    className="input-field"
                    placeholder="Asunto del mensaje (mínimo 5 caracteres)..."
                    minLength={5}
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="label">Mensaje *</label>
                    <span className="text-xs text-gray-500">
                      {nuevoMensaje.contenido.length} caracteres
                    </span>
                  </div>
                  <textarea
                    value={nuevoMensaje.contenido}
                    onChange={(e) =>
                      setNuevoMensaje({
                        ...nuevoMensaje,
                        contenido: e.target.value,
                      })
                    }
                    className="input-field"
                    rows={8}
                    placeholder="Escribe tu mensaje aquí (mínimo 10 caracteres)..."
                    minLength={10}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                onClick={() => setShowNuevoMensaje(false)}
                className="btn-outline"
              >
                Cancelar
              </button>
              <button onClick={handleEnviarMensaje} className="btn-primary flex items-center gap-2">
                <Send className="w-5 h-5" />
                Enviar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          MODAL: RESPONDER
      ======================================== */}
      {showRespuesta && mensajeSeleccionado && (
        <div className="modal-overlay">
          <div className="modal-container modal-lg">
            <div className="modal-header">
              <h2 className="text-xl font-bold">
                Responder a: {mensajeSeleccionado.asunto}
              </h2>
              <button
                onClick={() => setShowRespuesta(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="modal-body">
              <div className="space-y-4">
                {/* Destinatario (solo lectura) */}
                <div>
                  <label className="label">Para:</label>
                  <input
                    type="text"
                    value={getNombreUsuario(mensajeSeleccionado.remitenteId)}
                    readOnly
                    className="input-field bg-gray-100"
                  />
                </div>

                {/* Asunto (editable) */}
                <div>
                  <label className="label">Asunto:</label>
                  <input
                    type="text"
                    value={nuevoMensaje.asunto}
                    onChange={(e) =>
                      setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })
                    }
                    className="input-field"
                  />
                </div>

                {/* Mensaje */}
                <div>
                  <label className="label">Tu respuesta *</label>
                  <textarea
                    value={nuevoMensaje.contenido}
                    onChange={(e) =>
                      setNuevoMensaje({
                        ...nuevoMensaje,
                        contenido: e.target.value,
                      })
                    }
                    className="input-field"
                    rows={6}
                    placeholder="Escribe tu respuesta aquí..."
                  />
                </div>

                {/* Mensaje original (colapsable) */}
                <details className="border rounded-lg">
                  <summary className="cursor-pointer p-3 bg-gray-50 rounded-lg font-medium text-gray-700">
                    Mensaje original
                  </summary>
                  <div className="p-4 bg-gray-50 border-t">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>De:</strong>{' '}
                      {getNombreUsuario(mensajeSeleccionado.remitenteId)}
                    </p>
                    <p className="text-sm text-gray-600 mb-3">
                      <strong>Fecha:</strong>{' '}
                      {new Date(mensajeSeleccionado.fecha).toLocaleString('es-CO')}
                    </p>
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {mensajeSeleccionado.contenido}
                    </p>
                  </div>
                </details>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowRespuesta(false)} className="btn-outline">
                Cancelar
              </button>
              <button
                onClick={handleEnviarRespuesta}
                className="btn-primary flex items-center gap-2"
              >
                <Send className="w-5 h-5" />
                Enviar Respuesta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Estilos para animación */}
      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Mensajes;

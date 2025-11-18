import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Inbox,
  Mail,
  MailOpen,
  X,
  Plus,
} from 'lucide-react';
import { mockMensajes, mockProfesores } from '../data/mockData';
import { Mensaje } from '../types';
import { useAuth } from '../contexts/AuthContext';

const Mensajes: React.FC = () => {
  const { user } = useAuth();
  const [mensajes, setMensajes] = useState<Mensaje[]>(mockMensajes);
  const [showNuevoMensaje, setShowNuevoMensaje] = useState(false);
  const [mensajeSeleccionado, setMensajeSeleccionado] = useState<Mensaje | null>(
    null
  );
  const [nuevoMensaje, setNuevoMensaje] = useState({
    destinatarioId: '',
    asunto: '',
    contenido: '',
  });

  const mensajesRecibidos = mensajes.filter(
    (m) => m.destinatarioId === user?.id
  );
  const mensajesEnviados = mensajes.filter((m) => m.remitenteId === user?.id);

  const [vistaActual, setVistaActual] = useState<'recibidos' | 'enviados'>(
    'recibidos'
  );

  const mensajesMostrados =
    vistaActual === 'recibidos' ? mensajesRecibidos : mensajesEnviados;

  const noLeidos = mensajesRecibidos.filter((m) => !m.leido).length;

  const getNombreUsuario = (id: string) => {
    if (id === '1') return 'Administrador Principal';
    const profesor = mockProfesores.find((p) => p.id === id);
    return profesor ? `${profesor.nombres} ${profesor.apellidos}` : 'Usuario';
  };

  const handleEnviarMensaje = () => {
    if (!nuevoMensaje.destinatarioId || !nuevoMensaje.asunto || !nuevoMensaje.contenido) {
      alert('Por favor completa todos los campos');
      return;
    }

    const mensaje: Mensaje = {
      id: `msg${Date.now()}`,
      remitenteId: user?.id || '1',
      destinatarioId: nuevoMensaje.destinatarioId,
      asunto: nuevoMensaje.asunto,
      contenido: nuevoMensaje.contenido,
      fecha: new Date().toISOString(),
      leido: false,
    };

    setMensajes([...mensajes, mensaje]);
    setNuevoMensaje({ destinatarioId: '', asunto: '', contenido: '' });
    setShowNuevoMensaje(false);
    alert('Mensaje enviado exitosamente');
  };

  const handleLeerMensaje = (mensaje: Mensaje) => {
    if (!mensaje.leido && mensaje.destinatarioId === user?.id) {
      setMensajes(
        mensajes.map((m) =>
          m.id === mensaje.id ? { ...m, leido: true } : m
        )
      );
    }
    setMensajeSeleccionado(mensaje);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center">
            <MessageSquare className="w-8 h-8 text-primary mr-3" />
            Mensajería Interna
          </h1>
          <p className="text-gray-600">
            Comunícate con otros miembros del equipo
          </p>
        </div>
        <button
          onClick={() => setShowNuevoMensaje(true)}
          className="btn-secondary flex items-center"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Mensaje
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <div className="card space-y-2">
            <button
              onClick={() => setVistaActual('recibidos')}
              className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${
                vistaActual === 'recibidos'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
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
              onClick={() => setVistaActual('enviados')}
              className={`w-full flex items-center px-4 py-3 rounded-lg transition-colors ${
                vistaActual === 'enviados'
                  ? 'bg-primary text-white'
                  : 'hover:bg-gray-100'
              }`}
            >
              <Send className="w-5 h-5 mr-3" />
              <span className="font-medium">Enviados</span>
            </button>
          </div>
        </div>

        {/* Lista de Mensajes */}
        <div className="lg:col-span-3">
          {!mensajeSeleccionado ? (
            <div className="card">
              <h2 className="text-xl font-bold text-gray-800 mb-4">
                {vistaActual === 'recibidos'
                  ? 'Mensajes Recibidos'
                  : 'Mensajes Enviados'}
              </h2>

              <div className="space-y-2">
                {mensajesMostrados.map((mensaje) => (
                  <div
                    key={mensaje.id}
                    onClick={() => handleLeerMensaje(mensaje)}
                    className={`border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow ${
                      !mensaje.leido && vistaActual === 'recibidos'
                        ? 'bg-blue-50 border-blue-200'
                        : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center">
                        {!mensaje.leido && vistaActual === 'recibidos' ? (
                          <Mail className="w-5 h-5 text-blue-600 mr-3" />
                        ) : (
                          <MailOpen className="w-5 h-5 text-gray-400 mr-3" />
                        )}
                        <div>
                          <p className="font-semibold text-gray-800">
                            {vistaActual === 'recibidos'
                              ? getNombreUsuario(mensaje.remitenteId)
                              : getNombreUsuario(mensaje.destinatarioId)}
                          </p>
                          <p className="text-sm text-gray-600">
                            {mensaje.asunto}
                          </p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {new Date(mensaje.fecha).toLocaleDateString('es-CO')}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {mensaje.contenido}
                    </p>
                  </div>
                ))}

                {mensajesMostrados.length === 0 && (
                  <div className="text-center py-12">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">No hay mensajes</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="card">
              <div className="flex justify-between items-center mb-6 pb-4 border-b">
                <h2 className="text-xl font-bold text-gray-800">
                  {mensajeSeleccionado.asunto}
                </h2>
                <button
                  onClick={() => setMensajeSeleccionado(null)}
                  className="p-2 hover:bg-gray-100 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mb-4">
                <p className="text-sm text-gray-600">
                  <strong>De:</strong>{' '}
                  {getNombreUsuario(mensajeSeleccionado.remitenteId)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Para:</strong>{' '}
                  {getNombreUsuario(mensajeSeleccionado.destinatarioId)}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Fecha:</strong>{' '}
                  {new Date(mensajeSeleccionado.fecha).toLocaleString('es-CO')}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <p className="text-gray-800 whitespace-pre-wrap">
                  {mensajeSeleccionado.contenido}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Nuevo Mensaje */}
      {showNuevoMensaje && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border-4 border-primary">
            <div className="bg-primary text-white p-6 flex justify-between items-center">
              <h2 className="text-2xl font-bold drop-shadow-lg">Nuevo Mensaje</h2>
              <button
                onClick={() => setShowNuevoMensaje(false)}
                className="p-2 hover:bg-white/20 rounded-lg"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="label">Destinatario</label>
                <select
                  value={nuevoMensaje.destinatarioId}
                  onChange={(e) =>
                    setNuevoMensaje({
                      ...nuevoMensaje,
                      destinatarioId: e.target.value,
                    })
                  }
                  className="input-field"
                >
                  <option value="">Seleccionar destinatario...</option>
                  <option value="1">Administrador Principal</option>
                  {mockProfesores.map((profesor) => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombres} {profesor.apellidos}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Asunto</label>
                <input
                  type="text"
                  value={nuevoMensaje.asunto}
                  onChange={(e) =>
                    setNuevoMensaje({ ...nuevoMensaje, asunto: e.target.value })
                  }
                  className="input-field"
                  placeholder="Asunto del mensaje..."
                />
              </div>

              <div>
                <label className="label">Mensaje</label>
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
                  placeholder="Escribe tu mensaje aquí..."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={() => setShowNuevoMensaje(false)}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleEnviarMensaje}
                  className="btn-primary flex items-center"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Enviar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Mensajes;

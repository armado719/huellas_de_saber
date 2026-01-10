import api from './api';
import { Mensaje } from '../types';

export const mensajesService = {
  getByUsuario: async (usuarioId: string, tipo?: 'enviados' | 'recibidos'): Promise<Mensaje[]> => {
    const response = await api.get('/mensajes', {
      params: { usuario_id: usuarioId, tipo }
    });
    return response.data;
  },

  getById: async (id: string): Promise<Mensaje> => {
    const response = await api.get(`/mensajes/${id}`);
    return response.data;
  },

  contarNoLeidos: async (usuarioId: string): Promise<number> => {
    const response = await api.get('/mensajes/no-leidos', {
      params: { usuario_id: usuarioId }
    });
    return response.data.count;
  },

  create: async (mensaje: Omit<Mensaje, 'id'>): Promise<Mensaje> => {
    const response = await api.post('/mensajes', mensaje);
    return response.data;
  },

  enviarMasivo: async (mensaje: any): Promise<any> => {
    const response = await api.post('/mensajes/masivo', mensaje);
    return response.data;
  },

  responder: async (mensajeId: string, respuesta: string): Promise<Mensaje> => {
    const response = await api.post('/mensajes/responder', {
      mensaje_id: mensajeId,
      respuesta
    });
    return response.data;
  },

  marcarLeido: async (id: string): Promise<void> => {
    await api.put(`/mensajes/${id}/leer`);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/mensajes/${id}`);
  },
};

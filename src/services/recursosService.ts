import { RecursoEducativo } from '../types';
import api from './api';

export const recursosService = {
  getAll: async (tipo?: string, materia?: string): Promise<RecursoEducativo[]> => {
    const response = await api.get('/recursos', {
      params: { tipo, materia }
    });
    return response.data;
  },

  getById: async (id: string): Promise<RecursoEducativo> => {
    const response = await api.get(`/recursos/${id}`);
    return response.data;
  },

  getMasDescargados: async (limit: number = 10): Promise<RecursoEducativo[]> => {
    const response = await api.get('/recursos/mas-descargados', {
      params: { limit }
    });
    return response.data;
  },

  getDestacados: async (): Promise<RecursoEducativo[]> => {
    const response = await api.get('/recursos/destacados');
    return response.data;
  },

  getEstadisticas: async (): Promise<any> => {
    const response = await api.get('/recursos/estadisticas');
    return response.data;
  },

  create: async (formData: FormData): Promise<RecursoEducativo> => {
    const response = await api.post('/recursos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  update: async (id: string, formData: FormData): Promise<RecursoEducativo> => {
    const response = await api.put(`/recursos/${id}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  toggleFavorito: async (id: string, usuarioId: string): Promise<any> => {
    const response = await api.post(`/recursos/${id}/favorito`, { usuario_id: usuarioId });
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/recursos/${id}`);
  },
};

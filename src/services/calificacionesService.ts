import api from './api';
import { Calificacion } from '../types';

export const calificacionesService = {
  getByEstudiante: async (estudianteId: string, periodo?: string): Promise<Calificacion[]> => {
    const response = await api.get('/calificaciones/estudiante', {
      params: { estudiante_id: estudianteId, periodo }
    });
    return response.data;
  },

  getByGrupoMateria: async (grupoId: string, materiaId: string, periodo: string): Promise<Calificacion[]> => {
    const response = await api.get('/calificaciones/grupo-materia', {
      params: { grupo_id: grupoId, materia_id: materiaId, periodo }
    });
    return response.data;
  },

  getBoletin: async (estudianteId: string, periodo: string): Promise<any> => {
    const response = await api.get('/calificaciones/boletin', {
      params: { estudiante_id: estudianteId, periodo }
    });
    return response.data;
  },

  create: async (calificacion: Omit<Calificacion, 'id'>): Promise<Calificacion> => {
    const response = await api.post('/calificaciones', calificacion);
    return response.data;
  },

  createMasivas: async (calificaciones: Omit<Calificacion, 'id'>[]): Promise<Calificacion[]> => {
    const response = await api.post('/calificaciones/masivas', { calificaciones });
    return response.data;
  },

  update: async (id: string, calificacion: Partial<Calificacion>): Promise<Calificacion> => {
    const response = await api.put(`/calificaciones/${id}`, calificacion);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/calificaciones/${id}`);
  },
};

import api from './api';
import { Horario } from '../types';

export const horariosService = {
  getAll: async (): Promise<Horario[]> => {
    const response = await api.get('/horarios');
    return response.data;
  },

  getHorarioMaestro: async (): Promise<any> => {
    const response = await api.get('/horarios/maestro');
    return response.data;
  },

  getByGrupo: async (grupoId: string): Promise<Horario[]> => {
    const response = await api.get(`/horarios/grupo/${grupoId}`);
    return response.data;
  },

  getByProfesor: async (profesorId: string): Promise<Horario[]> => {
    const response = await api.get(`/horarios/profesor/${profesorId}`);
    return response.data;
  },

  create: async (horario: Omit<Horario, 'id'>): Promise<Horario> => {
    const response = await api.post('/horarios', horario);
    return response.data;
  },

  update: async (id: string, horario: Partial<Horario>): Promise<Horario> => {
    const response = await api.put(`/horarios/${id}`, horario);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/horarios/${id}`);
  },
};

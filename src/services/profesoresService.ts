import api from './api';
import { Profesor } from '../types';

// Normaliza datos del backend (snake_case → camelCase, fechas, JSON)
const normalizarProfesor = (data: any): Profesor => {
  return {
    ...data,
    // Normalizar fechas a formato YYYY-MM-DD
    fechaNacimiento: data.fecha_nacimiento?.split('T')[0] || data.fechaNacimiento?.split('T')[0] || '',
    fechaIngreso: data.fecha_ingreso?.split('T')[0] || data.fechaIngreso?.split('T')[0] || '',
    // Parsear niveles de JSON string a array
    niveles: typeof data.niveles === 'string' ? JSON.parse(data.niveles) : (data.niveles || []),
    // Asegurar campos opcionales no rompen el filtro
    especialidad: data.especialidad || '',
    email: data.email || '',
    codigo: data.codigo || '',
  };
};

export const profesoresService = {
  getAll: async (): Promise<Profesor[]> => {
    const response = await api.get('/profesores');
    return response.data.map(normalizarProfesor);
  },

  getById: async (id: string): Promise<Profesor> => {
    const response = await api.get(`/profesores/${id}`);
    return normalizarProfesor(response.data);
  },

  create: async (profesor: Omit<Profesor, 'id'>): Promise<Profesor> => {
    const response = await api.post('/profesores', profesor);
    return normalizarProfesor(response.data);
  },

  update: async (id: string, profesor: Partial<Profesor>): Promise<Profesor> => {
    const response = await api.put(`/profesores/${id}`, profesor);
    return normalizarProfesor(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/profesores/${id}`);
  },

  getHorario: async (id: string): Promise<any> => {
    const response = await api.get(`/profesores/${id}/horario`);
    return response.data;
  },
};

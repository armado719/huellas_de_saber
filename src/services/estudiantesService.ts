import api from './api';
import { Estudiante } from '../types';

// Función para convertir de camelCase a snake_case
const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;

  const snakeCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    snakeCaseObj[snakeKey] = typeof value === 'object' && value !== null ? toSnakeCase(value) : value;
  }
  return snakeCaseObj;
};

// Función para convertir de snake_case a camelCase
const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const camelCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    camelCaseObj[camelKey] = typeof value === 'object' && value !== null ? toCamelCase(value) : value;
  }
  return camelCaseObj;
};

export const estudiantesService = {
  getAll: async (): Promise<Estudiante[]> => {
    const response = await api.get('/estudiantes');
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  getById: async (id: string): Promise<Estudiante> => {
    const response = await api.get(`/estudiantes/${id}`);
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  create: async (estudiante: Omit<Estudiante, 'id'>): Promise<Estudiante> => {
    // Convertir de camelCase a snake_case antes de enviar
    const estudianteSnakeCase = toSnakeCase(estudiante);
    const response = await api.post('/estudiantes', estudianteSnakeCase);
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  update: async (id: string, estudiante: Partial<Estudiante>): Promise<Estudiante> => {
    // Convertir de camelCase a snake_case antes de enviar
    const estudianteSnakeCase = toSnakeCase(estudiante);
    const response = await api.put(`/estudiantes/${id}`, estudianteSnakeCase);
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/estudiantes/${id}`);
  },

  getByNivel: async (nivel: string): Promise<Estudiante[]> => {
    const response = await api.get(`/estudiantes/nivel/${nivel}`);
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },
};

import { Pago } from '../types';
import api from './api';

// Función para convertir de camelCase a snake_case
const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;

  const snakeCaseObj: any = {};
  for (const [key, value] of Object.entries(obj)) {
    // Manejar casos especiales
    let snakeKey: string;
    if (key === 'año') {
      snakeKey = 'año'; // Mantener año como está
    } else {
      snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    }
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
    // Manejar casos especiales
    let camelKey: string;
    if (key === 'año') {
      camelKey = 'año'; // Mantener año como está
    } else {
      camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    }
    camelCaseObj[camelKey] = typeof value === 'object' && value !== null ? toCamelCase(value) : value;
  }
  return camelCaseObj;
};

export const pagosService = {
  getAll: async (estado?: string, mes?: string): Promise<Pago[]> => {
    const response = await api.get('/pagos', {
      params: { estado, mes }
    });
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  getById: async (id: string): Promise<Pago> => {
    const response = await api.get(`/pagos/${id}`);
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  getByEstudiante: async (estudianteId: string): Promise<Pago[]> => {
    const response = await api.get(`/pagos/estudiante/${estudianteId}`);
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  getEstadisticas: async (): Promise<any> => {
    const response = await api.get('/pagos/estadisticas');
    return response.data;
  },

  getReporteMorosidad: async (): Promise<any> => {
    const response = await api.get('/pagos/morosidad');
    return response.data;
  },

  create: async (pago: Omit<Pago, 'id'>): Promise<Pago> => {
    try {
      // Convertir de camelCase a snake_case antes de enviar
      const pagoSnakeCase = toSnakeCase(pago);
      console.log('Enviando pago al backend:', pagoSnakeCase);
      const response = await api.post('/pagos', pagoSnakeCase);
      // Convertir de snake_case a camelCase después de recibir
      return toCamelCase(response.data);
    } catch (error: any) {
      console.error('Error en pagosService.create:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error message:', error.message);
      
      // Extraer el mensaje de error de la respuesta de Axios
      let errorMessage = 'Error al crear pago';
      
      if (error.response) {
        // El servidor respondió con un código de estado fuera del rango 2xx
        const responseData = error.response.data;
        if (responseData?.error) {
          errorMessage = responseData.error;
          // Si hay detalles adicionales, agregarlos
          if (responseData.details) {
            errorMessage += `: ${responseData.details}`;
          }
        } else if (responseData?.message) {
          errorMessage = responseData.message;
        } else if (typeof responseData === 'string') {
          errorMessage = responseData;
        }
      } else if (error.request) {
        // La petición fue hecha pero no se recibió respuesta
        errorMessage = 'No se pudo conectar con el servidor. Verifique su conexión.';
      } else {
        // Algo pasó al configurar la petición
        errorMessage = error.message || 'Error al crear pago';
      }
      
      throw new Error(errorMessage);
    }
  },

  update: async (id: string, pago: Partial<Pago>): Promise<Pago> => {
    // Convertir de camelCase a snake_case antes de enviar
    const pagoSnakeCase = toSnakeCase(pago);
    const response = await api.put(`/pagos/${id}`, pagoSnakeCase);
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  registrarPago: async (id: string, datosPago: any): Promise<Pago> => {
    // Convertir de camelCase a snake_case antes de enviar
    const datosSnakeCase = toSnakeCase(datosPago);
    const response = await api.put(`/pagos/${id}/registrar`, datosSnakeCase);
    // Convertir de snake_case a camelCase después de recibir
    return toCamelCase(response.data);
  },

  registrarAbono: async (pagoId: string, abono: any): Promise<any> => {
    // Convertir de camelCase a snake_case antes de enviar
    const abonoSnakeCase = toSnakeCase({ pagoId, ...abono });
    const response = await api.post('/pagos/abono', abonoSnakeCase);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/pagos/${id}`);
  },
};

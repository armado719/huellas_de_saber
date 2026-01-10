import { AsistenciaRegistro } from '../types';
import api from './api';

export const asistenciaService = {
  getByGrupoFecha: async (grupoId: string, fecha: string): Promise<AsistenciaRegistro[]> => {
    const response = await api.get('/asistencia/grupo', {
      params: { grupo_id: grupoId, fecha }
    });
    return response.data;
  },

  getByEstudiante: async (estudianteId: string, fechaInicio?: string, fechaFin?: string): Promise<AsistenciaRegistro[]> => {
    const response = await api.get('/asistencia/estudiante', {
      params: { estudiante_id: estudianteId, fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
    return response.data;
  },

  getEstadisticas: async (estudianteId?: string, grupoId?: string): Promise<any> => {
    const response = await api.get('/asistencia/estadisticas', {
      params: { estudiante_id: estudianteId, grupo_id: grupoId }
    });
    return response.data;
  },

  getReporteGrupo: async (grupoId: string, fechaInicio: string, fechaFin: string): Promise<any> => {
    const response = await api.get('/asistencia/reporte-grupo', {
      params: { grupo_id: grupoId, fecha_inicio: fechaInicio, fecha_fin: fechaFin }
    });
    return response.data;
  },

  create: async (asistencia: Omit<AsistenciaRegistro, 'id'>): Promise<AsistenciaRegistro> => {
    const response = await api.post('/asistencia', asistencia);
    return response.data;
  },

  createMasiva: async (asistencias: Omit<AsistenciaRegistro, 'id'>[]): Promise<AsistenciaRegistro[]> => {
    const response = await api.post('/asistencia/masiva', { asistencias });
    return response.data;
  },

  update: async (id: string, asistencia: Partial<AsistenciaRegistro>): Promise<AsistenciaRegistro> => {
    const response = await api.put(`/asistencia/${id}`, asistencia);
    return response.data;
  },
};

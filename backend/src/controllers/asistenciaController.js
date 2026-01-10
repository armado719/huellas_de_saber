const db = require('../config/database');

const asistenciaController = {
  // Obtener asistencia por grupo y fecha
  getByGrupoFecha: async (req, res) => {
    try {
      const { grupo_id, fecha } = req.query;

      const [rows] = await db.query(`
        SELECT a.*, e.nombres, e.apellidos, e.identificacion
        FROM asistencia a
        INNER JOIN estudiantes e ON a.estudiante_id = e.id
        WHERE a.grupo_id = ? AND a.fecha = ?
        ORDER BY e.apellidos, e.nombres
      `, [grupo_id, fecha]);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener asistencia' });
    }
  },

  // Obtener asistencia por estudiante
  getByEstudiante: async (req, res) => {
    try {
      const { estudiante_id, fecha_inicio, fecha_fin } = req.query;

      const [rows] = await db.query(`
        SELECT a.*, g.nombre as grupo_nombre, g.nivel
        FROM asistencia a
        INNER JOIN grupos g ON a.grupo_id = g.id
        WHERE a.estudiante_id = ?
          AND a.fecha BETWEEN ? AND ?
        ORDER BY a.fecha DESC
      `, [estudiante_id, fecha_inicio, fecha_fin]);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener asistencia' });
    }
  },

  // Registrar asistencia individual
  create: async (req, res) => {
    try {
      const {
        estudiante_id, grupo_id, fecha, estado, observaciones
      } = req.body;

      // Verificar si ya existe registro
      const [existing] = await db.query(
        'SELECT id FROM asistencia WHERE estudiante_id = ? AND fecha = ?',
        [estudiante_id, fecha]
      );

      if (existing.length > 0) {
        return res.status(400).json({
          error: 'Ya existe un registro de asistencia para este estudiante en esta fecha'
        });
      }

      const [result] = await db.query(`
        INSERT INTO asistencia (
          estudiante_id, grupo_id, fecha, estado, observaciones
        ) VALUES (?, ?, ?, ?, ?)
      `, [estudiante_id, grupo_id, fecha, estado, observaciones]);

      res.status(201).json({
        message: 'Asistencia registrada exitosamente',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al registrar asistencia' });
    }
  },

  // Registrar asistencia masiva (todo un grupo)
  createMasiva: async (req, res) => {
    try {
      const { grupo_id, fecha, asistencias } = req.body;

      // Eliminar registros previos de ese día para ese grupo
      await db.query(
        'DELETE FROM asistencia WHERE grupo_id = ? AND fecha = ?',
        [grupo_id, fecha]
      );

      // Insertar nuevos registros
      for (const asist of asistencias) {
        await db.query(`
          INSERT INTO asistencia (
            estudiante_id, grupo_id, fecha, estado, observaciones
          ) VALUES (?, ?, ?, ?, ?)
        `, [
          asist.estudiante_id,
          grupo_id,
          fecha,
          asist.estado,
          asist.observaciones || null
        ]);
      }

      res.status(201).json({
        message: 'Asistencia masiva registrada exitosamente',
        total: asistencias.length
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al registrar asistencia masiva' });
    }
  },

  // Actualizar asistencia
  update: async (req, res) => {
    try {
      const { estado, observaciones } = req.body;

      await db.query(
        'UPDATE asistencia SET estado = ?, observaciones = ? WHERE id = ?',
        [estado, observaciones, req.params.id]
      );

      res.json({ message: 'Asistencia actualizada exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al actualizar asistencia' });
    }
  },

  // Estadísticas de asistencia por estudiante
  getEstadisticas: async (req, res) => {
    try {
      const { estudiante_id, fecha_inicio, fecha_fin } = req.query;

      const [stats] = await db.query(`
        SELECT
          COUNT(*) as total,
          SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as presentes,
          SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) as ausentes,
          SUM(CASE WHEN estado = 'tardanza' THEN 1 ELSE 0 END) as tardanzas,
          SUM(CASE WHEN estado = 'excusa' THEN 1 ELSE 0 END) as excusas,
          ROUND(
            (SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
            2
          ) as porcentaje_asistencia
        FROM asistencia
        WHERE estudiante_id = ?
          AND fecha BETWEEN ? AND ?
      `, [estudiante_id, fecha_inicio, fecha_fin]);

      res.json(stats[0]);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  },

  // Reporte de asistencia por grupo
  getReporteGrupo: async (req, res) => {
    try {
      const { grupo_id, fecha_inicio, fecha_fin } = req.query;

      const [rows] = await db.query(`
        SELECT
          e.id,
          e.identificacion,
          e.nombres,
          e.apellidos,
          COUNT(*) as total_dias,
          SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) as presentes,
          SUM(CASE WHEN a.estado = 'ausente' THEN 1 ELSE 0 END) as ausentes,
          SUM(CASE WHEN a.estado = 'tardanza' THEN 1 ELSE 0 END) as tardanzas,
          ROUND(
            (SUM(CASE WHEN a.estado = 'presente' THEN 1 ELSE 0 END) * 100.0) / COUNT(*),
            2
          ) as porcentaje_asistencia
        FROM estudiantes e
        LEFT JOIN asistencia a ON e.id = a.estudiante_id
          AND a.fecha BETWEEN ? AND ?
        WHERE e.grupo_id = ? AND e.estado = 'activo'
        GROUP BY e.id
        ORDER BY e.apellidos, e.nombres
      `, [fecha_inicio, fecha_fin, grupo_id]);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener reporte' });
    }
  }
};

module.exports = asistenciaController;

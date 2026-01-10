const db = require('../config/database');

const calificacionesController = {
  // Obtener calificaciones por estudiante
  getByEstudiante: async (req, res) => {
    try {
      const { estudiante_id, periodo } = req.query;

      let query = `
        SELECT c.*, m.nombre as materia_nombre, m.area,
               p.nombres as profesor_nombres, p.apellidos as profesor_apellidos
        FROM calificaciones c
        INNER JOIN materias m ON c.materia_id = m.id
        LEFT JOIN profesores p ON c.profesor_id = p.id
        WHERE c.estudiante_id = ?
      `;

      const params = [estudiante_id];

      if (periodo) {
        query += ' AND c.periodo = ?';
        params.push(periodo);
      }

      query += ' ORDER BY m.nombre, c.periodo';

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
  },

  // Obtener calificaciones por grupo y materia
  getByGrupoMateria: async (req, res) => {
    try {
      const { grupo_id, materia_id, periodo } = req.query;

      const [rows] = await db.query(`
        SELECT c.*, e.nombres, e.apellidos, e.identificacion
        FROM calificaciones c
        INNER JOIN estudiantes e ON c.estudiante_id = e.id
        WHERE c.grupo_id = ? AND c.materia_id = ? AND c.periodo = ?
        ORDER BY e.apellidos, e.nombres
      `, [grupo_id, materia_id, periodo]);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener calificaciones' });
    }
  },

  // Crear calificación
  create: async (req, res) => {
    try {
      const {
        estudiante_id, grupo_id, materia_id, periodo, profesor_id,
        nota_numerica, nota_cualitativa, observaciones
      } = req.body;

      // Verificar si ya existe
      const [existing] = await db.query(`
        SELECT id FROM calificaciones
        WHERE estudiante_id = ? AND materia_id = ? AND periodo = ?
      `, [estudiante_id, materia_id, periodo]);

      if (existing.length > 0) {
        return res.status(400).json({
          error: 'Ya existe una calificación para este estudiante en esta materia y periodo'
        });
      }

      const [result] = await db.query(`
        INSERT INTO calificaciones (
          estudiante_id, grupo_id, materia_id, periodo, profesor_id,
          nota_numerica, nota_cualitativa, observaciones
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        estudiante_id, grupo_id, materia_id, periodo, profesor_id,
        nota_numerica, nota_cualitativa, observaciones
      ]);

      res.status(201).json({
        message: 'Calificación creada exitosamente',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al crear calificación' });
    }
  },

  // Actualizar calificación
  update: async (req, res) => {
    try {
      const {
        nota_numerica, nota_cualitativa, observaciones
      } = req.body;

      await db.query(`
        UPDATE calificaciones SET
          nota_numerica = ?, nota_cualitativa = ?, observaciones = ?
        WHERE id = ?
      `, [nota_numerica, nota_cualitativa, observaciones, req.params.id]);

      res.json({ message: 'Calificación actualizada exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al actualizar calificación' });
    }
  },

  // Eliminar calificación
  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM calificaciones WHERE id = ?', [req.params.id]);
      res.json({ message: 'Calificación eliminada exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al eliminar calificación' });
    }
  },

  // Obtener boletín completo de un estudiante
  getBoletin: async (req, res) => {
    try {
      const { estudiante_id, periodo } = req.query;

      // Información del estudiante
      const [estudiante] = await db.query(`
        SELECT e.*, g.nombre as grupo_nombre, g.nivel
        FROM estudiantes e
        INNER JOIN grupos g ON e.grupo_id = g.id
        WHERE e.id = ?
      `, [estudiante_id]);

      if (estudiante.length === 0) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      // Calificaciones del periodo
      const [calificaciones] = await db.query(`
        SELECT c.*, m.nombre as materia_nombre, m.area, m.intensidad_horaria
        FROM calificaciones c
        INNER JOIN materias m ON c.materia_id = m.id
        WHERE c.estudiante_id = ? AND c.periodo = ?
        ORDER BY m.area, m.nombre
      `, [estudiante_id, periodo]);

      // Calcular promedios por área
      const [promedios] = await db.query(`
        SELECT
          m.area,
          AVG(c.nota_numerica) as promedio_area,
          COUNT(*) as total_materias
        FROM calificaciones c
        INNER JOIN materias m ON c.materia_id = m.id
        WHERE c.estudiante_id = ? AND c.periodo = ?
        GROUP BY m.area
      `, [estudiante_id, periodo]);

      // Promedio general
      const [general] = await db.query(`
        SELECT AVG(nota_numerica) as promedio_general
        FROM calificaciones
        WHERE estudiante_id = ? AND periodo = ?
      `, [estudiante_id, periodo]);

      res.json({
        estudiante: estudiante[0],
        calificaciones,
        promedios,
        promedio_general: general[0].promedio_general
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener boletín' });
    }
  },

  // Registrar calificaciones masivas
  createMasivas: async (req, res) => {
    try {
      const { calificaciones } = req.body;

      for (const cal of calificaciones) {
        // Verificar si existe
        const [existing] = await db.query(`
          SELECT id FROM calificaciones
          WHERE estudiante_id = ? AND materia_id = ? AND periodo = ?
        `, [cal.estudiante_id, cal.materia_id, cal.periodo]);

        if (existing.length > 0) {
          // Actualizar
          await db.query(`
            UPDATE calificaciones SET
              nota_numerica = ?, nota_cualitativa = ?, observaciones = ?
            WHERE id = ?
          `, [
            cal.nota_numerica,
            cal.nota_cualitativa,
            cal.observaciones,
            existing[0].id
          ]);
        } else {
          // Crear
          await db.query(`
            INSERT INTO calificaciones (
              estudiante_id, grupo_id, materia_id, periodo, profesor_id,
              nota_numerica, nota_cualitativa, observaciones
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            cal.estudiante_id, cal.grupo_id, cal.materia_id, cal.periodo,
            cal.profesor_id, cal.nota_numerica, cal.nota_cualitativa,
            cal.observaciones
          ]);
        }
      }

      res.status(201).json({
        message: 'Calificaciones masivas registradas exitosamente',
        total: calificaciones.length
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al registrar calificaciones masivas' });
    }
  }
};

module.exports = calificacionesController;

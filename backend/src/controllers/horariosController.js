const db = require('../config/database');

const horariosController = {
  // Obtener todos los horarios
  getAll: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT h.*,
               g.nombre as grupo_nombre, g.nivel,
               m.nombre as materia_nombre,
               p.nombres as profesor_nombres, p.apellidos as profesor_apellidos
        FROM horarios h
        INNER JOIN grupos g ON h.grupo_id = g.id
        INNER JOIN materias m ON h.materia_id = m.id
        LEFT JOIN profesores p ON h.profesor_id = p.id
        ORDER BY g.nombre,
                 FIELD(h.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
                 h.hora_inicio
      `);
      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener horarios' });
    }
  },

  // Obtener horario por grupo
  getByGrupo: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT h.*,
               m.nombre as materia_nombre, m.color,
               p.nombres as profesor_nombres, p.apellidos as profesor_apellidos
        FROM horarios h
        INNER JOIN materias m ON h.materia_id = m.id
        LEFT JOIN profesores p ON h.profesor_id = p.id
        WHERE h.grupo_id = ?
        ORDER BY FIELD(h.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
                 h.hora_inicio
      `, [req.params.grupo_id]);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener horario del grupo' });
    }
  },

  // Obtener horario por profesor
  getByProfesor: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT h.*,
               g.nombre as grupo_nombre, g.nivel,
               m.nombre as materia_nombre, m.color
        FROM horarios h
        INNER JOIN grupos g ON h.grupo_id = g.id
        INNER JOIN materias m ON h.materia_id = m.id
        WHERE h.profesor_id = ?
        ORDER BY FIELD(h.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
                 h.hora_inicio
      `, [req.params.profesor_id]);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener horario del profesor' });
    }
  },

  // Crear horario
  create: async (req, res) => {
    try {
      const {
        grupo_id, materia_id, profesor_id, dia_semana,
        hora_inicio, hora_fin, aula
      } = req.body;

      // Verificar conflictos de horario para el grupo
      const [conflictoGrupo] = await db.query(`
        SELECT id FROM horarios
        WHERE grupo_id = ? AND dia_semana = ?
          AND ((hora_inicio <= ? AND hora_fin > ?)
               OR (hora_inicio < ? AND hora_fin >= ?)
               OR (hora_inicio >= ? AND hora_fin <= ?))
      `, [grupo_id, dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]);

      if (conflictoGrupo.length > 0) {
        return res.status(400).json({
          error: 'Conflicto de horario: El grupo ya tiene una clase en ese horario'
        });
      }

      // Verificar conflictos de horario para el profesor
      const [conflictoProfesor] = await db.query(`
        SELECT id FROM horarios
        WHERE profesor_id = ? AND dia_semana = ?
          AND ((hora_inicio <= ? AND hora_fin > ?)
               OR (hora_inicio < ? AND hora_fin >= ?)
               OR (hora_inicio >= ? AND hora_fin <= ?))
      `, [profesor_id, dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]);

      if (conflictoProfesor.length > 0) {
        return res.status(400).json({
          error: 'Conflicto de horario: El profesor ya tiene una clase en ese horario'
        });
      }

      const [result] = await db.query(`
        INSERT INTO horarios (
          grupo_id, materia_id, profesor_id, dia_semana,
          hora_inicio, hora_fin, aula
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [grupo_id, materia_id, profesor_id, dia_semana, hora_inicio, hora_fin, aula]);

      res.status(201).json({
        message: 'Horario creado exitosamente',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al crear horario' });
    }
  },

  // Actualizar horario
  update: async (req, res) => {
    try {
      const {
        grupo_id, materia_id, profesor_id, dia_semana,
        hora_inicio, hora_fin, aula
      } = req.body;

      // Verificar conflictos (excluyendo el horario actual)
      const [conflictoGrupo] = await db.query(`
        SELECT id FROM horarios
        WHERE id != ? AND grupo_id = ? AND dia_semana = ?
          AND ((hora_inicio <= ? AND hora_fin > ?)
               OR (hora_inicio < ? AND hora_fin >= ?)
               OR (hora_inicio >= ? AND hora_fin <= ?))
      `, [req.params.id, grupo_id, dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]);

      if (conflictoGrupo.length > 0) {
        return res.status(400).json({
          error: 'Conflicto de horario: El grupo ya tiene una clase en ese horario'
        });
      }

      const [conflictoProfesor] = await db.query(`
        SELECT id FROM horarios
        WHERE id != ? AND profesor_id = ? AND dia_semana = ?
          AND ((hora_inicio <= ? AND hora_fin > ?)
               OR (hora_inicio < ? AND hora_fin >= ?)
               OR (hora_inicio >= ? AND hora_fin <= ?))
      `, [req.params.id, profesor_id, dia_semana, hora_inicio, hora_inicio, hora_fin, hora_fin, hora_inicio, hora_fin]);

      if (conflictoProfesor.length > 0) {
        return res.status(400).json({
          error: 'Conflicto de horario: El profesor ya tiene una clase en ese horario'
        });
      }

      await db.query(`
        UPDATE horarios SET
          grupo_id = ?, materia_id = ?, profesor_id = ?, dia_semana = ?,
          hora_inicio = ?, hora_fin = ?, aula = ?
        WHERE id = ?
      `, [grupo_id, materia_id, profesor_id, dia_semana, hora_inicio, hora_fin, aula, req.params.id]);

      res.json({ message: 'Horario actualizado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al actualizar horario' });
    }
  },

  // Eliminar horario
  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM horarios WHERE id = ?', [req.params.id]);
      res.json({ message: 'Horario eliminado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al eliminar horario' });
    }
  },

  // Obtener horario maestro (todos los grupos)
  getHorarioMaestro: async (req, res) => {
    try {
      const [grupos] = await db.query('SELECT * FROM grupos ORDER BY nivel, nombre');

      const horarioMaestro = [];

      for (const grupo of grupos) {
        const [horarios] = await db.query(`
          SELECT h.*,
                 m.nombre as materia_nombre, m.color,
                 p.nombres as profesor_nombres, p.apellidos as profesor_apellidos
          FROM horarios h
          INNER JOIN materias m ON h.materia_id = m.id
          LEFT JOIN profesores p ON h.profesor_id = p.id
          WHERE h.grupo_id = ?
          ORDER BY FIELD(h.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
                   h.hora_inicio
        `, [grupo.id]);

        horarioMaestro.push({
          grupo,
          horarios
        });
      }

      res.json(horarioMaestro);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener horario maestro' });
    }
  }
};

module.exports = horariosController;

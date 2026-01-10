const db = require('../config/database');

const mensajesController = {
  // Obtener mensajes del usuario (recibidos y enviados)
  getByUsuario: async (req, res) => {
    try {
      const { usuario_id, tipo } = req.query;

      let query = `
        SELECT m.*,
               CASE
                 WHEN m.remitente_tipo = 'profesor' THEN
                   (SELECT CONCAT(nombres, ' ', apellidos) FROM profesores WHERE id = m.remitente_id)
                 WHEN m.remitente_tipo = 'acudiente' THEN
                   (SELECT CONCAT(nombres, ' ', apellidos) FROM acudientes WHERE id = m.remitente_id)
                 ELSE 'Administración'
               END as remitente_nombre,
               CASE
                 WHEN m.destinatario_tipo = 'profesor' THEN
                   (SELECT CONCAT(nombres, ' ', apellidos) FROM profesores WHERE id = m.destinatario_id)
                 WHEN m.destinatario_tipo = 'acudiente' THEN
                   (SELECT CONCAT(nombres, ' ', apellidos) FROM acudientes WHERE id = m.destinatario_id)
                 ELSE 'Administración'
               END as destinatario_nombre
        FROM mensajes m
        WHERE
      `;

      const params = [];

      if (tipo === 'recibidos') {
        query += ' (m.destinatario_id = ? OR m.destinatario_tipo = "todos")';
        params.push(usuario_id);
      } else if (tipo === 'enviados') {
        query += ' m.remitente_id = ?';
        params.push(usuario_id);
      } else {
        query += ' (m.remitente_id = ? OR m.destinatario_id = ? OR m.destinatario_tipo = "todos")';
        params.push(usuario_id, usuario_id);
      }

      query += ' ORDER BY m.fecha_envio DESC';

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener mensajes' });
    }
  },

  // Obtener mensaje por ID
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT m.*,
               CASE
                 WHEN m.remitente_tipo = 'profesor' THEN
                   (SELECT CONCAT(nombres, ' ', apellidos) FROM profesores WHERE id = m.remitente_id)
                 WHEN m.remitente_tipo = 'acudiente' THEN
                   (SELECT CONCAT(nombres, ' ', apellidos) FROM acudientes WHERE id = m.remitente_id)
                 ELSE 'Administración'
               END as remitente_nombre,
               CASE
                 WHEN m.destinatario_tipo = 'profesor' THEN
                   (SELECT CONCAT(nombres, ' ', apellidos) FROM profesores WHERE id = m.destinatario_id)
                 WHEN m.destinatario_tipo = 'acudiente' THEN
                   (SELECT CONCAT(nombres, ' ', apellidos) FROM acudientes WHERE id = m.destinatario_id)
                 ELSE 'Administración'
               END as destinatario_nombre
        FROM mensajes m
        WHERE m.id = ?
      `, [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Mensaje no encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener mensaje' });
    }
  },

  // Enviar mensaje
  create: async (req, res) => {
    try {
      const {
        remitente_id, remitente_tipo,
        destinatario_id, destinatario_tipo,
        asunto, mensaje, prioridad
      } = req.body;

      const [result] = await db.query(`
        INSERT INTO mensajes (
          remitente_id, remitente_tipo,
          destinatario_id, destinatario_tipo,
          asunto, mensaje, prioridad, leido
        ) VALUES (?, ?, ?, ?, ?, ?, ?, false)
      `, [
        remitente_id, remitente_tipo,
        destinatario_id || null, destinatario_tipo,
        asunto, mensaje, prioridad || 'normal'
      ]);

      res.status(201).json({
        message: 'Mensaje enviado exitosamente',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al enviar mensaje' });
    }
  },

  // Marcar mensaje como leído
  marcarLeido: async (req, res) => {
    try {
      await db.query(
        'UPDATE mensajes SET leido = true, fecha_lectura = NOW() WHERE id = ?',
        [req.params.id]
      );

      res.json({ message: 'Mensaje marcado como leído' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al marcar mensaje como leído' });
    }
  },

  // Eliminar mensaje
  delete: async (req, res) => {
    try {
      await db.query('DELETE FROM mensajes WHERE id = ?', [req.params.id]);
      res.json({ message: 'Mensaje eliminado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al eliminar mensaje' });
    }
  },

  // Contar mensajes no leídos
  contarNoLeidos: async (req, res) => {
    try {
      const { usuario_id } = req.query;

      const [result] = await db.query(`
        SELECT COUNT(*) as total
        FROM mensajes
        WHERE destinatario_id = ? AND leido = false
      `, [usuario_id]);

      res.json({ total: result[0].total });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al contar mensajes no leídos' });
    }
  },

  // Enviar mensaje masivo (a un grupo completo)
  enviarMasivo: async (req, res) => {
    try {
      const {
        remitente_id, remitente_tipo,
        grupo_id, destinatario_tipo,
        asunto, mensaje, prioridad
      } = req.body;

      let destinatarios = [];

      // Obtener destinatarios según el tipo
      if (destinatario_tipo === 'acudientes') {
        // Obtener acudientes de estudiantes del grupo
        const [rows] = await db.query(`
          SELECT DISTINCT a.id
          FROM acudientes a
          INNER JOIN estudiantes e ON a.estudiante_id = e.id
          WHERE e.grupo_id = ? AND e.estado = 'activo'
        `, [grupo_id]);
        destinatarios = rows;
      } else if (destinatario_tipo === 'profesores') {
        // Obtener profesores que dan clase al grupo
        const [rows] = await db.query(`
          SELECT DISTINCT profesor_id as id
          FROM horarios
          WHERE grupo_id = ?
        `, [grupo_id]);
        destinatarios = rows;
      }

      // Insertar mensajes
      for (const dest of destinatarios) {
        await db.query(`
          INSERT INTO mensajes (
            remitente_id, remitente_tipo,
            destinatario_id, destinatario_tipo,
            asunto, mensaje, prioridad, leido
          ) VALUES (?, ?, ?, ?, ?, ?, ?, false)
        `, [
          remitente_id, remitente_tipo,
          dest.id, destinatario_tipo === 'acudientes' ? 'acudiente' : 'profesor',
          asunto, mensaje, prioridad || 'normal'
        ]);
      }

      res.status(201).json({
        message: 'Mensajes enviados exitosamente',
        total: destinatarios.length
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al enviar mensajes masivos' });
    }
  },

  // Responder mensaje
  responder: async (req, res) => {
    try {
      const { mensaje_original_id, mensaje } = req.body;

      // Obtener mensaje original
      const [original] = await db.query(
        'SELECT * FROM mensajes WHERE id = ?',
        [mensaje_original_id]
      );

      if (original.length === 0) {
        return res.status(404).json({ error: 'Mensaje original no encontrado' });
      }

      // Crear respuesta (invertir remitente y destinatario)
      const [result] = await db.query(`
        INSERT INTO mensajes (
          remitente_id, remitente_tipo,
          destinatario_id, destinatario_tipo,
          asunto, mensaje, prioridad, leido
        ) VALUES (?, ?, ?, ?, ?, ?, ?, false)
      `, [
        original[0].destinatario_id, original[0].destinatario_tipo,
        original[0].remitente_id, original[0].remitente_tipo,
        'RE: ' + original[0].asunto,
        mensaje,
        original[0].prioridad
      ]);

      res.status(201).json({
        message: 'Respuesta enviada exitosamente',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al responder mensaje' });
    }
  }
};

module.exports = mensajesController;

const db = require('../config/database');

const estudiantesController = {
  // Obtener todos los estudiantes
  getAll: async (req, res) => {
    try {
      const [estudiantes] = await db.query(`
        SELECT * FROM estudiantes
        WHERE activo = TRUE
        ORDER BY nombres, apellidos
      `);

      // Obtener acudientes para cada estudiante
      for (let est of estudiantes) {
        const [acudientes] = await db.query(`
          SELECT a.* FROM acudientes a
          INNER JOIN estudiantes_acudientes ea ON a.id = ea.acudiente_id
          WHERE ea.estudiante_id = ?
        `, [est.id]);
        est.acudientes = acudientes;
      }

      res.json(estudiantes);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
  },

  // Obtener estudiante por ID
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT * FROM estudiantes WHERE id = ?
      `, [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Estudiante no encontrado' });
      }

      // Obtener acudientes
      const [acudientes] = await db.query(`
        SELECT a.* FROM acudientes a
        INNER JOIN estudiantes_acudientes ea ON a.id = ea.acudiente_id
        WHERE ea.estudiante_id = ?
      `, [req.params.id]);

      res.json({ ...rows[0], acudientes });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener estudiante' });
    }
  },

  // Crear estudiante
  create: async (req, res) => {
    const connection = await db.getConnection();

    try {
      // Iniciar transacción
      await connection.beginTransaction();

      const {
        codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
        fecha_nacimiento, genero, nivel, direccion, barrio, telefono_contacto,
        fecha_ingreso, fecha_matricula, eps, tipo_sangre, alergias,
        medicamentos, condiciones_medicas, observaciones_medicas, observaciones,
        acudientes
      } = req.body;

      // Validar que el código sea único
      const [existingCodigo] = await connection.query(
        'SELECT id FROM estudiantes WHERE codigo = ?',
        [codigo]
      );

      if (existingCodigo.length > 0) {
        await connection.rollback();
        connection.release();
        return res.status(400).json({ error: 'El código del estudiante ya existe' });
      }

      // Insertar estudiante
      const [result] = await connection.query(`
        INSERT INTO estudiantes (
          codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
          fecha_nacimiento, genero, nivel, direccion, barrio, telefono_contacto,
          fecha_ingreso, fecha_matricula, eps, tipo_sangre, alergias,
          medicamentos, condiciones_medicas, observaciones_medicas, observaciones,
          estado, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Activo', TRUE)
      `, [
        codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
        fecha_nacimiento, genero, nivel, direccion, barrio, telefono_contacto,
        fecha_ingreso, fecha_matricula, eps, tipo_sangre, alergias,
        medicamentos, condiciones_medicas, observaciones_medicas, observaciones
      ]);

      const estudianteId = result.insertId;

      // Insertar acudientes si existen
      if (acudientes && acudientes.length > 0) {
        for (const acu of acudientes) {
          // Insertar acudiente (sin ID manual, usar AUTO_INCREMENT)
          const [acudienteResult] = await connection.query(`
            INSERT INTO acudientes (
              tipo_identificacion, numero_identificacion, nombres, apellidos,
              parentesco, telefono, celular, email, direccion, ocupacion, lugar_trabajo
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
          `, [
            acu.tipo_identificacion, acu.numero_identificacion, acu.nombres, acu.apellidos,
            acu.parentesco, acu.telefono, acu.celular, acu.email, acu.direccion,
            acu.ocupacion, acu.lugar_trabajo
          ]);

          const acudienteId = acudienteResult.insertId;

          // Crear la relación estudiante-acudiente
          await connection.query(`
            INSERT INTO estudiantes_acudientes (estudiante_id, acudiente_id, tipo_acudiente)
            VALUES (?, ?, ?)
          `, [estudianteId, acudienteId, acu.tipo_acudiente || 'Responsable']);
        }
      }

      // Commit de la transacción
      await connection.commit();
      connection.release();

      res.status(201).json({
        message: 'Estudiante creado exitosamente',
        id: estudianteId
      });

    } catch (error) {
      // Rollback en caso de error
      await connection.rollback();
      connection.release();

      console.error('Error:', error);

      // Mensajes de error más específicos
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          error: 'Ya existe un registro con esos datos. Por favor verifica la información.'
        });
      }

      res.status(500).json({ error: 'Error al crear estudiante' });
    }
  },

  // Actualizar estudiante
  update: async (req, res) => {
    try {
      const {
        codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
        fecha_nacimiento, genero, nivel, direccion, barrio, telefono_contacto,
        fecha_ingreso, fecha_matricula, eps, tipo_sangre, alergias, medicamentos,
        condiciones_medicas, observaciones_medicas, observaciones
      } = req.body;

      await db.query(`
        UPDATE estudiantes SET
          codigo = ?, tipo_identificacion = ?, numero_identificacion = ?,
          nombres = ?, apellidos = ?, fecha_nacimiento = ?, genero = ?, nivel = ?,
          direccion = ?, barrio = ?, telefono_contacto = ?, fecha_ingreso = ?,
          fecha_matricula = ?, eps = ?, tipo_sangre = ?, alergias = ?,
          medicamentos = ?, condiciones_medicas = ?, observaciones_medicas = ?,
          observaciones = ?
        WHERE id = ?
      `, [
        codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
        fecha_nacimiento, genero, nivel, direccion, barrio, telefono_contacto,
        fecha_ingreso, fecha_matricula, eps, tipo_sangre, alergias,
        medicamentos, condiciones_medicas, observaciones_medicas, observaciones,
        req.params.id
      ]);

      res.json({ message: 'Estudiante actualizado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al actualizar estudiante' });
    }
  },

  // Eliminar estudiante (soft delete)
  delete: async (req, res) => {
    try {
      await db.query(
        'UPDATE estudiantes SET activo = FALSE, estado = ? WHERE id = ?',
        ['Retirado', req.params.id]
      );
      res.json({ message: 'Estudiante eliminado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al eliminar estudiante' });
    }
  },

  // Obtener estudiantes por nivel
  getByNivel: async (req, res) => {
    try {
      const [estudiantes] = await db.query(`
        SELECT * FROM estudiantes
        WHERE nivel = ? AND activo = TRUE
        ORDER BY nombres, apellidos
      `, [req.params.nivel]);

      // Obtener acudientes para cada estudiante
      for (let est of estudiantes) {
        const [acudientes] = await db.query(`
          SELECT a.* FROM acudientes a
          INNER JOIN estudiantes_acudientes ea ON a.id = ea.acudiente_id
          WHERE ea.estudiante_id = ?
        `, [est.id]);
        est.acudientes = acudientes;
      }

      res.json(estudiantes);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener estudiantes' });
    }
  }
};

module.exports = estudiantesController;

const db = require('../config/database');

const profesoresController = {
  // Obtener todos los profesores
  getAll: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT p.*
        FROM profesores p
        WHERE p.estado = 'Activo'
        ORDER BY p.nombres, p.apellidos
      `);
      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener profesores' });
    }
  },

  // Obtener profesor por ID
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(
        'SELECT * FROM profesores WHERE id = ?',
        [req.params.id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Profesor no encontrado' });
      }

      // Parsear niveles si es JSON string
      const profesor = rows[0];
      if (typeof profesor.niveles === 'string') {
        try {
          profesor.niveles = JSON.parse(profesor.niveles);
        } catch (e) {
          profesor.niveles = [];
        }
      }

      res.json(profesor);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener profesor' });
    }
  },

  // Crear profesor
  create: async (req, res) => {
    try {
      const {
        id, codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
        genero, fecha_nacimiento, direccion, ciudad, telefono_fijo, telefono, email, email_personal,
        nombre_contacto_emergencia, telefono_emergencia,
        nivel_educacion, titulo_profesional, institucion_educativa, especializacion_academica,
        anos_experiencia, especialidad, fecha_ingreso, tipo_contrato, salario_base,
        niveles, es_titular, estado, foto, hoja_vida, observaciones
      } = req.body;

      // Generar ID único si no se proporciona
      const profesorId = id || `prof${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Convertir niveles a JSON string si es array
      const nivelesJSON = Array.isArray(niveles) ? JSON.stringify(niveles) : niveles;

      // Validaciones básicas
      if (!nombres || !apellidos) {
        return res.status(400).json({ error: 'Nombres y apellidos son requeridos' });
      }
      if (!telefono) {
        return res.status(400).json({ error: 'El teléfono es requerido' });
      }
      if (!email) {
        return res.status(400).json({ error: 'El email es requerido' });
      }
      if (!especialidad) {
        return res.status(400).json({ error: 'La especialidad es requerida' });
      }
      if (!fecha_ingreso) {
        return res.status(400).json({ error: 'La fecha de ingreso es requerida' });
      }

      const [result] = await db.query(`
        INSERT INTO profesores (
          id, codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
          genero, fecha_nacimiento, foto, direccion, ciudad, telefono_fijo, telefono, email, email_personal,
          nombre_contacto_emergencia, telefono_emergencia,
          nivel_educacion, titulo_profesional, institucion_educativa, especializacion_academica,
          anos_experiencia, especialidad, fecha_ingreso, tipo_contrato, salario_base,
          estado, niveles, es_titular, hoja_vida, observaciones, activo
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        profesorId, codigo || null, tipo_identificacion || null, numero_identificacion || null, nombres, apellidos,
        genero || null, fecha_nacimiento || null, foto || null, direccion || null, ciudad || null, 
        telefono_fijo || null, telefono, email, email_personal || null,
        nombre_contacto_emergencia || null, telefono_emergencia || null,
        nivel_educacion || null, titulo_profesional || null, institucion_educativa || null, especializacion_academica || null,
        anos_experiencia || null, especialidad, fecha_ingreso, tipo_contrato || null, salario_base || null,
        estado || 'Activo', nivelesJSON || '[]', es_titular || false, hoja_vida || null, observaciones || null, true
      ]);

      // Obtener el profesor creado
      const [profesorCreado] = await db.query(
        'SELECT * FROM profesores WHERE id = ?',
        [profesorId]
      );

      if (!profesorCreado || profesorCreado.length === 0) {
        return res.status(500).json({ error: 'Error al recuperar el profesor creado' });
      }

      // Parsear niveles si es JSON string
      const profesor = profesorCreado[0];
      if (typeof profesor.niveles === 'string') {
        try {
          profesor.niveles = JSON.parse(profesor.niveles);
        } catch (e) {
          profesor.niveles = [];
        }
      }

      res.status(201).json(profesor);
    } catch (error) {
      console.error('Error al crear profesor:', error);
      // Devolver el mensaje de error específico de MySQL si está disponible
      const errorMessage = error.message || 'Error al crear profesor';
      res.status(500).json({ 
        error: 'Error al crear profesor',
        details: errorMessage 
      });
    }
  },

  // Actualizar profesor
  update: async (req, res) => {
    try {
      const {
        codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
        genero, fecha_nacimiento, direccion, telefono, email, email_personal,
        nivel_educacion, titulo_profesional, institucion_educativa, especializacion,
        años_experiencia, niveles
      } = req.body;

      // Convertir niveles a JSON string si es array
      const nivelesJSON = Array.isArray(niveles) ? JSON.stringify(niveles) : niveles;

      await db.query(`
        UPDATE profesores SET
          codigo = ?, tipo_identificacion = ?, numero_identificacion = ?,
          nombres = ?, apellidos = ?, genero = ?, fecha_nacimiento = ?,
          direccion = ?, telefono = ?, email = ?, email_personal = ?,
          nivel_educacion = ?, titulo_profesional = ?, institucion_educativa = ?,
          especializacion = ?, años_experiencia = ?, niveles = ?
        WHERE id = ?
      `, [
        codigo, tipo_identificacion, numero_identificacion, nombres, apellidos,
        genero, fecha_nacimiento, direccion, telefono, email, email_personal,
        nivel_educacion, titulo_profesional, institucion_educativa, especializacion,
        años_experiencia, nivelesJSON,
        req.params.id
      ]);

      res.json({ message: 'Profesor actualizado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al actualizar profesor' });
    }
  },

  // Eliminar profesor (soft delete)
  delete: async (req, res) => {
    try {
      await db.query(
        'UPDATE profesores SET estado = ? WHERE id = ?',
        ['Inactivo', req.params.id]
      );
      res.json({ message: 'Profesor eliminado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al eliminar profesor' });
    }
  },

  // Obtener horario del profesor
  getHorario: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT h.*
        FROM horarios h
        WHERE h.profesor_id = ?
        ORDER BY
          FIELD(h.dia_semana, 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes'),
          h.hora_inicio
      `, [req.params.id]);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener horario' });
    }
  }
};

module.exports = profesoresController;

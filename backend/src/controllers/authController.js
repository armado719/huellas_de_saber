const db = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const authController = {
  // Login
  login: async (req, res) => {
    try {
      const { email, password, tipo_usuario } = req.body;

      if (!email || !password || !tipo_usuario) {
        return res.status(400).json({
          error: 'Email, contraseña y tipo de usuario son requeridos'
        });
      }

      let user = null;
      let tabla = '';
      let rol = '';

      // Buscar usuario según tipo
      if (tipo_usuario === 'admin') {
        tabla = 'usuarios';
        rol = 'admin';
        const [rows] = await db.query(
          'SELECT * FROM usuarios WHERE email = ? AND rol = "admin"',
          [email]
        );
        user = rows[0];
      } else if (tipo_usuario === 'profesor') {
        tabla = 'profesores';
        rol = 'profesor';
        const [rows] = await db.query(
          'SELECT * FROM profesores WHERE email = ? AND estado = "activo"',
          [email]
        );
        user = rows[0];
      } else if (tipo_usuario === 'acudiente') {
        tabla = 'acudientes';
        rol = 'acudiente';
        const [rows] = await db.query(
          'SELECT * FROM acudientes WHERE email = ?',
          [email]
        );
        user = rows[0];
      } else {
        return res.status(400).json({ error: 'Tipo de usuario no válido' });
      }

      if (!user) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Verificar contraseña
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        return res.status(401).json({ error: 'Credenciales inválidas' });
      }

      // Generar token JWT
      const token = jwt.sign(
        {
          id: user.id,
          email: user.email,
          rol: rol,
          nombres: user.nombres,
          apellidos: user.apellidos
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      // Actualizar último acceso
      await db.query(
        `UPDATE ${tabla} SET ultimo_acceso = NOW() WHERE id = ?`,
        [user.id]
      );

      // No enviar password en la respuesta
      delete user.password;

      res.json({
        message: 'Login exitoso',
        token,
        usuario: {
          ...user,
          rol
        }
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error en el login' });
    }
  },

  // Registro de nuevo usuario (solo admin puede crear otros usuarios)
  register: async (req, res) => {
    try {
      const {
        email, password, nombres, apellidos, rol,
        identificacion, telefono
      } = req.body;

      // Validaciones
      if (!email || !password || !nombres || !apellidos || !rol) {
        return res.status(400).json({
          error: 'Todos los campos son requeridos'
        });
      }

      // Verificar si el email ya existe
      const [existingAdmin] = await db.query(
        'SELECT id FROM usuarios WHERE email = ?',
        [email]
      );
      const [existingProf] = await db.query(
        'SELECT id FROM profesores WHERE email = ?',
        [email]
      );
      const [existingAcud] = await db.query(
        'SELECT id FROM acudientes WHERE email = ?',
        [email]
      );

      if (existingAdmin.length > 0 || existingProf.length > 0 || existingAcud.length > 0) {
        return res.status(400).json({ error: 'El email ya está registrado' });
      }

      // Encriptar contraseña
      const hashedPassword = await bcrypt.hash(password, 10);

      let result;

      // Insertar según rol
      if (rol === 'admin') {
        [result] = await db.query(`
          INSERT INTO usuarios (
            email, password, nombres, apellidos, rol
          ) VALUES (?, ?, ?, ?, 'admin')
        `, [email, hashedPassword, nombres, apellidos]);
      } else if (rol === 'profesor') {
        [result] = await db.query(`
          INSERT INTO profesores (
            identificacion, nombres, apellidos, email, password,
            telefono, estado
          ) VALUES (?, ?, ?, ?, ?, ?, 'activo')
        `, [identificacion, nombres, apellidos, email, hashedPassword, telefono]);
      } else {
        return res.status(400).json({ error: 'Rol no válido' });
      }

      res.status(201).json({
        message: 'Usuario registrado exitosamente',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al registrar usuario' });
    }
  },

  // Cambiar contraseña
  cambiarPassword: async (req, res) => {
    try {
      const { password_actual, password_nueva } = req.body;
      const { id, rol } = req.user;

      if (!password_actual || !password_nueva) {
        return res.status(400).json({
          error: 'Contraseña actual y nueva son requeridas'
        });
      }

      let tabla = '';
      if (rol === 'admin') tabla = 'usuarios';
      else if (rol === 'profesor') tabla = 'profesores';
      else if (rol === 'acudiente') tabla = 'acudientes';

      // Obtener usuario actual
      const [rows] = await db.query(
        `SELECT password FROM ${tabla} WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // Verificar contraseña actual
      const isValid = await bcrypt.compare(password_actual, rows[0].password);

      if (!isValid) {
        return res.status(401).json({ error: 'Contraseña actual incorrecta' });
      }

      // Encriptar nueva contraseña
      const hashedPassword = await bcrypt.hash(password_nueva, 10);

      // Actualizar contraseña
      await db.query(
        `UPDATE ${tabla} SET password = ? WHERE id = ?`,
        [hashedPassword, id]
      );

      res.json({ message: 'Contraseña actualizada exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al cambiar contraseña' });
    }
  },

  // Recuperar contraseña (generar token de recuperación)
  recuperarPassword: async (req, res) => {
    try {
      const { email, tipo_usuario } = req.body;

      if (!email || !tipo_usuario) {
        return res.status(400).json({
          error: 'Email y tipo de usuario son requeridos'
        });
      }

      let user = null;
      let tabla = '';

      if (tipo_usuario === 'admin') {
        tabla = 'usuarios';
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        user = rows[0];
      } else if (tipo_usuario === 'profesor') {
        tabla = 'profesores';
        const [rows] = await db.query('SELECT * FROM profesores WHERE email = ?', [email]);
        user = rows[0];
      } else if (tipo_usuario === 'acudiente') {
        tabla = 'acudientes';
        const [rows] = await db.query('SELECT * FROM acudientes WHERE email = ?', [email]);
        user = rows[0];
      }

      if (!user) {
        // Por seguridad, siempre devolver éxito aunque el usuario no exista
        return res.json({
          message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña'
        });
      }

      // Generar token de recuperación
      const resetToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      // Guardar token en base de datos
      await db.query(
        `UPDATE ${tabla} SET reset_token = ?, reset_token_expiry = DATE_ADD(NOW(), INTERVAL 1 HOUR) WHERE id = ?`,
        [resetToken, user.id]
      );

      // TODO: Aquí se debería enviar email con el token
      // Por ahora solo devolvemos el token (en producción, enviarlo por email)

      res.json({
        message: 'Si el email existe, recibirás instrucciones para recuperar tu contraseña',
        // En desarrollo, devolver el token. En producción, eliminarlo
        token: resetToken
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al procesar solicitud' });
    }
  },

  // Verificar token
  verificarToken: async (req, res) => {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({ error: 'Token requerido' });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      res.json({
        message: 'Token válido',
        usuario: decoded
      });
    } catch (error) {
      return res.status(401).json({ error: 'Token inválido o expirado' });
    }
  },

  // Obtener perfil del usuario autenticado
  getPerfil: async (req, res) => {
    try {
      const { id, rol } = req.user;

      let tabla = '';
      if (rol === 'admin') tabla = 'usuarios';
      else if (rol === 'profesor') tabla = 'profesores';
      else if (rol === 'acudiente') tabla = 'acudientes';

      const [rows] = await db.query(
        `SELECT * FROM ${tabla} WHERE id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      // No enviar password
      delete rows[0].password;
      delete rows[0].reset_token;
      delete rows[0].reset_token_expiry;

      res.json(rows[0]);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener perfil' });
    }
  }
};

module.exports = authController;

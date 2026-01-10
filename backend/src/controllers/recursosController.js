const db = require('../config/database');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Configuración de Multer para subida de archivos
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/recursos';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx|xls|xlsx|ppt|pptx|jpg|jpeg|png|gif|mp4|zip/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname && mimetype) {
      return cb(null, true);
    }
    cb(new Error('Tipo de archivo no permitido'));
  }
});

const recursosController = {
  upload, // Exportar configuración de multer

  // Obtener todos los recursos
  getAll: async (req, res) => {
    try {
      const { tipo, nivel, categoria } = req.query;

      let query = `
        SELECT r.*, p.nombres as autor_nombres, p.apellidos as autor_apellidos
        FROM recursos r
        LEFT JOIN profesores p ON r.autor_id = p.id
        WHERE 1=1
      `;
      const params = [];

      if (tipo) {
        query += ' AND r.tipo = ?';
        params.push(tipo);
      }

      if (nivel) {
        query += ' AND r.nivel = ?';
        params.push(nivel);
      }

      if (categoria) {
        query += ' AND r.categoria = ?';
        params.push(categoria);
      }

      query += ' ORDER BY r.fecha_subida DESC';

      const [rows] = await db.query(query, params);
      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener recursos' });
    }
  },

  // Obtener recurso por ID
  getById: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT r.*, p.nombres as autor_nombres, p.apellidos as autor_apellidos
        FROM recursos r
        LEFT JOIN profesores p ON r.autor_id = p.id
        WHERE r.id = ?
      `, [req.params.id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Recurso no encontrado' });
      }

      // Incrementar contador de descargas
      await db.query(
        'UPDATE recursos SET descargas = descargas + 1 WHERE id = ?',
        [req.params.id]
      );

      res.json(rows[0]);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener recurso' });
    }
  },

  // Crear recurso (con archivo)
  create: async (req, res) => {
    try {
      const {
        titulo, descripcion, tipo, categoria, nivel,
        autor_id, url_externa, materia
      } = req.body;

      let url_archivo = null;
      let tamaño = null;

      if (req.file) {
        url_archivo = '/uploads/recursos/' + req.file.filename;
        tamaño = req.file.size;
      } else if (url_externa) {
        url_archivo = url_externa;
      }

      const [result] = await db.query(`
        INSERT INTO recursos (
          titulo, descripcion, tipo, categoria, nivel,
          url_archivo, tamaño, autor_id, materia, descargas, destacado
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, false)
      `, [
        titulo, descripcion, tipo, categoria, nivel,
        url_archivo, tamaño, autor_id, materia
      ]);

      res.status(201).json({
        message: 'Recurso creado exitosamente',
        id: result.insertId
      });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al crear recurso' });
    }
  },

  // Actualizar recurso
  update: async (req, res) => {
    try {
      const {
        titulo, descripcion, tipo, categoria, nivel,
        url_externa, materia, destacado
      } = req.body;

      let updateFields = `
        titulo = ?, descripcion = ?, tipo = ?, categoria = ?,
        nivel = ?, materia = ?, destacado = ?
      `;
      let params = [titulo, descripcion, tipo, categoria, nivel, materia, destacado];

      // Si hay nuevo archivo, actualizar url y tamaño
      if (req.file) {
        updateFields += ', url_archivo = ?, tamaño = ?';
        params.push('/uploads/recursos/' + req.file.filename, req.file.size);

        // Eliminar archivo anterior si existe
        const [oldFile] = await db.query('SELECT url_archivo FROM recursos WHERE id = ?', [req.params.id]);
        if (oldFile.length > 0 && oldFile[0].url_archivo && !oldFile[0].url_archivo.startsWith('http')) {
          const oldPath = path.join(__dirname, '../../', oldFile[0].url_archivo);
          if (fs.existsSync(oldPath)) {
            fs.unlinkSync(oldPath);
          }
        }
      } else if (url_externa) {
        updateFields += ', url_archivo = ?';
        params.push(url_externa);
      }

      params.push(req.params.id);

      await db.query(
        `UPDATE recursos SET ${updateFields} WHERE id = ?`,
        params
      );

      res.json({ message: 'Recurso actualizado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al actualizar recurso' });
    }
  },

  // Eliminar recurso
  delete: async (req, res) => {
    try {
      // Obtener archivo para eliminarlo
      const [rows] = await db.query('SELECT url_archivo FROM recursos WHERE id = ?', [req.params.id]);

      if (rows.length > 0 && rows[0].url_archivo && !rows[0].url_archivo.startsWith('http')) {
        const filePath = path.join(__dirname, '../../', rows[0].url_archivo);
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      await db.query('DELETE FROM recursos WHERE id = ?', [req.params.id]);
      res.json({ message: 'Recurso eliminado exitosamente' });
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al eliminar recurso' });
    }
  },

  // Marcar/desmarcar como favorito
  toggleFavorito: async (req, res) => {
    try {
      const { usuario_id } = req.body;

      // Verificar si ya existe
      const [existing] = await db.query(
        'SELECT id FROM favoritos WHERE recurso_id = ? AND usuario_id = ?',
        [req.params.id, usuario_id]
      );

      if (existing.length > 0) {
        // Eliminar de favoritos
        await db.query('DELETE FROM favoritos WHERE id = ?', [existing[0].id]);
        res.json({ message: 'Eliminado de favoritos', favorito: false });
      } else {
        // Agregar a favoritos
        await db.query(
          'INSERT INTO favoritos (recurso_id, usuario_id) VALUES (?, ?)',
          [req.params.id, usuario_id]
        );
        res.json({ message: 'Agregado a favoritos', favorito: true });
      }
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al gestionar favorito' });
    }
  },

  // Obtener recursos más descargados
  getMasDescargados: async (req, res) => {
    try {
      const limit = req.query.limit || 5;

      const [rows] = await db.query(`
        SELECT r.*, p.nombres as autor_nombres, p.apellidos as autor_apellidos
        FROM recursos r
        LEFT JOIN profesores p ON r.autor_id = p.id
        ORDER BY r.descargas DESC
        LIMIT ?
      `, [parseInt(limit)]);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener recursos más descargados' });
    }
  },

  // Obtener recursos destacados
  getDestacados: async (req, res) => {
    try {
      const [rows] = await db.query(`
        SELECT r.*, p.nombres as autor_nombres, p.apellidos as autor_apellidos
        FROM recursos r
        LEFT JOIN profesores p ON r.autor_id = p.id
        WHERE r.destacado = true
        ORDER BY r.fecha_subida DESC
      `);

      res.json(rows);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener recursos destacados' });
    }
  },

  // Estadísticas de recursos
  getEstadisticas: async (req, res) => {
    try {
      const [stats] = await db.query(`
        SELECT
          COUNT(*) as total_recursos,
          SUM(CASE WHEN tipo = 'PDF' THEN 1 ELSE 0 END) as total_pdf,
          SUM(CASE WHEN tipo = 'Video' THEN 1 ELSE 0 END) as total_videos,
          SUM(CASE WHEN tipo = 'Presentación' THEN 1 ELSE 0 END) as total_presentaciones,
          SUM(CASE WHEN tipo = 'Imagen' THEN 1 ELSE 0 END) as total_imagenes,
          SUM(CASE WHEN tipo = 'Link' THEN 1 ELSE 0 END) as total_links,
          SUM(descargas) as total_descargas,
          COALESCE(SUM(tamaño), 0) as espacio_total
        FROM recursos
      `);

      res.json(stats[0]);
    } catch (error) {
      console.error('Error:', error);
      res.status(500).json({ error: 'Error al obtener estadísticas' });
    }
  }
};

module.exports = recursosController;

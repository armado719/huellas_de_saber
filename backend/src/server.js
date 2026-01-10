const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middleware CORS - CORREGIDO para permitir ambos puertos
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174'],
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
const estudiantesRoutes = require('./routes/estudiantes');
const profesoresRoutes = require('./routes/profesores');
const asistenciaRoutes = require('./routes/asistencia');
const calificacionesRoutes = require('./routes/calificaciones');
const pagosRoutes = require('./routes/pagos');
const horariosRoutes = require('./routes/horarios');
const mensajesRoutes = require('./routes/mensajes');
const recursosRoutes = require('./routes/recursos');
const authRoutes = require('./routes/auth');

// Rutas SIN autenticación (temporalmente para pruebas)
app.use('/api/estudiantes', estudiantesRoutes);
app.use('/api/profesores', profesoresRoutes);
app.use('/api/asistencia', asistenciaRoutes);
app.use('/api/calificaciones', calificacionesRoutes);
app.use('/api/pagos', pagosRoutes);
app.use('/api/horarios', horariosRoutes);
app.use('/api/mensajes', mensajesRoutes);
app.use('/api/recursos', recursosRoutes);
app.use('/api/auth', authRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    message: 'API Huellas del Saber funcionando',
    version: '1.0.0',
    endpoints: {
      estudiantes: '/api/estudiantes',
      profesores: '/api/profesores',
      asistencia: '/api/asistencia',
      calificaciones: '/api/calificaciones',
      pagos: '/api/pagos',
      horarios: '/api/horarios',
      mensajes: '/api/mensajes',
      recursos: '/api/recursos',
      auth: '/api/auth'
    }
  });
});

// Iniciar servidor
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`🚀 Servidor backend en http://localhost:${PORT}`);
});

module.exports = app;
const express = require('express');
const router = express.Router();
const controller = require('../controllers/asistenciaController');
// const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
// router.use(authMiddleware);

router.get('/grupo', controller.getByGrupoFecha);
router.get('/estudiante', controller.getByEstudiante);
router.get('/estadisticas', controller.getEstadisticas);
router.get('/reporte-grupo', controller.getReporteGrupo);
router.post('/', controller.create);
router.post('/masiva', controller.createMasiva);
router.put('/:id', controller.update);

module.exports = router;

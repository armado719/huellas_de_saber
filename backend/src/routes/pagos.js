const express = require('express');
const router = express.Router();
const controller = require('../controllers/pagosController');
// const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
// router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/estadisticas', controller.getEstadisticas);
router.get('/morosidad', controller.getReporteMorosidad);
router.get('/:id', controller.getById);
router.get('/estudiante/:estudiante_id', controller.getByEstudiante);
router.post('/', controller.create);
router.post('/abono', controller.registrarAbono);
router.put('/:id', controller.update);
router.put('/:id/registrar', controller.registrarPago);
router.delete('/:id', controller.delete);

module.exports = router;

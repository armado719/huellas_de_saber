const express = require('express');
const router = express.Router();
const controller = require('../controllers/calificacionesController');
// const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
// router.use(authMiddleware);

router.get('/estudiante', controller.getByEstudiante);
router.get('/grupo-materia', controller.getByGrupoMateria);
router.get('/boletin', controller.getBoletin);
router.post('/', controller.create);
router.post('/masivas', controller.createMasivas);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;

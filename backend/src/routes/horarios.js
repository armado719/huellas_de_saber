const express = require('express');
const router = express.Router();
const controller = require('../controllers/horariosController');
// const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
// router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/maestro', controller.getHorarioMaestro);
router.get('/grupo/:grupo_id', controller.getByGrupo);
router.get('/profesor/:profesor_id', controller.getByProfesor);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);

module.exports = router;

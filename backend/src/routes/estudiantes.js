const express = require('express');
const router = express.Router();
const controller = require('../controllers/estudiantesController');
// const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
// router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.delete);
router.get('/nivel/:nivel', controller.getByNivel);

module.exports = router;

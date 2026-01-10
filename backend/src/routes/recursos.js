const express = require('express');
const router = express.Router();
const controller = require('../controllers/recursosController');
// const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
// router.use(authMiddleware);

router.get('/', controller.getAll);
router.get('/mas-descargados', controller.getMasDescargados);
router.get('/destacados', controller.getDestacados);
router.get('/estadisticas', controller.getEstadisticas);
router.get('/:id', controller.getById);
router.post('/', controller.upload.single('archivo'), controller.create);
router.put('/:id', controller.upload.single('archivo'), controller.update);
router.post('/:id/favorito', controller.toggleFavorito);
router.delete('/:id', controller.delete);

module.exports = router;

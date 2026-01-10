const express = require('express');
const router = express.Router();
const controller = require('../controllers/mensajesController');
// const { authMiddleware } = require('../middleware/auth');

// Todas las rutas requieren autenticación
// router.use(authMiddleware);

router.get('/', controller.getByUsuario);
router.get('/no-leidos', controller.contarNoLeidos);
router.get('/:id', controller.getById);
router.post('/', controller.create);
router.post('/masivo', controller.enviarMasivo);
router.post('/responder', controller.responder);
router.put('/:id/leer', controller.marcarLeido);
router.delete('/:id', controller.delete);

module.exports = router;

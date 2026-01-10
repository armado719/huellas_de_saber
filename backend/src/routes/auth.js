const express = require('express');
const router = express.Router();
const controller = require('../controllers/authController');
const { authMiddleware } = require('../middleware/auth');

// Rutas públicas (sin autenticación)
router.post('/login', controller.login);
router.post('/register', controller.register);
router.post('/recuperar-password', controller.recuperarPassword);
router.post('/verificar-token', controller.verificarToken);

// Rutas protegidas (requieren autenticación)
router.get('/perfil', authMiddleware, controller.getPerfil);
router.put('/cambiar-password', authMiddleware, controller.cambiarPassword);

module.exports = router;

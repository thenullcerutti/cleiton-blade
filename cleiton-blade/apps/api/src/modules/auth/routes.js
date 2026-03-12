const express = require('express');
const AuthController = require('./AuthController');
const { authMiddleware, validateBody } = require('../../shared/middlewares/auth');
const { isValidEmail } = require('../../shared/utils/helpers');
const rateLimiter = require('../../shared/middlewares/rateLimiter');
const captchaValidator = require('../../shared/middlewares/captchaValidator');

const router = express.Router();

/**
 * POST /auth/register
 * Registra novo usuário com email verification
 * Rate limited: 5 registros por IP por hora
 */
router.post(
  '/register',
  rateLimiter.middleware('/auth/register'),
  captchaValidator.middleware(),
  validateBody({
    name: { required: true, type: 'string', minLength: 3, maxLength: 100 },
    email: { required: true, type: 'string', custom: isValidEmail, customError: 'Email inválido' },
    password: { required: true, type: 'string', minLength: 6, maxLength: 255 },
    role: { required: false, type: 'string' },
    adminKey: { required: false, type: 'string' },
  }),
  AuthController.register
);

/**
 * POST /auth/login
 * Faz login do usuário
 * Rate limited: 10 tentativas por email por 15 minutos
 */
router.post(
  '/login',
  rateLimiter.middleware('/auth/login'),
  validateBody({
    email: { required: true, type: 'string' },
    password: { required: true, type: 'string' },
  }),
  AuthController.login
);

/**
 * POST /auth/refresh
 * Renova o access token
 */
router.post(
  '/refresh',
  validateBody({
    refreshToken: { required: true, type: 'string' },
  }),
  AuthController.refresh
);

/**
 * GET /auth/me
 * Retorna dados do usuário autenticado
 */
router.get('/me', authMiddleware, AuthController.me);

/**
 * POST /auth/verify-email
 * Valida token de verificação de email
 */
router.post(
  '/verify-email',
  validateBody({
    token: { required: true, type: 'string' },
  }),
  AuthController.verifyEmail
);

/**
 * POST /auth/resend-verification
 * Reenvia email de verificação
 * Rate limited: previne abuso
 */
router.post(
  '/resend-verification',
  rateLimiter.middleware('/auth/resend-verification'),
  validateBody({
    email: { required: true, type: 'string' },
  }),
  AuthController.resendVerificationEmail
);

/**
 * PUT /auth/change-password
 * Muda a senha do usuário autenticado
 */
router.put(
  '/change-password',
  authMiddleware,
  validateBody({
    currentPassword: { required: true, type: 'string' },
    newPassword: { required: true, type: 'string', minLength: 6 },
  }),
  AuthController.changePassword
);

module.exports = router;

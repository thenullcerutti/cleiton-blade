const express = require('express');
const ClientController = require('./ClientController');
const { authMiddleware, validateBody } = require('../../shared/middlewares/auth');
const { isValidEmail, isValidPhone } = require('../../shared/utils/helpers');

const router = express.Router();

/**
 * GET /clients
 * Lista todos os clientes (público)
 */
router.get('/', ClientController.list);

/**
 * GET /clients/phone/:phone
 * Busca cliente por telefone (público)
 */
router.get('/phone/:phone', ClientController.getByPhone);

/**
 * Rotas protegidas abaixo (requerem autenticação)
 */
router.use(authMiddleware);

/**
 * POST /clients
 * Cria novo cliente (requer auth)
 */
router.post(
  '/',
  validateBody({
    name: { required: true, type: 'string', minLength: 3, maxLength: 150 },
    phone: { required: true, type: 'string', custom: isValidPhone, customError: 'Telefone inválido' },
    email: { type: 'string', custom: isValidEmail, customError: 'Email inválido' },
    birthDate: { type: 'string', regex: /^\d{4}-\d{2}-\d{2}$/, regexError: 'Data de nascimento deve estar no formato YYYY-MM-DD' },
  }),
  ClientController.create
);

/**
 * PUT /clients/:id/block
 * Bloqueia cliente (requer auth)
 */
router.put('/:id/block', ClientController.block);

/**
 * PUT /clients/:id/unblock
 * Desbloqueia cliente (requer auth)
 */
router.put('/:id/unblock', ClientController.unblock);

/**
 * POST /clients/:id/loyalty-points
 * Adiciona pontos de lealdade
 */
router.post(
  '/:id/loyalty-points',
  validateBody({
    points: { required: true, type: 'number', custom: (p) => p > 0, customError: 'Pontos deve ser maior que 0' },
  }),
  ClientController.addLoyaltyPoints
);

/**
 * POST /clients/:id/loyalty-points/remove
 * Remove pontos de lealdade
 */
router.post(
  '/:id/loyalty-points/remove',
  validateBody({
    points: { required: true, type: 'number', custom: (p) => p > 0, customError: 'Pontos deve ser maior que 0' },
  }),
  ClientController.removeLoyaltyPoints
);

/**
 * DELETE /clients/:id
 * Deleta cliente
 */
router.delete('/:id', ClientController.delete);

/**
 * PUT /clients/:id
 * Atualiza cliente
 */
router.put(
  '/:id',
  validateBody({
    name: { type: 'string', minLength: 3, maxLength: 150 },
    email: { type: 'string', custom: isValidEmail, customError: 'Email inválido' },
  }),
  ClientController.update
);

/**
 * GET /clients/:id
 * Obtém um cliente específico
 */
router.get('/:id', ClientController.getById);

module.exports = router;

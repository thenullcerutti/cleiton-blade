
const express = require('express');
const ServiceController = require('./ServiceController');
const { authMiddleware, roleMiddleware, validateBody } = require('../../shared/middlewares/auth');

const router = express.Router();

/**
 * DELETE /services/:id
 * Remove um serviço
 */
router.delete('/:id', ServiceController.delete);

/**
 * GET /services
 * Lista todos os serviços (público)
 */
router.get('/', ServiceController.list);

/**
 * GET /services/:id
 * Obtém um serviço (público)
 */
router.get('/:id', ServiceController.getById);

// Endpoints de escrita requerem autenticação e role de admin
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

/**
 * POST /services
 * Cria novo serviço
 */
router.post(
  '/',
  validateBody({
    name: { required: true, type: 'string', minLength: 3, maxLength: 100 },
    durationMinutes: { required: true, type: 'number', custom: (d) => d > 0, customError: 'Duração deve ser maior que 0' },
    price: { required: true, type: 'number', custom: (p) => p > 0, customError: 'Preço deve ser maior que 0' },
    description: { type: 'string', maxLength: 500 },
  }),
  ServiceController.create
);

/**
 * PUT /services/:id
 * Atualiza serviço
 */
router.put(
  '/:id',
  validateBody({
    name: { type: 'string', minLength: 3, maxLength: 100 },
    durationMinutes: { type: 'number', custom: (d) => d > 0, customError: 'Duração deve ser maior que 0' },
    price: { type: 'number', custom: (p) => p > 0, customError: 'Preço deve ser maior que 0' },
    description: { type: 'string', maxLength: 500 },
  }),
  ServiceController.update
);

/**
 * PUT /services/:id/toggle
 * Ativa ou desativa serviço
 */
router.put(
  '/:id/toggle',
  validateBody({
    active: { required: true, type: 'boolean' },
  }),
  ServiceController.toggleActive
);

module.exports = router;

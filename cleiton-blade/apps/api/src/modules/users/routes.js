const express = require('express');
const UserController = require('./UserController');
const { authMiddleware, roleMiddleware, validateBody } = require('../../shared/middlewares/auth');
const { isValidEmail } = require('../../shared/utils/helpers');

const router = express.Router();

// Todos os endpoints de usuários requerem autenticação e role de admin
router.use(authMiddleware);
router.use(roleMiddleware('admin'));

/**
 * GET /users
 * Lista todos os usuários
 */
router.get('/', UserController.list);

/**
 * GET /users/:id
 * Obtém um usuário específico
 */
router.get('/:id', UserController.getById);

/**
 * GET /users/role/:role
 * Lista usuários por role
 */
router.get('/role/:role', UserController.listByRole);

/**
 * PUT /users/:id
 * Atualiza dados do usuário
 */
router.put(
  '/:id',
  validateBody({
    name: { type: 'string', minLength: 3, maxLength: 100 },
    email: { type: 'string', custom: isValidEmail, customError: 'Email inválido' },
  }),
  UserController.update
);

/**
 * PUT /users/:id/toggle
 * Ativa ou desativa um usuário
 */
router.put(
  '/:id/toggle',
  validateBody({
    active: { required: true, type: 'boolean' },
  }),
  UserController.toggleActive
);

/**
 * DELETE /users/:id
 * Deleta um usuário
 */
router.delete('/:id', UserController.delete);

module.exports = router;

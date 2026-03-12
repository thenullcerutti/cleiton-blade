const express = require('express');
const ProfessionalController = require('./ProfessionalController');
const { authMiddleware, roleMiddleware, validateBody } = require('../../shared/middlewares/auth');

const router = express.Router();

// Requer autenticação para todos os endpoints
router.use(authMiddleware);

/**
 * GET /professionals
 * Lista todos os profissionais
 */
router.get('/', ProfessionalController.list);

/**
 * GET /professionals/:id
 * Obtém um profissional específico
 */
router.get('/:id', ProfessionalController.getById);

/**
 * GET /professionals/:id/schedules
 * Obtém horários de trabalho do profissional
 */
router.get('/:id/schedules', ProfessionalController.getSchedules);

/**
 * GET /professionals/:id/appointments
 * Obtém agendamentos do profissional
 */
router.get('/:id/appointments', ProfessionalController.getAppointments);

// Endpoints de escrita requerem role de admin
/**
 * POST /professionals
 * Cria novo profissional (admin only)
 */
router.post(
  '/',
  roleMiddleware('admin'),
  validateBody({
    userId: { required: true, type: 'string' },
    name: { required: true, type: 'string', minLength: 3, maxLength: 150 },
    commissionPercentage: { type: 'number' },
  }),
  ProfessionalController.create
);

/**
 * PUT /professionals/:id
 * Atualiza profissional (admin only)
 */
router.put(
  '/:id',
  roleMiddleware('admin'),
  validateBody({
    name: { type: 'string', minLength: 3, maxLength: 150 },
    commissionPercentage: { type: 'number' },
  }),
  ProfessionalController.update
);

/**
 * PUT /professionals/:id/toggle
 * Ativa ou desativa profissional (admin only)
 */
router.put(
  '/:id/toggle',
  roleMiddleware('admin'),
  validateBody({
    active: { required: true, type: 'boolean' },
  }),
  ProfessionalController.toggleActive
);

module.exports = router;

const express = require('express');
const ScheduleController = require('./ScheduleController');
const { authMiddleware, roleMiddleware, validateBody } = require('../../shared/middlewares/auth');

const router = express.Router();

// Requer autenticação para todos os endpoints
router.use(authMiddleware);

/**
 * GET /schedules/professional/:professionalId
 * Lista agendas de um profissional
 */
router.get('/professional/:professionalId', ScheduleController.getByProfessionalId);

// Endpoints de escrita requerem role de admin ou profissional
/**
 * POST /schedules
 * Cria nova agenda
 */
router.post(
  '/',
  validateBody({
    professionalId: { required: true, type: 'string' },
    weekday: { required: true, type: 'number', custom: (w) => w >= 0 && w <= 6, customError: 'Dia da semana inválido (0-6)' },
    startTime: { required: true, type: 'string' },
    endTime: { required: true, type: 'string' },
    breakStart: { type: 'string' },
    breakEnd: { type: 'string' },
  }),
  ScheduleController.create
);

/**
 * PUT /schedules/:id
 * Atualiza agenda
 */
router.put(
  '/:id',
  validateBody({
    startTime: { type: 'string' },
    endTime: { type: 'string' },
    breakStart: { type: 'string' },
    breakEnd: { type: 'string' },
  }),
  ScheduleController.update
);

/**
 * DELETE /schedules/:id
 * Deleta agenda
 */
router.delete('/:id', ScheduleController.delete);

module.exports = router;

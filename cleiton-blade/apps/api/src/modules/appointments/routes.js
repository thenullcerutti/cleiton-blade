const express = require('express');
const AppointmentController = require('./AppointmentController');
const { authMiddleware, validateBody } = require('../../shared/middlewares/auth');

const router = express.Router();

// Requer autenticação para todos os endpoints
router.use(authMiddleware);

/**
 * GET /appointments
 * Lista todos os agendamentos
 */
router.get('/', AppointmentController.list);

/**
 * GET /appointments/available
 * Retorna horários disponíveis
 */
router.get('/available', AppointmentController.getAvailableSlots);

/**
 * GET /appointments/:id
 * Obtém um agendamento específico
 */
router.get('/:id', AppointmentController.getById);

/**
 * GET /appointments/client/:clientId
 * Obtém agendamentos de um cliente
 */
router.get('/client/:clientId', AppointmentController.getByClientId);

/**
 * GET /appointments/professional/:professionalId
 * Obtém agendamentos de um profissional
 */
router.get('/professional/:professionalId', AppointmentController.getByProfessionalId);

/**
 * POST /appointments
 * Cria novo agendamento
 */
router.post(
  '/',
  validateBody({
    clientId: { required: true, type: 'string' },
    professionalId: { required: true, type: 'string' },
    serviceId: { required: true, type: 'string' },
    appointmentDatetime: { required: true, type: 'string' },
    origin: { type: 'string' },
    notes: { type: 'string' },
  }),
  AppointmentController.create
);

/**
 * PUT /appointments/:id/confirm
 * Confirma agendamento
 */
router.put('/:id/confirm', AppointmentController.confirm);

/**
 * PUT /appointments/:id/complete
 * Marca como concluído
 */
router.put('/:id/complete', AppointmentController.complete);

/**
 * PUT /appointments/:id/cancel
 * Cancela agendamento
 */
router.put(
  '/:id/cancel',
  validateBody({
    reason: { type: 'string' },
  }),
  AppointmentController.cancel
);

/**
 * PUT /appointments/:id/no-show
 * Marca como não compareceu
 */
router.put('/:id/no-show', AppointmentController.markNoShow);

module.exports = router;

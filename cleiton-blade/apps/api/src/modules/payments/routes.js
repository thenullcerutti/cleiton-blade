const express = require('express');
const PaymentController = require('./PaymentController');
const { authMiddleware, roleMiddleware, validateBody } = require('../../shared/middlewares/auth');

const router = express.Router();

// Requer autenticação para todos os endpoints
router.use(authMiddleware);

/**
 * GET /payments
 * Lista pagamentos (admin only)
 */
router.get('/', roleMiddleware('admin'), PaymentController.list);

/**
 * GET /payments/stats
 * Obtém estatísticas
 */
router.get('/stats', roleMiddleware('admin'), PaymentController.getStats);

/**
 * GET /payments/:id
 * Obtém um pagamento
 */
router.get('/:id', PaymentController.getById);

/**
 * GET /payments/appointment/:appointmentId
 * Obtém pagamento de um agendamento
 */
router.get('/appointment/:appointmentId', PaymentController.getByAppointmentId);

/**
 * POST /payments
 * Cria novo pagamento
 */
router.post(
  '/',
  validateBody({
    appointmentId: { required: true, type: 'string' },
    method: { required: true, type: 'string', custom: (m) => ['pix', 'card', 'cash', 'pending'].includes(m), customError: 'Método de pagamento inválido' },
    amount: { type: 'number' },
    transactionId: { type: 'string' },
    notes: { type: 'string' },
  }),
  PaymentController.create
);

/**
 * PUT /payments/:id/confirm
 * Confirma pagamento
 */
router.put(
  '/:id/confirm',
  roleMiddleware('admin'),
  validateBody({
    transactionId: { type: 'string' },
  }),
  PaymentController.markAsPaid
);

/**
 * PUT /payments/:id/fail
 * Marca como falho
 */
router.put(
  '/:id/fail',
  roleMiddleware('admin'),
  validateBody({
    reason: { type: 'string' },
  }),
  PaymentController.markAsFailed
);

/**
 * PUT /payments/:id/refund
 * Reembolsa pagamento
 */
router.put(
  '/:id/refund',
  roleMiddleware('admin'),
  validateBody({
    reason: { type: 'string' },
  }),
  PaymentController.refund
);

module.exports = router;

/**
 * Rotas de gerenciamento de disponibilidade de agendamentos
 * 
 * Endpoints:
 * GET  /api/availability/slots - Listar slots disponíveis
 * POST /api/availability/slots/:slotId/block - Bloquear um slot
 * POST /api/availability/slots/:slotId/unblock - Desbloquear um slot
 * GET  /api/availability/stats - Estatísticas de disponibilidade
 * POST /api/availability/slots/block-multiple - Bloquear múltiplos slots
 */

const express = require('express');
const router = express.Router();
const AvailabilityService = require('../modules/availability/AvailabilityService');
const { authenticate, authorize } = require('../shared/middlewares/authMiddleware');
const { errorHandler } = require('../shared/middlewares/errorHandler');

/**
 * Obter slots disponíveis para um profissional em um período
 * Query: professionalId, startDate (ISO), endDate (ISO), serviceId (opcional)
 * 
 * Uso:
 * GET /api/availability/slots?professionalId=xxx&startDate=2026-03-01&endDate=2026-03-31&serviceId=yyy
 */
router.get('/slots', async (req, res, next) => {
  try {
    const { professionalId, startDate, endDate, serviceId } = req.query;

    // Validações
    if (!professionalId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: professionalId, startDate, endDate (formato ISO)'
      });
    }

    const result = await AvailabilityService.getAvailableSlots(
      professionalId,
      new Date(startDate),
      new Date(endDate),
      serviceId || null
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Obter próximo horário disponível
 * Query: professionalId, afterDate (opcional, ISO)
 */
router.get('/slots/next', async (req, res, next) => {
  try {
    const { professionalId, afterDate } = req.query;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro obrigatório: professionalId'
      });
    }

    const result = await AvailabilityService.getNextAvailableSlot(
      professionalId,
      afterDate || null
    );

    if (!result) {
      return res.status(404).json({
        success: false,
        message: 'Nenhum horário disponível nos próximos 30 dias'
      });
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Bloquear um slot individual
 * Body: { reason (opcional) }
 */
router.post('/slots/:slotId/block', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { slotId } = req.params;
    const { reason } = req.body;

    const result = await AvailabilityService.blockSlot(slotId, reason);

    res.json({
      success: true,
      data: result,
      message: 'Slot bloqueado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Desbloquear um slot
 */
router.post('/slots/:slotId/unblock', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { slotId } = req.params;

    const result = await AvailabilityService.unblockSlot(slotId);

    res.json({
      success: true,
      data: result,
      message: 'Slot desbloqueado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Bloquear múltiplos slots de uma vez
 * Body: { slotIds: [], reason (opcional) }
 */
router.post('/slots/block-multiple', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { slotIds, reason } = req.body;

    if (!Array.isArray(slotIds) || slotIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro obrigatório: slotIds (array não vazio)'
      });
    }

    const result = await AvailabilityService.blockMultipleSlots(slotIds, reason);

    res.json({
      success: true,
      data: result,
      message: `${result.blocked} slots bloqueados com sucesso`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Obter slots bloqueados
 * Query: professionalId, startDate, endDate
 */
router.get('/blocked-slots', async (req, res, next) => {
  try {
    const { professionalId, startDate, endDate } = req.query;

    if (!professionalId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: professionalId, startDate, endDate'
      });
    }

    const result = await AvailabilityService.getBlockedSlots(
      professionalId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Obter estatísticas de disponibilidade
 * Query: professionalId, startDate, endDate
 */
router.get('/stats', async (req, res, next) => {
  try {
    const { professionalId, startDate, endDate } = req.query;

    if (!professionalId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: professionalId, startDate, endDate'
      });
    }

    const result = await AvailabilityService.getAvailabilityStats(
      professionalId,
      new Date(startDate),
      new Date(endDate)
    );

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

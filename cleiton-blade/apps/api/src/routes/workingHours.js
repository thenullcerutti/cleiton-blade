/**
 * Rotas de gerenciamento de horários de trabalho
 * 
 * Endpoints:
 * GET  /api/working-hours/:professionalId - Listar horários
 * POST /api/working-hours - Criar/atualizar horário
 * PATCH /api/working-hours/:id/toggle - Habilitar/desabilitar dia
 * DELETE /api/working-hours/:dayOfWeek - Deletar horário de um dia
 */

const express = require('express');
const router = express.Router();
const WorkingHoursService = require('../modules/availability/WorkingHoursService');
const { authenticate, authorize } = require('../shared/middlewares/authMiddleware');
const { errorHandler } = require('../shared/middlewares/errorHandler');

/**
 * Obter horários de trabalho de um profissional
 */
router.get('/:professionalId', async (req, res, next) => {
  try {
    const { professionalId } = req.params;
    const hours = await WorkingHoursService.getWorkingHours(professionalId);
    
    res.json({
      success: true,
      data: hours,
      message: 'Horários recuperados com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Criar ou atualizar horário de trabalho
 * Body: { professionalId, dayOfWeek, startTime, endTime }
 */
router.post('/', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { professionalId, dayOfWeek, startTime, endTime } = req.body;

    // Validar dados
    if (!professionalId || dayOfWeek === undefined || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Dados incompletos: professionalId, dayOfWeek, startTime, endTime são obrigatórios'
      });
    }

    // Verificar autorização (admin ou próprio profissional)
    if (req.user.role === 'professional' && req.user.id !== professionalId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para modificar horários de outro profissional'
      });
    }

    const result = await WorkingHoursService.setWorkingHours(
      professionalId,
      dayOfWeek,
      startTime,
      endTime
    );

    res.status(201).json({
      success: true,
      data: result,
      message: 'Horário definido com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Habilitar/desabilitar um dia de trabalho
 * PATCH /api/working-hours/:id/toggle?enabled=true
 */
router.patch('/:id/toggle', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { enabled } = req.query;

    if (enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "enabled" (true/false) é obrigatório'
      });
    }

    const isActive = enabled === 'true';
    const result = await WorkingHoursService.toggleWorkingDay(id, dayOfWeek, isActive);

    res.json({
      success: true,
      data: result,
      message: `Dia ${isActive ? 'habilitado' : 'desabilitado'} com sucesso`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Deletar horário de trabalho para um dia
 * DELETE /api/working-hours/:professionalId/:dayOfWeek
 */
router.delete('/:professionalId/:dayOfWeek', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { professionalId, dayOfWeek } = req.params;

    // Verificar autorização
    if (req.user.role === 'professional' && req.user.id !== professionalId) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para deletar horários de outro profissional'
      });
    }

    const result = await WorkingHoursService.deleteWorkingHours(
      professionalId,
      parseInt(dayOfWeek)
    );

    res.json({
      success: true,
      data: result,
      message: 'Horário deletado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

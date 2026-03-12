/**
 * Rotas de agendamentos (appointments)
 * 
 * Endpoints:
 * GET    /api/appointments - Listar todos (admin)
 * GET    /api/appointments/my - Meus agendamentos (cliente)
 * GET    /api/appointments/professional - Agendamentos do profissional
 * GET    /api/appointments/:id - Obter um agendamento
 * POST   /api/appointments - Criar novo agendamento
 * PATCH  /api/appointments/:id - Atualizar agendamento
 * POST   /api/appointments/:id/confirm - Confirmar agendamento
 * POST   /api/appointments/:id/cancel - Cancelar agendamento
 * POST   /api/appointments/:id/no-show - Marcar como não comparecido
 * POST   /api/appointments/:id/complete - Marcar como concluído
 * POST   /api/appointments/:id/reschedule - Reagendar (novo slot)
 * GET    /api/appointments/stats - Estatísticas
 */

const express = require('express');
const router = express.Router();
const AppointmentService = require('../modules/appointments/AppointmentService');
const { authenticate, authorize } = require('../shared/middlewares/authMiddleware');
const { errorHandler } = require('../shared/middlewares/errorHandler');

/**
 * ADMIN: Listar todos os agendamentos
 * GET /api/appointments?page=1&pageSize=20&status=confirmed&professionalId=xxx
 */
router.get('/', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { page = 1, pageSize = 20, status, professionalId } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (professionalId) filters.professionalId = professionalId;

    const result = await AppointmentService.listAll(page, pageSize, filters);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * CLIENTE: Obter meus agendamentos
 * GET /api/appointments/my?status=confirmed&page=1
 */
router.get('/my', authenticate, async (req, res, next) => {
  try {
    const { status, page = 1, pageSize = 20 } = req.query;

    const filters = {
      status: status || undefined
    };

    const result = await AppointmentService.getClientAppointments(
      req.user.id,
      filters
    );

    // Aplicar paginação simples
    const offset = (page - 1) * pageSize;
    const paginated = {
      appointments: result.slice(offset, offset + pageSize),
      pagination: {
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        total: result.length
      }
    };

    res.json({
      success: true,
      data: paginated
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PROFISSIONAL: Obter meus agendamentos
 * GET /api/appointments/professional?status=confirmed&startDate=2026-03-01&endDate=2026-03-31
 */
router.get('/professional', authenticate, authorize(['professional', 'admin']), async (req, res, next) => {
  try {
    const { status, startDate, endDate } = req.query;

    const professionalId = req.user.role === 'professional' ? req.user.id : req.query.professionalId;

    if (!professionalId) {
      return res.status(400).json({
        success: false,
        message: 'profissionalId é obrigatório'
      });
    }

    const filters = {
      status: status || undefined,
      startDate: startDate || undefined,
      endDate: endDate || undefined
    };

    const result = await AppointmentService.getProfessionalAppointments(
      professionalId,
      filters
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
 * Obter um agendamento específico
 */
router.get('/:id', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;

    const appointment = await AppointmentService.getById(id);

    // Validar permissão
    if (req.user.role === 'client' && appointment.client_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar este agendamento'
      });
    }

    if (req.user.role === 'professional' && appointment.professional_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para acessar este agendamento'
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Criar novo agendamento
 * Body: { slotId, serviceId, professionalId, notes (opcional) }
 */
router.post('/', authenticate, async (req, res, next) => {
  try {
    const { slotId, serviceId, professionalId, notes } = req.body;

    if (!slotId || !serviceId || !professionalId) {
      return res.status(400).json({
        success: false,
        message: 'Dados obrigatórios: slotId, serviceId, professionalId'
      });
    }

    const appointmentData = {
      slotId,
      clientId: req.user.id,
      serviceId,
      professionalId,
      notes: notes || null
    };

    const result = await AppointmentService.createAppointment(appointmentData);

    res.status(201).json({
      success: true,
      data: result,
      message: 'Agendamento criado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Confirmar um agendamento pendente
 */
router.post('/:id/confirm', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await AppointmentService.confirmAppointment(id);

    res.json({
      success: true,
      data: result,
      message: 'Agendamento confirmado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Cancelar um agendamento
 * Body: { reason (opcional) }
 */
router.post('/:id/cancel', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const appointment = await AppointmentService.getById(id);

    // Validar permissão
    if (req.user.role === 'client' && appointment.client_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para cancelar este agendamento'
      });
    }

    const result = await AppointmentService.cancelAppointment(id, reason);

    res.json({
      success: true,
      data: result,
      message: 'Agendamento cancelado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Marcar como não comparecido
 * Body: { reason (opcional) }
 */
router.post('/:id/no-show', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const result = await AppointmentService.markNoShow(id, reason);

    res.json({
      success: true,
      data: result,
      message: 'Cliente marcado como não comparecido'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Marcar como concluído
 */
router.post('/:id/complete', authenticate, authorize(['admin', 'professional']), async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await AppointmentService.completeAppointment(id);

    res.json({
      success: true,
      data: result,
      message: 'Agendamento marcado como concluído'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Reagendar para outro horário
 * Body: { newSlotId }
 */
router.post('/:id/reschedule', authenticate, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { newSlotId } = req.body;

    if (!newSlotId) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro obrigatório: newSlotId'
      });
    }

    const appointment = await AppointmentService.getById(id);

    // Validar permissão
    if (req.user.role === 'client' && appointment.client_id !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Sem permissão para reagendar este agendamento'
      });
    }

    const result = await AppointmentService.rescheduleAppointment(id, newSlotId);

    res.json({
      success: true,
      data: result,
      message: 'Agendamento reagendado com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Obter estatísticas de agendamentos
 * Query: professionalId, startDate, endDate
 */
router.get('/stats', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const { professionalId, startDate, endDate } = req.query;

    if (!professionalId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: professionalId, startDate, endDate'
      });
    }

    const result = await AppointmentService.getAppointmentStats(
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

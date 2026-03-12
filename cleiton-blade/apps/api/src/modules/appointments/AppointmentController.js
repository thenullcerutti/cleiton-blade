const { formatSuccess } = require('../../shared/utils/helpers');
const AppointmentService = require('./AppointmentService');

/**
 * Controller de agendamentos
 * Manipula requisições HTTP relacionadas a agendamentos
 */

class AppointmentController {
  /**
   * GET /appointments
   * Lista agendamentos com filtros
   */
  static async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const filters = {};
      if (req.query.status) filters.status = req.query.status;
      if (req.query.clientId) filters.clientId = req.query.clientId;
      if (req.query.professionalId) filters.professionalId = req.query.professionalId;
      if (req.query.startDate) filters.startDate = req.query.startDate;
      if (req.query.endDate) filters.endDate = req.query.endDate;

      const result = await AppointmentService.listAll(page, pageSize, filters);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /appointments/:id
   * Obtém um agendamento
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const appointment = await AppointmentService.getById(id);

      return res.status(200).json(formatSuccess(appointment));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /appointments/client/:clientId
   * Obtém agendamentos de um cliente
   */
  static async getByClientId(req, res, next) {
    try {
      const { clientId } = req.params;

      const result = await AppointmentService.getByClientId(clientId);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /appointments/professional/:professionalId
   * Obtém agendamentos de um profissional
   */
  static async getByProfessionalId(req, res, next) {
    try {
      const { professionalId } = req.params;

      const result = await AppointmentService.getByProfessionalId(professionalId);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /appointments/available
   * Retorna horários disponíveis
   * Query params: professional_id, date (YYYY-MM-DD), service_id
   */
  static async getAvailableSlots(req, res, next) {
    try {
      const { professional_id, date, service_id } = req.query;

      const result = await AppointmentService.getAvailableSlots(
        professional_id,
        date,
        service_id
      );

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /appointments
   * Cria novo agendamento
   */
  static async create(req, res, next) {
    try {
      const { clientId, professionalId, serviceId, appointmentDatetime, origin, notes } = req.body;

      const appointment = await AppointmentService.create(
        clientId,
        professionalId,
        serviceId,
        appointmentDatetime,
        origin || 'app',
        notes
      );

      return res.status(201).json(
        formatSuccess(appointment, 'Agendamento criado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /appointments/:id/confirm
   * Confirma agendamento
   */
  static async confirm(req, res, next) {
    try {
      const { id } = req.params;

      const updated = await AppointmentService.confirm(id);

      return res.status(200).json(
        formatSuccess(updated, 'Agendamento confirmado')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /appointments/:id/complete
   * Marca como concluído
   */
  static async complete(req, res, next) {
    try {
      const { id } = req.params;

      const updated = await AppointmentService.complete(id);

      return res.status(200).json(
        formatSuccess(updated, 'Agendamento marcado como concluído')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /appointments/:id/cancel
   * Cancela agendamento
   */
  static async cancel(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const updated = await AppointmentService.cancel(id, reason);

      return res.status(200).json(
        formatSuccess(updated, 'Agendamento cancelado')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /appointments/:id/no-show
   * Marca como não compareceu
   */
  static async markNoShow(req, res, next) {
    try {
      const { id } = req.params;

      const updated = await AppointmentService.markNoShow(id);

      return res.status(200).json(
        formatSuccess(updated, 'Agendamento marcado como não compareceu')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AppointmentController;

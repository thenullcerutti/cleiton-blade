const { formatSuccess } = require('../../shared/utils/helpers');
const ProfessionalService = require('./ProfessionalService');

/**
 * Controller de profissionais
 * Manipula requisições HTTP relacionadas a profissionais
 */

class ProfessionalController {
  /**
   * GET /professionals
   * Lista todos os profissionais
   */
  static async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const result = await ProfessionalService.listAll(page, pageSize);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /professionals/:id
   * Obtém um profissional
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const professional = await ProfessionalService.getById(id);

      return res.status(200).json(formatSuccess(professional));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /professionals
   * Cria novo profissional
   */
  static async create(req, res, next) {
    try {
      const { userId, name, commissionPercentage } = req.body;

      const professional = await ProfessionalService.create(
        userId,
        name,
        commissionPercentage || 0
      );

      return res.status(201).json(
        formatSuccess(professional, 'Profissional criado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /professionals/:id
   * Atualiza profissional
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await ProfessionalService.update(id, data);

      return res.status(200).json(
        formatSuccess(updated, 'Profissional atualizado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /professionals/:id/toggle
   * Ativa ou desativa profissional
   */
  static async toggleActive(req, res, next) {
    try {
      const { id } = req.params;
      const { active } = req.body;

      if (typeof active !== 'boolean') {
        return res.status(400).json({
          success: false,
          data: null,
          error: {
            message: 'Campo active deve ser boolean',
            code: 'VALIDATION_ERROR'
          }
        });
      }

      const updated = await ProfessionalService.toggleActive(id, active);

      return res.status(200).json(
        formatSuccess(updated, `Profissional ${active ? 'ativado' : 'desativado'}`)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /professionals/:id/schedules
   * Obtém horários de trabalho
   */
  static async getSchedules(req, res, next) {
    try {
      const { id } = req.params;

      const schedules = await ProfessionalService.getSchedules(id);

      return res.status(200).json(formatSuccess(schedules));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /professionals/:id/appointments
   * Obtém agendamentos
   */
  static async getAppointments(req, res, next) {
    try {
      const { id } = req.params;
      const { status } = req.query;

      const appointments = await ProfessionalService.getAppointments(id, status);

      return res.status(200).json(formatSuccess(appointments));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ProfessionalController;

const { formatSuccess } = require('../../shared/utils/helpers');
const ScheduleService = require('./ScheduleService');

/**
 * Controller de agendas
 * Manipula requisições HTTP relacionadas a agendas de profissionais
 */

class ScheduleController {
  /**
   * GET /schedules/professional/:professionalId
   * Lista agendas de um profissional
   */
  static async getByProfessionalId(req, res, next) {
    try {
      const { professionalId } = req.params;

      const result = await ScheduleService.getByProfessionalId(professionalId);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /schedules
   * Cria nova agenda
   */
  static async create(req, res, next) {
    try {
      const { professionalId, weekday, startTime, endTime, breakStart, breakEnd } = req.body;

      const schedule = await ScheduleService.create(
        professionalId,
        weekday,
        startTime,
        endTime,
        breakStart,
        breakEnd
      );

      return res.status(201).json(
        formatSuccess(schedule, 'Agenda criada com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /schedules/:id
   * Atualiza agenda
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await ScheduleService.update(id, data);

      return res.status(200).json(
        formatSuccess(updated, 'Agenda atualizada com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /schedules/:id
   * Deleta agenda
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      await ScheduleService.delete(id);

      return res.status(200).json(
        formatSuccess({ message: 'Agenda removida com sucesso' })
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ScheduleController;

const { formatSuccess } = require('../../shared/utils/helpers');
const ServiceService = require('./ServiceService');

/**
 * Controller de serviços
 * Manipula requisições HTTP relacionadas a serviços
 */

class ServiceController {
  /**
   * DELETE /services/:id
   * Remove um serviço
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;
      await ServiceService.delete(id);
      return res.status(200).json({ success: true });
    } catch (error) {
      next(error);
    }
  }
  /**
   * GET /services
   * Lista todos os serviços
   */
  static async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const result = await ServiceService.listAll(page, pageSize);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /services/:id
   * Obtém um serviço por ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const service = await ServiceService.getById(id);

      return res.status(200).json(formatSuccess(service));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /services
   * Cria novo serviço
   */
  static async create(req, res, next) {
    try {
      const { name, durationMinutes, price, description } = req.body;

      const service = await ServiceService.create(
        name,
        durationMinutes,
        price,
        description
      );

      return res.status(201).json(
        formatSuccess(service, 'Serviço criado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /services/:id
   * Atualiza serviço
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.body;

      const updated = await ServiceService.update(id, data);

      return res.status(200).json(
        formatSuccess(updated, 'Serviço atualizado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /services/:id/toggle
   * Ativa ou desativa serviço
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

      const updated = await ServiceService.toggleActive(id, active);

      return res.status(200).json(
        formatSuccess(updated, `Serviço ${active ? 'ativado' : 'desativado'}`)
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ServiceController;

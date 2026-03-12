const { formatSuccess } = require('../../shared/utils/helpers');
const ClientService = require('./ClientService');

/**
 * Controller de clientes
 * Manipula requisições HTTP relacionadas a clientes
 */

class ClientController {
  /**
   * GET /clients
   * Lista todos os clientes
   */
  static async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const result = await ClientService.listAll(page, pageSize);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /clients/:id
   * Obtém um cliente por ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const client = await ClientService.getById(id);

      return res.status(200).json(formatSuccess(client));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /clients/phone/:phone
   * Busca cliente por telefone
   */
  static async getByPhone(req, res, next) {
    try {
      const { phone } = req.params;

      const client = await ClientService.getByPhone(phone);

      return res.status(200).json(formatSuccess(client));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /clients
   * Cria novo cliente
   */
  static async create(req, res, next) {
    try {
      const { name, phone, email, birthDate } = req.body;

      const client = await ClientService.create(name, phone, email, birthDate);

      return res.status(201).json(
        formatSuccess(client, 'Cliente criado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /clients/:id
   * Atualiza cliente
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email, birthDate } = req.body;

      const updated = await ClientService.update(id, { name, email, birthDate });

      return res.status(200).json(
        formatSuccess(updated, 'Cliente atualizado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /clients/:id/block
   * Bloqueia cliente
   */
  static async block(req, res, next) {
    try {
      const { id } = req.params;

      const updated = await ClientService.block(id, true);

      return res.status(200).json(
        formatSuccess(updated, 'Cliente bloqueado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /clients/:id/unblock
   * Desbloqueia cliente
   */
  static async unblock(req, res, next) {
    try {
      const { id } = req.params;

      const updated = await ClientService.unblock(id);

      return res.status(200).json(
        formatSuccess(updated, 'Cliente desbloqueado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /clients/:id/loyalty-points
   * Adiciona pontos de lealdade
   */
  static async addLoyaltyPoints(req, res, next) {
    try {
      const { id } = req.params;
      const { points } = req.body;

      const updated = await ClientService.addLoyaltyPoints(id, points);

      return res.status(200).json(
        formatSuccess(updated, `${points} pontos adicionados ao cliente`)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /clients/:id/loyalty-points/remove
   * Remove pontos de lealdade
   */
  static async removeLoyaltyPoints(req, res, next) {
    try {
      const { id } = req.params;
      const { points } = req.body;

      const updated = await ClientService.removeLoyaltyPoints(id, points);

      return res.status(200).json(
        formatSuccess(updated, `${points} pontos removidos do cliente`)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /clients/:id
   * Deleta cliente
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      await ClientService.delete(id);

      return res.status(200).json(
        formatSuccess(null, 'Cliente removido com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ClientController;

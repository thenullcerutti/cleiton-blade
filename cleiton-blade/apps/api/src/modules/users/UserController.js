const { formatSuccess } = require('../../shared/utils/helpers');
const UserService = require('./UserService');

/**
 * Controller de usuários
 * Manipula requisições HTTP relacionadas a usuários
 */

class UserController {
  /**
   * GET /users
   * Lista todos os usuários com paginação
   */
  static async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const result = await UserService.listAll(page, pageSize);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/:id
   * Obtém um usuário por ID
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const user = await UserService.getById(id);

      return res.status(200).json(formatSuccess(user));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /users/role/:role
   * Lista usuários por role (admin ou professional)
   */
  static async listByRole(req, res, next) {
    try {
      const { role } = req.params;
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const result = await UserService.listByRole(role, page, pageSize);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /users/:id
   * Atualiza um usuário
   */
  static async update(req, res, next) {
    try {
      const { id } = req.params;
      const { name, email } = req.body;

      const updated = await UserService.update(id, { name, email });

      return res.status(200).json(
        formatSuccess(updated, 'Usuário atualizado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /users/:id/toggle
   * Ativa ou desativa um usuário
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

      const updated = await UserService.toggleActive(id, active);

      return res.status(200).json(
        formatSuccess(updated, `Usuário ${active ? 'ativado' : 'desativado'}`)
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /users/:id
   * Deleta um usuário
   */
  static async delete(req, res, next) {
    try {
      const { id } = req.params;

      const result = await UserService.delete(id);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = UserController;

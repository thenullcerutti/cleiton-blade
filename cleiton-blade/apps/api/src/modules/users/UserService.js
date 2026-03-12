const { ValidationError, NotFoundError, ConflictError } = require('../../shared/errors/AppError');
const { getPaginationParams } = require('../../shared/utils/helpers');
const UserRepository = require('./UserRepository');

/**
 * Serviço de usuários
 * Lógica de negócio para gerenciar usuários
 */

class UserService {
  /**
   * Lista todos os usuários
   */
  static async listAll(page = 1, pageSize = 20) {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const { users, total } = await UserRepository.findAll(offset, limit);

    return {
      users,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Obtém usuário por ID
   */
  static async getById(id) {
    const user = await UserRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    return user;
  }

  /**
   * Lista usuários por role
   */
  static async listByRole(role, page = 1, pageSize = 20) {
    if (!['admin', 'professional'].includes(role)) {
      throw new ValidationError('Role inválido');
    }

    const { offset, limit } = getPaginationParams(page, pageSize);

    const { users, total } = await UserRepository.findByRole(role, offset, limit);

    return {
      users,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Atualiza usuário
   */
  static async update(id, data) {
    // Valida dados
    if (data.name && data.name.trim().length < 3) {
      throw new ValidationError('Nome deve ter pelo menos 3 caracteres');
    }

    if (data.email && !data.email.includes('@')) {
      throw new ValidationError('Email inválido');
    }

    // Verifica se email já existe
    if (data.email) {
      const emailExists = await UserRepository.emailExists(data.email, id);
      if (emailExists) {
        throw new ConflictError('Email já cadastrado');
      }
    }

    // Verifica se usuário existe
    const user = await UserRepository.findById(id);
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    // Atualiza
    const updated = await UserRepository.update(id, data);

    return updated;
  }

  /**
   * Ativa/desativa usuário
   */
  static async toggleActive(id, active) {
    const user = await UserRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    const updated = await UserRepository.update(id, { active });

    return updated;
  }

  /**
   * Deleta usuário
   */
  static async delete(id) {
    const user = await UserRepository.findById(id);
    
    if (!user) {
      throw new NotFoundError('Usuário não encontrado');
    }

    await UserRepository.delete(id);

    return { message: 'Usuário deletado com sucesso' };
  }
}

module.exports = UserService;

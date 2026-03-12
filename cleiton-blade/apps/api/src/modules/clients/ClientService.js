const { ValidationError, NotFoundError, ConflictError } = require('../../shared/errors/AppError');
const { getPaginationParams, isValidPhone, isValidEmail } = require('../../shared/utils/helpers');
const ClientRepository = require('./ClientRepository');
const { eventEmitter, EVENTS } = require('../events/EventEmitter');

/**
 * Serviço de clientes
 * Lógica de negócio para gerenciar clientes
 */

class ClientService {
  /**
   * Lista todos os clientes
   */
  static async listAll(page = 1, pageSize = 20) {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const { clients, total } = await ClientRepository.findAll(offset, limit);

    return {
      clients,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Obtém cliente por ID
   */
  static async getById(id) {
    const client = await ClientRepository.findById(id);

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return client;
  }

  /**
   * Busca cliente por telefone
   */
  static async getByPhone(phone) {
    const client = await ClientRepository.findByPhone(phone);

    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    return client;
  }

  /**
   * Cria novo cliente
   */
  static async create(name, phone, email = null, birthDate = null) {
    // Validações
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Nome deve conter pelo menos 3 caracteres');
    }

    if (!phone || !isValidPhone(phone)) {
      throw new ValidationError('Telefone inválido (formato brasileiro esperado)');
    }

    if (email && !isValidEmail(email)) {
      throw new ValidationError('Email inválido');
    }

    if (birthDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(birthDate)) {
        throw new ValidationError('Data de nascimento deve estar no formato YYYY-MM-DD');
      }
      const date = new Date(birthDate);
      if (isNaN(date.getTime())) {
        throw new ValidationError('Data de nascimento inválida');
      }
    }

    // Verifica se telefone já existe
    const phoneExists = await ClientRepository.phoneExists(phone);
    if (phoneExists) {
      throw new ConflictError('Este telefone já está cadastrado');
    }

    // Verifica se email já existe (se fornecido)
    if (email) {
      const emailExists = await ClientRepository.emailExists(email);
      if (emailExists) {
        throw new ConflictError('Este email já está cadastrado');
      }
    }

    // Cria cliente
    const client = await ClientRepository.create(name, phone, email, birthDate);

    // Emite evento
    await eventEmitter.emit(EVENTS.CLIENT_CREATED, {
      clientId: client.id,
      name: client.name,
      phone: client.phone,
    });

    return client;
  }

  /**
   * Atualiza cliente
   */
  static async update(id, data) {
    // Verifica se cliente existe
    const client = await ClientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    // Validações
    if (data.name && data.name.trim().length < 3) {
      throw new ValidationError('Nome deve conter pelo menos 3 caracteres');
    }

    if (data.email && !isValidEmail(data.email)) {
      throw new ValidationError('Email inválido');
    }

    if (data.birthDate) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      if (!dateRegex.test(data.birthDate)) {
        throw new ValidationError('Data de nascimento deve estar no formato YYYY-MM-DD');
      }
      const date = new Date(data.birthDate);
      if (isNaN(date.getTime())) {
        throw new ValidationError('Data de nascimento inválida');
      }
    }

    if (data.email) {
      const emailExists = await ClientRepository.emailExists(data.email, id);
      if (emailExists) {
        throw new ConflictError('Este email já está cadastrado');
      }
    }

    // Atualiza
    const updated = await ClientRepository.update(id, data);

    return updated;
  }

  /**
   * Bloqueia cliente
   */
  static async block(id, blocked = true) {
    const client = await ClientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const updated = await ClientRepository.toggleBlocked(id, blocked);

    return updated;
  }

  /**
   * Desbloqueia cliente
   */
  static async unblock(id) {
    return this.block(id, false);
  }

  /**
   * Adiciona pontos de lealdade
   */
  static async addLoyaltyPoints(clientId, points) {
    if (points <= 0) {
      throw new ValidationError('Pontos deve ser maior que 0');
    }

    const client = await ClientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const updated = await ClientRepository.addLoyaltyPoints(clientId, points);

    return updated;
  }

  /**
   * Remove pontos de lealdade
   */
  static async removeLoyaltyPoints(clientId, points) {
    if (points <= 0) {
      throw new ValidationError('Pontos deve ser maior que 0');
    }

    const client = await ClientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    if (client.loyalty_points < points) {
      throw new ValidationError('Cliente não possui pontos suficientes');
    }

    const updated = await ClientRepository.addLoyaltyPoints(clientId, -points);

    return updated;
  }

  /**
   * Deleta cliente
   */
  static async delete(id) {
    const client = await ClientRepository.findById(id);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    await ClientRepository.delete(id);
    return true;
  }
}

module.exports = ClientService;

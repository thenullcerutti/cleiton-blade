
const { ValidationError, NotFoundError, ConflictError } = require('../../shared/errors/AppError');
const { getPaginationParams } = require('../../shared/utils/helpers');
const ServiceRepository = require('./ServiceRepository');

/**
 * Serviço de serviços (confuse naming, but this is the service class for managing services)
 * Lógica de negócio para gerenciar serviços oferecidos
 */
class ServiceService {
  /**
   * Lista todos os serviços
   */
  static async listAll(page = 1, pageSize = 20) {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const { services, total } = await ServiceRepository.findAll(offset, limit);

    return {
      services,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Obtém serviço por ID
   */
  static async getById(id) {
    const service = await ServiceRepository.findById(id);

    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    return service;
  }

  /**
   * Cria novo serviço
   */
  static async create(name, durationMinutes, price, description = null) {
    // Validações
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Nome do serviço deve conter pelo menos 3 caracteres');
    }

    if (!durationMinutes || durationMinutes <= 0) {
      throw new ValidationError('Duração deve ser maior que 0');
    }

    if (!price || price <= 0) {
      throw new ValidationError('Preço deve ser maior que 0');
    }

    // Verifica se nome já existe
    const nameExists = await ServiceRepository.nameExists(name);
    if (nameExists) {
      throw new ConflictError('Já existe um serviço com este nome');
    }

    // Cria serviço
    const service = await ServiceRepository.create(name, durationMinutes, price, description);

    return service;
  }

  /**
   * Atualiza serviço
   */
  static async update(id, data) {
    // Verifica se serviço existe
    const service = await ServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    // Validações
    if (data.name && data.name.trim().length < 3) {
      throw new ValidationError('Nome do serviço deve conter pelo menos 3 caracteres');
    }

    if (typeof data.durationMinutes !== 'undefined' && data.durationMinutes <= 0) {
      throw new ValidationError('Duração deve ser maior que 0');
    }

    if (typeof data.price !== 'undefined' && data.price <= 0) {
      throw new ValidationError('Preço deve ser maior que 0');
    }

    // Verifica se novo nome ja existe
    if (data.name) {
      const nameExists = await ServiceRepository.nameExists(data.name, id);
      if (nameExists) {
        throw new ConflictError('Já existe um serviço com este nome');
      }
    }

    // Atualiza
    const updated = await ServiceRepository.update(id, data);

    return updated;
  }

  /**
   * Ativa/desativa serviço
   */
  static async toggleActive(id, active) {
    const service = await ServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    const updated = await ServiceRepository.toggleActive(id, active);

    return updated;
  }

  /**
   * Remove serviço
   */
  static async delete(id) {
    const service = await ServiceRepository.findById(id);
    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }
    await ServiceRepository.delete(id);
    return true;
  }
}

module.exports = ServiceService;

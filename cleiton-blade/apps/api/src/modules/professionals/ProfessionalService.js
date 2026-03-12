const { ValidationError, NotFoundError, ConflictError } = require('../../shared/errors/AppError');
const { getPaginationParams } = require('../../shared/utils/helpers');
const ProfessionalRepository = require('./ProfessionalRepository');
const { eventEmitter, EVENTS } = require('../events/EventEmitter');

/**
 * Serviço de profissionais
 * Lógica de negócio para gerenciar profissionais
 */

class ProfessionalService {
  /**
   * Lista todos os profissionais
   */
  static async listAll(page = 1, pageSize = 20) {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const { professionals, total } = await ProfessionalRepository.findAll(offset, limit);

    return {
      professionals,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Obtém profissional por ID
   */
  static async getById(id) {
    const professional = await ProfessionalRepository.findById(id);

    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    return professional;
  }

  /**
   * Cria novo profissional
   */
  static async create(userId, name, commissionPercentage = 0) {
    // Validações
    if (!name || name.trim().length < 3) {
      throw new ValidationError('Nome deve conter pelo menos 3 caracteres');
    }

    if (commissionPercentage < 0 || commissionPercentage > 100) {
      throw new ValidationError('Comissão deve estar entre 0 e 100');
    }

    // Verifica se já existe profissional para este user
    const existing = await ProfessionalRepository.findByUserId(userId);
    if (existing) {
      throw new ConflictError('Um profissional já está associado a este usuário');
    }

    // Cria profissional
    const professional = await ProfessionalRepository.create(userId, name, commissionPercentage);

    // Emite evento
    await eventEmitter.emit(EVENTS.PROFESSIONAL_CREATED, {
      professionalId: professional.id,
      name: professional.name,
      userId,
    });

    return professional;
  }

  /**
   * Atualiza profissional
   */
  static async update(id, data) {
    // Verifica se profissional existe
    const professional = await ProfessionalRepository.findById(id);
    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    // Validações
    if (data.name && data.name.trim().length < 3) {
      throw new ValidationError('Nome deve conter pelo menos 3 caracteres');
    }

    if (typeof data.commissionPercentage !== 'undefined') {
      if (data.commissionPercentage < 0 || data.commissionPercentage > 100) {
        throw new ValidationError('Comissão deve estar entre 0 e 100');
      }
    }

    // Atualiza
    const updated = await ProfessionalRepository.update(id, data);

    return updated;
  }

  /**
   * Ativa/desativa profissional
   */
  static async toggleActive(id, active) {
    const professional = await ProfessionalRepository.findById(id);
    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    const updated = await ProfessionalRepository.toggleActive(id, active);

    return updated;
  }

  /**
   * Obtém horários de trabalho do profissional
   */
  static async getSchedules(professionalId) {
    const professional = await ProfessionalRepository.findById(professionalId);
    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    const schedules = await ProfessionalRepository.getSchedules(professionalId);

    return {
      professionalId,
      schedules,
    };
  }

  /**
   * Obtém agendamentos do profissional
   */
  static async getAppointments(professionalId, status = null) {
    const professional = await ProfessionalRepository.findById(professionalId);
    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    const appointments = await ProfessionalRepository.getAppointments(professionalId, status);

    return {
      professionalId,
      appointments,
    };
  }
}

module.exports = ProfessionalService;

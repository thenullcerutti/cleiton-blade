/**
 * Serviço de gerenciamento de horários de trabalho
 * 
 * Responsável por:
 * - Definir horários de funcionamento
 * - Gerar slots de disponibilidade automáticamente
 * - Gerenciar bloqueios de horários
 */

const WorkingHoursRepository = require('./WorkingHoursRepository');
const AvailabilitySlotsRepository = require('./AvailabilitySlotsRepository');
const { ValidationError, AppError } = require('../../shared/errors/AppError');

const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado'
];

class WorkingHoursService {
  /**
   * Obter horários de trabalho do profissional
   */
  static async getWorkingHours(professionalId) {
    const hours = await WorkingHoursRepository.getByProfessional(professionalId);
    
    // Enriquecer com nome do dia
    return hours.map(h => ({
      ...h,
      day_name: DAYS_OF_WEEK[h.day_of_week]
    }));
  }

  /**
   * Definir/atualizar horário de trabalho para um dia
   */
  static async setWorkingHours(professionalId, dayOfWeek, startTime, endTime) {
    // Validações
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      throw new ValidationError('Dia da semana inválido (0-6)');
    }

    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(startTime)) {
      throw new ValidationError('Horário inicial inválido (formato: HH:MM)');
    }
    if (!timeRegex.test(endTime)) {
      throw new ValidationError('Horário final inválido (formato: HH:MM)');
    }

    // Comparar horários
    if (startTime >= endTime) {
      throw new ValidationError('Horário de término deve ser após o início');
    }

    // Verificar se já existe
    const existing = await WorkingHoursRepository.getByDayOfWeek(professionalId, dayOfWeek);

    let result;
    if (existing) {
      // Atualizar
      result = await WorkingHoursRepository.update(
        existing.id,
        startTime,
        endTime,
        true
      );

      // Regenerar slots para este dia
      await this.regenerateSlots(professionalId, dayOfWeek);
    } else {
      // Criar novo
      result = await WorkingHoursRepository.create(
        professionalId,
        dayOfWeek,
        startTime,
        endTime
      );

      // Gerar slots iniciais para este dia
      await this.generateSlotsForDay(professionalId, dayOfWeek);
    }

    return {
      ...result,
      day_name: DAYS_OF_WEEK[result.day_of_week]
    };
  }

  /**
   * Habilitar/desabilitar um dia inteiro
   */
  static async toggleWorkingDay(professionalId, dayOfWeek, isActive) {
    const existing = await WorkingHoursRepository.getByDayOfWeek(professionalId, dayOfWeek);
    
    if (!existing) {
      throw new AppError('Horário não configurado para este dia', 404);
    }

    const result = await WorkingHoursRepository.toggleActive(existing.id, isActive);

    return {
      ...result,
      day_name: DAYS_OF_WEEK[result.day_of_week]
    };
  }

  /**
   * Gerar slots para um dia específico
   * Usa os horários de trabalho + duração dos serviços
   */
  static async generateSlotsForDay(professionalId, dayOfWeek) {
    const workingHour = await WorkingHoursRepository.getByDayOfWeek(professionalId, dayOfWeek);
    
    if (!workingHour || !workingHour.is_active) {
      return [];
    }

    // Obter próximas 30 dias com este dia da semana
    const today = new Date();
    const slots = [];

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      if (date.getDay() === dayOfWeek) {
        // Gerar slots para este dia
        const daySlots = this.generateSlotsForSpecificDate(
          professionalId,
          date,
          workingHour
        );
        slots.push(...daySlots);
      }
    }

    return slots;
  }

  /**
   * Gerar slots para uma data específica
   * (usado internamente)
   */
  static async generateSlotsForSpecificDate(professionalId, date, workingHour, serviceDurationMinutes = 30) {
    // Converter tempos para minutos
    const [startHour, startMin] = workingHour.start_time.split(':').map(Number);
    const [endHour, endMin] = workingHour.end_time.split(':').map(Number);

    let currentHour = startHour;
    let currentMin = startMin;
    const endTotalMinutes = endHour * 60 + endMin;
    const slots = [];

    while (true) {
      const currentTotalMinutes = currentHour * 60 + currentMin;
      const slotEndMinutes = currentTotalMinutes + serviceDurationMinutes;

      if (slotEndMinutes > endTotalMinutes) break;

      const slotDateTime = new Date(date);
      slotDateTime.setHours(currentHour, currentMin, 0, 0);

      // Criar slot no banco
      const slot = await AvailabilitySlotsRepository.create(
        professionalId,
        slotDateTime.toISOString(),
        serviceDurationMinutes,
        'available'
      );

      slots.push(slot);

      // Próximo slot em 15 minutos
      currentMin += 15;
      if (currentMin >= 60) {
        currentHour += 1;
        currentMin -= 60;
      }
    }

    return slots;
  }

  /**
   * Regenerar slots de um dia (quando horário é alterado)
   */
  static async regenerateSlots(professionalId, dayOfWeek) {
    // Deletar slots existentes para este dia (próximos 30 dias)
    const today = new Date();

    for (let i = 0; i < 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      if (date.getDay() === dayOfWeek) {
        await AvailabilitySlotsRepository.deleteByDate(professionalId, date);
      }
    }

    // Regenerar
    return this.generateSlotsForDay(professionalId, dayOfWeek);
  }

  /**
   * Deletar horário de trabalho (apenas se nenhum agendamento)
   */
  static async deleteWorkingHours(professionalId, dayOfWeek) {
    const existing = await WorkingHoursRepository.getByDayOfWeek(professionalId, dayOfWeek);
    
    if (!existing) {
      throw new AppError('Horário não encontrado', 404);
    }

    // Deletar slots
    await AvailabilitySlotsRepository.deleteByDate(professionalId, new Date());

    // Deletar horário
    await WorkingHoursRepository.delete(existing.id);

    return { message: 'Horário deletado com sucesso' };
  }
}

module.exports = WorkingHoursService;

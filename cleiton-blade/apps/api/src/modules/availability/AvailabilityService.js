/**
 * Serviço de gerenciamento de disponibilidade de agendamentos
 * 
 * Gera slots dinamicamente baseado nos horários de funcionamento
 */

const WorkingHoursRepository = require('./WorkingHoursRepository');
const ServiceRepository = require('../services/ServiceRepository');
const AppointmentRepository = require('../appointments/AppointmentRepository');
const { AppError } = require('../../shared/errors/AppError');

class AvailabilityService {
  /**
   * Gerar slots disponíveis dinamicamente
   * Cria slots de 15 em 15 minutos baseado nos working_hours
   */
  static async getAvailableSlots(professionalId, startDate, endDate, serviceId = null) {
    try {
      // Validações
      if (!professionalId) {
        throw new AppError('Professional ID é obrigatório', 400);
      }

      console.log('[AvailabilityService] getAvailableSlots called for professional:', professionalId);

      // Obter duração do serviço
      let serviceDuration = 30; // padrão
      if (serviceId) {
        try {
          console.log('[AvailabilityService] Fetching service duration for service:', serviceId);
          const service = await ServiceRepository.getById(serviceId);
          if (service && service.duration_minutes) {
            serviceDuration = service.duration_minutes;
          }
        } catch (e) {
          // Se erro ao buscar serviço, usar padrão
          console.log('[AvailabilityService] Service fetch failed, using default duration:', e.message);
        }
      }

      // Obter horários de funcionamento
      console.log('[AvailabilityService] Fetching working hours for professional:', professionalId);
      let workingHours = [];
      try {
        workingHours = await WorkingHoursRepository.getByProfessional(professionalId);
        console.log('[AvailabilityService] Working hours fetched, count:', workingHours?.length || 0);
      } catch (dbError) {
        // Se table não existe ou erro de acesso, use padrão
        console.log('[AvailabilityService] Could not fetch working hours (table may not exist), using defaults:', dbError.message);
        workingHours = [];
      }
      
      if (!workingHours || workingHours.length === 0) {
        // Retornar horário padrão se não encontrar ou houver erro de BD
        console.log('[AvailabilityService] No working hours available, using default slots');
        return {
          professional_id: professionalId,
          service_id: serviceId || null,
          service_duration: serviceDuration,
          data: this.generateDefaultSlots(startDate, endDate, serviceDuration),
          total_slots: 44  // 11 horas * 4 slots de 15 min
        };
      }

      // Gerar slots para o período
      console.log('[AvailabilityService] Generating slots from working hours');
      const slots = this.generateSlotsFromWorkingHours(
        workingHours,
        startDate,
        endDate,
        serviceDuration
      );

      console.log('[AvailabilityService] Generated', slots.length, 'slots');
      return {
        professional_id: professionalId,
        service_id: serviceId || null,
        service_duration: serviceDuration,
        data: slots,
        total_slots: slots.length
      };
    } catch (error) {
      console.error('[AvailabilityService] ERROR in getAvailableSlots:', error);
      console.error('[AvailabilityService] Stack trace:', error.stack);
      if (error instanceof AppError) throw error;
      throw new AppError('Erro ao buscar slots disponíveis: ' + error.message, 500);
    }
  }

  /**
   * Gerar slots a partir dos horários de funcionamento
   */
  static generateSlotsFromWorkingHours(workingHours, startDate, endDate, serviceDuration = 30) {
    const slots = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateString = current.toISOString().split('T')[0];

      // Buscar horário de funcionamento para este dia
      const dayWorking = workingHours.find(w => w.day_of_week === dayOfWeek);

      if (dayWorking && dayWorking.is_available) {
        // Gerar slots para este dia
        const [startHour, startMin] = dayWorking.start_time.split(':').map(Number);
        const [endHour, endMin] = dayWorking.end_time.split(':').map(Number);

        let slotTime = new Date(current);
        slotTime.setHours(startHour, startMin, 0, 0);

        const endTime = new Date(current);
        endTime.setHours(endHour, endMin, 0, 0);

        while (slotTime < endTime) {
          slots.push({
            id: `${dateString}T${slotTime.toTimeString().substring(0, 5)}`,
            slot_time: slotTime.toTimeString().substring(0, 5),
            datetime: slotTime.toISOString(),
            is_available: true,
            professional_id: workingHours[0]?.professional_id || '1'
          });

          // Próximo slot em 15 minutos
          slotTime.setMinutes(slotTime.getMinutes() + 15);
        }
      }

      // Próximo dia
      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  /**
   * Gerar slots padrão (07:00 - 18:00, segunda a sexta)
   */
  static generateDefaultSlots(startDate, endDate, serviceDuration = 30) {
    const slots = [];
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      const dateString = current.toISOString().split('T')[0];

      // Segunda a sexta (1-5)
      if (dayOfWeek >= 1 && dayOfWeek <= 5) {
        for (let hour = 7; hour < 18; hour++) {
          for (let min = 0; min < 60; min += 15) {
            const slotTime = new Date(current);
            slotTime.setHours(hour, min, 0, 0);

            slots.push({
              id: `${dateString}T${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
              slot_time: `${String(hour).padStart(2, '0')}:${String(min).padStart(2, '0')}`,
              datetime: slotTime.toISOString(),
              is_available: true,
              professional_id: '1'
            });
          }
        }
      }

      // Próximo dia
      current.setDate(current.getDate() + 1);
    }

    return slots;
  }

  /**
   * Bloquear um slot (não implementado - seria via appointments)
   */
  static async blockSlot(slotId, reason = null) {
    throw new AppError('Bloqueio de slots não implementado yet', 501);
  }

  /**
   * Desbloquear um slot
   */
  static async unblockSlot(slotId) {
    throw new AppError('Desbloqueio de slots não implementado', 501);
  }

  /**
   * Bloquear múltiplos slots
   */
  static async blockMultipleSlots(slotIds, reason = null) {
    throw new AppError('Bloqueio múltiplo não implementado', 501);
  }

  /**
   * Obter slots bloqueados
   */
  static async getBlockedSlots(professionalId, startDate, endDate) {
    return [];
  }

  /**
   * Verificar se um slot está disponível
   */
  static async isSlotAvailable(slotId) {
    const slot = await AvailabilitySlotsRepository.getById(slotId);
    
    if (!slot) {
      throw new AppError('Slot não encontrado', 404);
    }

    return slot.status === 'available';
  }

  /**
   * Agendar em um slot (para uso interno via appointments)
   */
  static async bookSlot(slotId, appointmentData) {
    const isAvailable = await this.isSlotAvailable(slotId);
    
    if (!isAvailable) {
      throw new AppError('Slot não está disponível para agendamento', 400);
    }

    return AvailabilitySlotsRepository.bookSlot(slotId, appointmentData);
  }

  /**
   * Liberar um slot quando agendamento é cancelado
   */
  static async releaseSlot(slotId) {
    const slot = await AvailabilitySlotsRepository.getById(slotId);
    
    if (!slot) {
      throw new AppError('Slot não encontrado', 404);
    }

    return AvailabilitySlotsRepository.updateStatus(slotId, 'available');
  }

  /**
   * Obter estatísticas de disponibilidade
   */
  static async getAvailabilityStats(professionalId, startDate, endDate) {
    const allSlots = await AvailabilitySlotsRepository.getAllSlots(
      professionalId,
      startDate,
      endDate
    );

    const stats = {
      total_slots: 0,
      available: 0,
      booked: 0,
      blocked: 0,
      pending: 0,
      occupancy_rate: 0
    };

    allSlots.forEach(slot => {
      stats.total_slots++;
      stats[slot.status]++;
    });

    stats.occupancy_rate = stats.total_slots > 0 
      ? Math.round((stats.booked / stats.total_slots) * 100)
      : 0;

    return stats;
  }

  /**
   * Obter próximo horário disponível
   */
  static async getNextAvailableSlot(professionalId, afterDate = null) {
    const from = afterDate ? new Date(afterDate) : new Date();
    const to = new Date(from);
    to.setDate(to.getDate() + 30);

    const slots = await AvailabilitySlotsRepository.getAvailableSlots(
      professionalId,
      from,
      to,
      'available'
    );

    if (slots.length === 0) {
      return null;
    }

    return {
      id: slots[0].id,
      datetime: slots[0].slot_datetime,
      time: slots[0].slot_datetime.split('T')[1].substring(0, 5)
    };
  }
}

module.exports = AvailabilityService;

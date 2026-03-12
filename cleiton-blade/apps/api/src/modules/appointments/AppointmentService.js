const { ValidationError, NotFoundError, ConflictError } = require('../../shared/errors/AppError');
const { getPaginationParams } = require('../../shared/utils/helpers');
const AppointmentRepository = require('./AppointmentRepository');
const ClientRepository = require('../clients/ClientRepository');
const ProfessionalRepository = require('../professionals/ProfessionalRepository');
const ServiceRepository = require('../services/ServiceRepository');
const ScheduleRepository = require('../schedules/ScheduleRepository');
const { eventEmitter, EVENTS } = require('../events/EventEmitter');

/**
 * Serviço de agendamentos
 * Lógica de negócio para criar e gerenciar agendamentos
 * Inclui cálculo de horários disponíveis, conflitos, etc
 */

class AppointmentService {
  /**
   * Lista agendamentos com paginação e filtros
   */
  static async listAll(page = 1, pageSize = 20, filters = {}) {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const { appointments, total } = await AppointmentRepository.findAll(offset, limit, filters);

    return {
      appointments,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Obtém agendamento por ID
   */
  static async getById(id) {
    const appointment = await AppointmentRepository.findById(id);

    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado');
    }

    return appointment;
  }

  /**
   * Obtém agendamentos de um cliente
   */
  static async getByClientId(clientId) {
    const client = await ClientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const appointments = await AppointmentRepository.findByClientId(clientId);

    return {
      clientId,
      appointments,
    };
  }

  /**
   * Obtém agendamentos de um profissional
   */
  static async getByProfessionalId(professionalId) {
    const professional = await ProfessionalRepository.findById(professionalId);
    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    const appointments = await AppointmentRepository.findByProfessionalId(professionalId);

    return {
      professionalId,
      appointments,
    };
  }

  /**
   * Calcula horários disponíveis para agendamento
   * GET /appointments/available?professional_id=&date=&service_id=
   */
  static async getAvailableSlots(professionalId, date, serviceId) {
    // Validações
    if (!professionalId || !date || !serviceId) {
      throw new ValidationError('professional_id, date e service_id são obrigatórios');
    }

    // Verifica se profissional existe
    const professional = await ProfessionalRepository.findById(professionalId);
    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    // Verifica se serviço existe
    const service = await ServiceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    // Valida data
    const appointmentDate = new Date(date);
    if (isNaN(appointmentDate.getTime())) {
      throw new ValidationError('Data inválida (formato: YYYY-MM-DD)');
    }

    // Verifica se data é futura
    const now = new Date();
    if (appointmentDate < now) {
      throw new ValidationError('Data não pode ser no passado');
    }

    // Obtém dia da semana (0 = domingo, 1 = segunda, etc)
    const weekday = appointmentDate.getDay();

    // Obtém horário de trabalho do profissional para este dia
    const schedule = await ScheduleRepository.findByWeekday(professionalId, weekday);
    if (!schedule) {
      throw new NotFoundError('Profissional não trabalha neste dia');
    }

    // Obtém agendamentos existentes para este dia
    const dayStart = new Date(appointmentDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(appointmentDate);
    dayEnd.setHours(23, 59, 59, 999);

    const existingAppointments = await AppointmentRepository.findByPeriod(
      professionalId,
      dayStart.toISOString(),
      dayEnd.toISOString()
    );

    // Calcula horários disponíveis
    const availableSlots = this.calculateAvailableHours(
      schedule,
      existingAppointments,
      service.duration_minutes,
      appointmentDate
    );

    return {
      professionalId,
      serviceId,
      date: date,
      durationMinutes: service.duration_minutes,
      availableSlots,
      totalSlots: availableSlots.length,
    };
  }

  /**
   * Calcula quais horários estão disponíveis
   */
  static calculateAvailableHours(schedule, existingAppointments, serviceDuration, appointmentDate) {
    const slots = [];

    // Parse horários de trabalho
    const [startHour, startMin] = schedule.start_time.split(':').map(Number);
    const [endHour, endMin] = schedule.end_time.split(':').map(Number);

    let breakStart = null;
    let breakEnd = null;
    if (schedule.break_start && schedule.break_end) {
      const [breakStartHour, breakStartMin] = schedule.break_start.split(':').map(Number);
      const [breakEndHour, breakEndMin] = schedule.break_end.split(':').map(Number);
      breakStart = breakStartHour * 60 + breakStartMin;
      breakEnd = breakEndHour * 60 + breakEndMin;
    }

    // Converte appointments existentes para minutos
    const occupiedSlots = existingAppointments.map(apt => {
      const aptDate = new Date(apt.appointment_datetime);
      const minutes = aptDate.getHours() * 60 + aptDate.getMinutes();
      return {
        start: minutes,
        end: minutes + apt.duration_minutes
      };
    });

    // Itera pelos minutos do dia disponível
    let currentMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;

    while (currentMinutes + serviceDuration <= endMinutes) {
      // Pula intervalo de pausa
      if (breakStart && breakEnd && currentMinutes + serviceDuration > breakStart && currentMinutes < breakEnd) {
        currentMinutes = breakEnd;
        continue;
      }

      // Verifica conflato com appointments existentes
      let hasConflict = false;
      for (const occupied of occupiedSlots) {
        if (
          (currentMinutes >= occupied.start && currentMinutes < occupied.end) ||
          (currentMinutes + serviceDuration > occupied.start && currentMinutes < occupied.end)
        ) {
          hasConflict = true;
          currentMinutes = occupied.end;
          break;
        }
      }

      if (!hasConflict) {
        // Encontrou um slot disponível
        const slotDate = new Date(appointmentDate);
        slotDate.setHours(Math.floor(currentMinutes / 60), currentMinutes % 60, 0, 0);

        slots.push({
          time: slotDate.toISOString(),
          timeDisplay: `${String(Math.floor(currentMinutes / 60)).padStart(2, '0')}:${String(currentMinutes % 60).padStart(2, '0')}`,
        });

        currentMinutes += 30; // Incrementa 30 min por slot
      }
    }

    return slots;
  }

  /**
   * Cria novo agendamento
   */
  static async create(clientId, professionalId, serviceId, appointmentDatetime, origin = 'app', notes = null) {
    // Validações
    if (!clientId || !professionalId || !serviceId || !appointmentDatetime) {
      throw new ValidationError('Todos os campos são obrigatórios');
    }

    // Verifica se cliente existe
    const client = await ClientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    if (client.blocked) {
      throw new ValidationError('Cliente está bloqueado e não pode agendar');
    }

    // Verifica se profissional existe
    const professional = await ProfessionalRepository.findById(professionalId);
    if (!professional) {
      throw new NotFoundError('Profissional não encontrado');
    }

    if (!professional.active) {
      throw new ValidationError('Profissional não está disponível');
    }

    // Verifica se serviço existe
    const service = await ServiceRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundError('Serviço não encontrado');
    }

    // Valida data
    const appointmentDate = new Date(appointmentDatetime);
    if (isNaN(appointmentDate.getTime())) {
      throw new ValidationError('Data/hora inválida');
    }

    // Verifica se data é futura
    const now = new Date();
    if (appointmentDate <= now) {
      throw new ValidationError('Agendamento deve ser para uma data/hora futura');
    }

    // Verifica conflitos
    const conflicts = await AppointmentRepository.findConflicts(
      professionalId,
      appointmentDateTime,
      service.duration_minutes
    );

    if (conflicts) {
      throw new ConflictError('Este horário já foi agendado');
    }

    // Cria agendamento
    const appointment = await AppointmentRepository.create(
      clientId,
      professionalId,
      serviceId,
      appointmentDatetime,
      origin,
      notes
    );

    // Emite evento
    await eventEmitter.emit(EVENTS.APPOINTMENT_CREATED, {
      appointmentId: appointment.id,
      clientId,
      professionalId,
      serviceId,
      appointmentDatetime,
      origin,
    });

    return appointment;
  }

  /**
   * Confirma agendamento
   */
  static async confirm(id) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado');
    }

    const updated = await AppointmentRepository.updateStatus(id, 'confirmed');

    return updated;
  }

  /**
   * Marca agendamento como concluído
   */
  static async complete(id) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado');
    }

    const updated = await AppointmentRepository.updateStatus(id, 'completed');

    return updated;
  }

  /**
   * Cancela agendamento
   */
  static async cancel(id, reason = null) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado');
    }

    const updated = await AppointmentRepository.updateStatus(id, 'canceled');

    // Emite evento
    await eventEmitter.emit(EVENTS.APPOINTMENT_CANCELED, {
      appointmentId: id,
      clientId: appointment.client_id,
      reason,
    });

    return updated;
  }

  /**
   * Marca como not show (não compareceu)
   */
  static async markNoShow(id) {
    const appointment = await AppointmentRepository.findById(id);
    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado');
    }

    const updated = await AppointmentRepository.updateStatus(id, 'no_show');

    return updated;
  }
}

module.exports = AppointmentService;

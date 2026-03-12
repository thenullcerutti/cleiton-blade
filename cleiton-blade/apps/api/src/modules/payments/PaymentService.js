const { ValidationError, NotFoundError, ConflictError } = require('../../shared/errors/AppError');
const { getPaginationParams } = require('../../shared/utils/helpers');
const PaymentRepository = require('./PaymentRepository');
const AppointmentRepository = require('../appointments/AppointmentRepository');
const { eventEmitter, EVENTS } = require('../events/EventEmitter');

/**
 * Serviço de pagamentos
 * Lógica de negócio para gerenciar pagamentos
 */

class PaymentService {
  /**
   * Lista pagamentos com paginação
   */
  static async listAll(page = 1, pageSize = 20) {
    const { offset, limit } = getPaginationParams(page, pageSize);

    const { payments, total } = await PaymentRepository.findAll(offset, limit);

    return {
      payments,
      pagination: {
        page,
        pageSize,
        total,
        pages: Math.ceil(total / limit),
      }
    };
  }

  /**
   * Obtém pagamento por ID
   */
  static async getById(id) {
    const payment = await PaymentRepository.findById(id);

    if (!payment) {
      throw new NotFoundError('Pagamento não encontrado');
    }

    return payment;
  }

  /**
   * Obtém pagamento de um agendamento
   */
  static async getByAppointmentId(appointmentId) {
    const appointment = await AppointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado');
    }

    const payment = await PaymentRepository.findByAppointmentId(appointmentId);

    if (!payment) {
      throw new NotFoundError('Pagamento não encontrado para este agendamento');
    }

    return payment;
  }

  /**
   * Cria novo pagamento
   */
  static async create(appointmentId, method, amount = null, transactionId = null, notes = null) {
    // Validações
    if (!appointmentId || !method) {
      throw new ValidationError('agendamento e método são obrigatórios');
    }

    const validMethods = ['pix', 'card', 'cash', 'pending'];
    if (!validMethods.includes(method)) {
      throw new ValidationError(`Método inválido. Válidos: ${validMethods.join(', ')}`);
    }

    // Verifica se agendamento existe
    const appointment = await AppointmentRepository.findById(appointmentId);
    if (!appointment) {
      throw new NotFoundError('Agendamento não encontrado');
    }

    // Se não forneceu amount, usa o preço do serviço
    const paymentAmount = amount || appointment.price;

    if (paymentAmount <= 0) {
      throw new ValidationError('Valor deve ser maior que 0');
    }

    // Verifica se já existe pagamento para este agendamento
    const existing = await PaymentRepository.findByAppointmentId(appointmentId);
    if (existing) {
      throw new ConflictError('Já existe um pagamento para este agendamento');
    }

    // Cria pagamento
    const payment = await PaymentRepository.create(
      appointmentId,
      method,
      paymentAmount,
      transactionId,
      notes
    );

    return payment;
  }

  /**
   * Confirma pagamento
   */
  static async markAsPaid(id, transactionId = null) {
    const payment = await PaymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError('Pagamento não encontrado');
    }

    // Atualiza status do pagamento
    const updated = await PaymentRepository.updateStatus(id, 'paid');

    // Atualiza status do agendamento
    const appointment = await AppointmentRepository.updatePaymentStatus(
      payment.appointment_id,
      'paid'
    );

    // Emite evento
    await eventEmitter.emit(EVENTS.PAYMENT_CONFIRMED, {
      paymentId: id,
      appointmentId: payment.appointment_id,
      amount: payment.amount,
      method: payment.method,
      transactionId,
    });

    return updated;
  }

  /**
   * Marca pagamento como falho
   */
  static async markAsFailed(id, reason = null) {
    const payment = await PaymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError('Pagamento não encontrado');
    }

    const updated = await PaymentRepository.updateStatus(id, 'failed');

    // Emite evento
    await eventEmitter.emit(EVENTS.PAYMENT_FAILED, {
      paymentId: id,
      appointmentId: payment.appointment_id,
      reason,
    });

    return updated;
  }

  /**
   * Reembolsa pagamento
   */
  static async refund(id, reason = null) {
    const payment = await PaymentRepository.findById(id);
    if (!payment) {
      throw new NotFoundError('Pagamento não encontrado');
    }

    if (payment.status !== 'paid') {
      throw new ValidationError('Apenas pagamentos confirmados podem ser reembolsados');
    }

    const updated = await PaymentRepository.updateStatus(id, 'refunded');

    // Atualiza status do agendamento também
    await AppointmentRepository.updatePaymentStatus(
      payment.appointment_id,
      'pending'
    );

    return updated;
  }

  /**
   * Obtém estatísticas de pagamentos
   */
  static async getStats(startDate = null, endDate = null) {
    const stats = await PaymentRepository.getStats(startDate, endDate);

    // stats agora já contém os valores calculados
    return {
      totalPayments: parseInt(stats.total_payments) || 0,
      paidCount: parseInt(stats.paid_count) || 0,
      totalPaid: parseFloat(stats.total_paid) || 0,
      pendingAmount: parseFloat(stats.pending_amount) || 0,
    };
  }
}

module.exports = PaymentService;

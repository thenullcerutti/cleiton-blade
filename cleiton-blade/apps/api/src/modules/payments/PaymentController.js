const { formatSuccess } = require('../../shared/utils/helpers');
const PaymentService = require('./PaymentService');

/**
 * Controller de pagamentos
 * Manipula requisições HTTP relacionadas a pagamentos
 */

class PaymentController {
  /**
   * GET /payments
   * Lista pagamentos
   */
  static async list(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const pageSize = parseInt(req.query.pageSize) || 20;

      const result = await PaymentService.listAll(page, pageSize);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /payments/:id
   * Obtém um pagamento
   */
  static async getById(req, res, next) {
    try {
      const { id } = req.params;

      const payment = await PaymentService.getById(id);

      return res.status(200).json(formatSuccess(payment));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /payments/appointment/:appointmentId
   * Obtém pagamento de um agendamento
   */
  static async getByAppointmentId(req, res, next) {
    try {
      const { appointmentId } = req.params;

      const payment = await PaymentService.getByAppointmentId(appointmentId);

      return res.status(200).json(formatSuccess(payment));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /payments
   * Cria novo pagamento
   */
  static async create(req, res, next) {
    try {
      const { appointmentId, method, amount, transactionId, notes } = req.body;

      const payment = await PaymentService.create(
        appointmentId,
        method,
        amount,
        transactionId,
        notes
      );

      return res.status(201).json(
        formatSuccess(payment, 'Pagamento criado com sucesso')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /payments/:id/confirm
   * Confirma pagamento
   */
  static async markAsPaid(req, res, next) {
    try {
      const { id } = req.params;
      const { transactionId } = req.body;

      const updated = await PaymentService.markAsPaid(id, transactionId);

      return res.status(200).json(
        formatSuccess(updated, 'Pagamento confirmado')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /payments/:id/fail
   * Marca pagamento como falho
   */
  static async markAsFailed(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const updated = await PaymentService.markAsFailed(id, reason);

      return res.status(200).json(
        formatSuccess(updated, 'Pagamento marcado como falho')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /payments/:id/refund
   * Reembolsa pagamento
   */
  static async refund(req, res, next) {
    try {
      const { id } = req.params;
      const { reason } = req.body;

      const updated = await PaymentService.refund(id, reason);

      return res.status(200).json(
        formatSuccess(updated, 'Pagamento reembolsado')
      );
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /payments/stats
   * Obtém estatísticas de pagamentos
   */
  static async getStats(req, res, next) {
    try {
      const { startDate, endDate } = req.query;

      const stats = await PaymentService.getStats(startDate, endDate);

      return res.status(200).json(formatSuccess(stats));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PaymentController;

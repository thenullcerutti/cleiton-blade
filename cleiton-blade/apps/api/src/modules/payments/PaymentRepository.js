const { query } = require('../../config/database');

/**
 * Repositório de pagamentos
 * Operações de banco de dados para pagamentos
 */

class PaymentRepository {
  /**
   * Lista pagamentos
   */
  static async findAll(offset = 0, limit = 20) {
    const sql = `
      SELECT 
        id, appointment_id, method, amount, status,
        transaction_id, notes,
        created_at, updated_at
      FROM payments
      ORDER BY created_at DESC
      OFFSET $1 LIMIT $2
    `;

    const payments = await query(sql, [offset, limit]);
    
    // Contar total sem COUNT (não suportado)
    const countSql = 'SELECT id FROM payments';
    const countResult = await query(countSql);

    return {
      payments: payments.rows,
      total: (countResult.rows || []).length
    };
  }

  /**
   * Busca pagamento por ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        id, appointment_id, method, amount, status,
        transaction_id, notes,
        created_at, updated_at
      FROM payments
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca pagamento por agendamento
   */
  static async findByAppointmentId(appointmentId) {
    const sql = `
      SELECT 
        id, appointment_id, method, amount, status,
        transaction_id, notes,
        created_at, updated_at
      FROM payments
      WHERE appointment_id = $1;
    `;

    const result = await query(sql, [appointmentId]);
    return result.rows[0] || null;
  }

  /**
   * Cria novo pagamento
   */
  static async create(appointmentId, method, amount, transactionId = null, notes = null) {
    const sql = `
      INSERT INTO payments (appointment_id, method, amount, status, transaction_id, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, appointment_id, method, amount, status, transaction_id, notes, created_at, updated_at;
    `;

    const result = await query(sql, [
      appointmentId,
      method,
      amount,
      'pending',
      transactionId,
      notes
    ]);

    return result.rows[0];
  }

  /**
   * Atualiza status de pagamento
   */
  static async updateStatus(id, status) {
    const sql = `
      UPDATE payments
      SET status = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING id, appointment_id, method, amount, status, transaction_id, notes, created_at, updated_at;
    `;

    const result = await query(sql, [status, id]);
    return result.rows[0];
  }

  /**
   * Atualiza detalhes de pagamento
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.transactionId) {
      fields.push(`transaction_id = $${paramCount++}`);
      values.push(data.transactionId);
    }

    if (data.notes) {
      fields.push(`notes = $${paramCount++}`);
      values.push(data.notes);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE payments
      SET ${fields.join(', ')}
      WHERE id = $${paramCount};
    `;

    const result = await query(sql, values);
    return result.rows[0] || null;
  }

  /**
   * Obtém estatísticas de pagamentos
   */
  static async getStats(startDate = null, endDate = null) {
    let sql = `
      SELECT 
        id, status, amount, created_at
      FROM payments
    `;

    const params = [];

    if (startDate && endDate) {
      sql += ' WHERE created_at >= $1 AND created_at <= $2';
      params.push(startDate, endDate);
    }

    const result = await query(sql, params);
    const payments = result.rows || [];

    // Calcular estatísticas em memory
    const stats = {
      total_payments: payments.length,
      paid_count: payments.filter(p => p.status === 'paid').length,
      total_paid: payments.filter(p => p.status === 'paid').reduce((sum, p) => sum + (p.amount || 0), 0),
      pending_amount: payments.filter(p => p.status === 'pending').reduce((sum, p) => sum + (p.amount || 0), 0)
    };

    return stats;
  }
}

module.exports = PaymentRepository;

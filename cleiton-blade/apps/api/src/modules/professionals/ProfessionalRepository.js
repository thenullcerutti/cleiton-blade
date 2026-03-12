const { query } = require('../../config/database');

/**
 * Repositório de profissionais
 * Operações de banco de dados relacionadas a profissionais
 */

class ProfessionalRepository {
  /**
   * Lista todos os profissionais
   */
  static async findAll(offset = 0, limit = 20) {
    const sql = `
      SELECT 
        id, user_id, name, commission_percentage, active,
        created_at, updated_at
      FROM professionals
      WHERE active = true
      ORDER BY created_at DESC
      OFFSET $1 LIMIT $2
    `;

    const professionals = await query(sql, [offset, limit]);
    
    // Contar total sem COUNT (não suportado)
    const countSql = 'SELECT id FROM professionals WHERE active = true';
    const countResult = await query(countSql, []);

    return {
      professionals: professionals.rows,
      total: (countResult.rows || []).length
    };
  }

  /**
   * Busca profissional por ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        id, user_id, name, commission_percentage, active,
        created_at, updated_at
      FROM professionals
      WHERE id = $1
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Busca profissional por user_id
   */
  static async findByUserId(userId) {
    const sql = `
      SELECT 
        p.id, p.user_id, p.name, p.commission_percentage, p.active,
        u.email, p.created_at, p.updated_at
      FROM professionals p
      JOIN users u ON p.user_id = u.id
      WHERE p.user_id = $1;
    `;

    const result = await query(sql, [userId]);
    return result.rows[0] || null;
  }

  /**
   * Cria novo profissional
   */
  static async create(userId, name, commissionPercentage = 0) {
    const sql = `
      INSERT INTO professionals (user_id, name, commission_percentage, active, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, user_id, name, commission_percentage, active, created_at, updated_at;
    `;

    const result = await query(sql, [
      userId,
      name,
      commissionPercentage,
      true
    ]);

    return result.rows[0];
  }

  /**
   * Atualiza profissional
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.name) {
      fields.push(`name = $${paramCount++}`);
      values.push(data.name);
    }

    if (typeof data.commissionPercentage !== 'undefined') {
      fields.push(`commission_percentage = $${paramCount++}`);
      values.push(data.commissionPercentage);
    }

    if (typeof data.active !== 'undefined') {
      fields.push(`active = $${paramCount++}`);
      values.push(data.active ? true : false);
    }

    if (fields.length === 0) {
      return null;
    }

    fields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const sql = `
      UPDATE professionals
      SET ${fields.join(', ')}
      WHERE id = $${paramCount};
    `;

    await query(sql, values);
    return this.findById(id);
  }

  /**
   * Ativa/desativa profissional
   */
  static async toggleActive(id, active) {
    const sql = `
      UPDATE professionals
      SET active = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2;
    `;

    await query(sql, [active ? true : false, id]);
    return this.findById(id);
  }

  /**
   * Obtém horários de um profissional
   */
  static async getSchedules(professionalId) {
    const sql = `
      SELECT id, professional_id, weekday, start_time, end_time, break_start, break_end
      FROM schedules
      WHERE professional_id = $1
      ORDER BY weekday ASC;
    `;

    const result = await query(sql, [professionalId]);
    return result.rows;
  }

  /**
   * Obtém agendamentos de um profissional
   */
  static async getAppointments(professionalId, status = null) {
    let sql = `
      SELECT 
        a.id, a.client_id, a.professional_id, a.service_id,
        a.appointment_datetime, a.status, a.origin,
        c.name as client_name, s.name as service_name
      FROM appointments a
      JOIN clients c ON a.client_id = c.id
      JOIN services s ON a.service_id = s.id
      WHERE a.professional_id = $1
    `;

    const params = [professionalId];

    if (status) {
      sql += ` AND a.status = $2`;
      params.push(status);
    }

    sql += ' ORDER BY a.appointment_datetime DESC;';

    const result = await query(sql, params);
    return result.rows;
  }
}

module.exports = ProfessionalRepository;

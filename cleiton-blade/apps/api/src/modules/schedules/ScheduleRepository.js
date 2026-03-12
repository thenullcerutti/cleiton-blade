const { query } = require('../../config/database');

/**
 * Repositório de agendas (horários de trabalho)
 * Operações de banco de dados para agendas de profissionais
 */

class ScheduleRepository {
  /**
   * Lista agendas de um profissional
   */
  static async findByProfessionalId(professionalId) {
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
   * Busca agenda para um dia específico
   */
  static async findByWeekday(professionalId, weekday) {
    const sql = `
      SELECT id, professional_id, weekday, start_time, end_time, break_start, break_end
      FROM schedules
      WHERE professional_id = $1 AND weekday = $2;
    `;

    const result = await query(sql, [professionalId, weekday]);
    return result.rows[0] || null;
  }

  /**
   * Cria nova agenda
   */
  static async create(professionalId, weekday, startTime, endTime, breakStart = null, breakEnd = null) {
    const sql = `
      INSERT INTO schedules (professional_id, weekday, start_time, end_time, break_start, break_end, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
      RETURNING id, professional_id, weekday, start_time, end_time, break_start, break_end;
    `;

    const result = await query(sql, [
      professionalId,
      weekday,
      startTime,
      endTime,
      breakStart,
      breakEnd
    ]);

    return result.rows;
  }

  /**
   * Atualiza agenda
   */
  static async update(id, data) {
    const fields = [];
    const values = [];
    let paramCount = 1;

    if (data.startTime) {
      fields.push(`start_time = $${paramCount++}`);
      values.push(data.startTime);
    }

    if (data.endTime) {
      fields.push(`end_time = $${paramCount++}`);
      values.push(data.endTime);
    }

    if (data.breakStart !== undefined) {
      fields.push(`break_start = $${paramCount++}`);
      values.push(data.breakStart);
    }

    if (data.breakEnd !== undefined) {
      fields.push(`break_end = $${paramCount++}`);
      values.push(data.breakEnd);
    }

    if (fields.length === 0) {
      return null;
    }

    values.push(id);

    const sql = `
      UPDATE schedules
      SET ${fields.join(', ')}
      WHERE id = $${paramCount};
    `;

    await query(sql, values);
    const schedules = await this.findByProfessionalId(data.professionalId);
    return schedules.find(s => s.id === id) || null;
  }

  /**
   * Deleta agenda
   */
  static async delete(id) {
    const sql = 'DELETE FROM schedules WHERE id = $1;';
    await query(sql, [id]);
  }

  /**
   * Verifica se existe agenda para profissional e dia
   */
  static async existsForWeekday(professionalId, weekday) {
    const sql = `
      SELECT id FROM schedules
      WHERE professional_id = $1 AND weekday = $2;
    `;

    const result = await query(sql, [professionalId, weekday]);
    return result.rows.length > 0;
  }
}

module.exports = ScheduleRepository;

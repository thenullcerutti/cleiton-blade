/**
 * Repository para horários de trabalho (working_hours)
 */

const { query } = require('../../config/database');

class WorkingHoursRepository {
  /**
   * Listah orários de trabalho de um profissional
   */
  static async getByProfessional(professionalId) {
    const sql = `
      SELECT *
      FROM working_hours
      WHERE user_id = $1
      ORDER BY day_of_week ASC
    `;
    const result = await query(sql, [professionalId]);
    return result.rows || [];
  }

  /**
   * Obter horário específico de um dia
   */
  static async getByDayOfWeek(professionalId, dayOfWeek) {
    const sql = `
      SELECT *
      FROM working_hours
      WHERE user_id = $1 AND day_of_week = $2
    `;
    const result = await query(sql, [professionalId, dayOfWeek]);
    return result.rows[0] || null;
  }

  /**
   * Criar novo horário de trabalho
   */
  static async create(professionalId, dayOfWeek, startTime, endTime) {
    const sql = `
      INSERT INTO working_hours (user_id, day_of_week, start_time, end_time, is_active)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `;
    const result = await query(sql, [professionalId, dayOfWeek, startTime, endTime]);
    return result.rows[0];
  }

  /**
   * Atualizar horário de trabalho
   */
  static async update(id, startTime, endTime, isActive) {
    const sql = `
      UPDATE working_hours
      SET start_time = $2, end_time = $3, is_active = $4, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, startTime, endTime, isActive]);
    return result.rows[0];
  }

  /**
   * Deletar horário de trabalho
   */
  static async delete(id) {
    const sql = `DELETE FROM working_hours WHERE id = $1`;
    await query(sql, [id]);
  }

  /**
   * Habilitar/desabilitar horário
   */
  static async toggleActive(id, isActive) {
    const sql = `
      UPDATE working_hours
      SET is_active = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, isActive]);
    return result.rows[0];
  }
}

module.exports = WorkingHoursRepository;

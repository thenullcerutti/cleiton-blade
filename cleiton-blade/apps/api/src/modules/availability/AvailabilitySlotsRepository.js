/**
 * Repository para slots de disponibilidade
 */

const { query } = require('../../config/database');

class AvailabilitySlotsRepository {
  /**
   * Obter slots de uma data específica (admin view)
   */
  static async getByDateAndProfessional(professionalId, date) {
    const sql = `
      SELECT *
      FROM availability_slots
      WHERE professional_id = $1 
        AND DATE(date_time) = DATE($2)
      ORDER BY date_time ASC
    `;
    const result = await query(sql, [professionalId, date]);
    return result.rows || [];
  }

  /**
   * Obter slots disponíveis para um intervalo de datas
   */
  static async getAvailableSlots(professionalId, startDate, endDate) {
    const sql = `
      SELECT *
      FROM availability_slots
      WHERE professional_id = $1 
        AND date_time >= $2
        AND date_time < $3
        AND status = 'available'
      ORDER BY date_time ASC
    `;
    const result = await query(sql, [professionalId, startDate, endDate]);
    return result.rows || [];
  }

  /**
   * Criar novo slot
   */
  static async create(professionalId, dateTime, durationMinutes, status = 'available') {
    const sql = `
      INSERT INTO availability_slots (professional_id, date_time, duration_minutes, status)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await query(sql, [professionalId, dateTime, durationMinutes, status]);
    return result.rows[0];
  }

  /**
   * Atualizar status do slot
   */
  static async updateStatus(id, status, blockedReason = null) {
    const sql = `
      UPDATE availability_slots
      SET status = $2, blocked_reason = $3, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, status, blockedReason]);
    return result.rows[0];
  }

  /**
   * Bloquear/desbloquear slot
   */
  static async blockSlot(id, blockedReason) {
    return this.updateStatus(id, 'blocked', blockedReason);
  }

  static async unblockSlot(id) {
    return this.updateStatus(id, 'available', null);
  }

  /**
   * Marcar slot como reservado
   */
  static async bookSlot(id, appointmentId) {
    const sql = `
      UPDATE availability_slots
      SET status = 'booked', appointment_id = $2, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      RETURNING *
    `;
    const result = await query(sql, [id, appointmentId]);
    return result.rows[0];
  }

  /**
   * Deletar slot
   */
  static async delete(id) {
    const sql = `DELETE FROM availability_slots WHERE id = $1`;
    await query(sql, [id]);
  }

  /**
   * Deletar slots de uma data inteira
   */
  static async deleteByDate(professionalId, date) {
    const sql = `
      DELETE FROM availability_slots
      WHERE professional_id = $1 AND DATE(date_time) = DATE($2)
    `;
    await query(sql, [professionalId, date]);
  }

  /**
   * Obter um slot específico
   */
  static async getById(id) {
    const sql = `SELECT * FROM availability_slots WHERE id = $1`;
    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }
}

module.exports = AvailabilitySlotsRepository;

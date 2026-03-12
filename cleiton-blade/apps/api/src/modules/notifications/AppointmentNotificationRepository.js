/**
 * Repository para notificações de agendamento
 * Gerencia o registro e rastreamento de notificações enviadas
 */

const { query } = require('../../config/database');

class AppointmentNotificationRepository {
  /**
   * Criar registro de notificação
   */
  static async create(appointmentId, clientId, sendType, scheduledFor) {
    const result = await query(`
      INSERT INTO appointment_notifications (appointment_id, client_id, send_type, scheduled_for, delivery_status)
      VALUES ($1, $2, $3, $4, 'pending')
      RETURNING *
    `, [appointmentId, clientId, sendType, scheduledFor]);

    return result[0];
  }

  /**
   * Obter notificações pendentes para enviar
   */
  static async getPendingNotifications(beforeTime = new Date()) {
    return query(`
      SELECT 
        an.*,
        a.client_name,
        a.client_phone,
        a.client_email,
        a.appointment_datetime,
        s.name as service_name
      FROM appointment_notifications an
      JOIN appointments a ON an.appointment_id = a.id
      JOIN services s ON a.service_id = s.id
      WHERE an.delivery_status = 'pending'
      AND an.scheduled_for <= $1
      ORDER BY an.scheduled_for ASC
    `, [beforeTime.toISOString()]);
  }

  /**
   * Atualizar status de notificação
   */
  static async updateStatus(notificationId, status, sentVia = null, failureReason = null) {
    const updates = {};
    updates.delivery_status = status;
    updates.updated_at = new Date().toISOString();

    if (status === 'sent') {
      updates.sent_at = new Date().toISOString();
      updates.sent_via = sentVia || null;
    }

    if (status === 'failed' && failureReason) {
      updates.failure_reason = failureReason;
    }

    let sql = `UPDATE appointment_notifications SET `;
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (paramCount > 1) sql += ', ';
      sql += `${key} = $${paramCount++}`;
      values.push(value);
    }

    sql += ` WHERE id = $${paramCount} RETURNING *`;
    values.push(notificationId);

    const result = await query(sql, values);
    return result[0];
  }

  /**
   * Obter notificações de um agendamento
   */
  static async getByAppointmentId(appointmentId) {
    return query(`
      SELECT * FROM appointment_notifications
      WHERE appointment_id = $1
      ORDER BY scheduled_for DESC
    `, [appointmentId]);
  }

  /**
   * Obter notificações de um cliente
   */
  static async getByClientId(clientId, limit = 50) {
    return query(`
      SELECT 
        an.*,
        a.appointment_datetime,
        a.status as appointment_status,
        s.name as service_name
      FROM appointment_notifications an
      JOIN appointments a ON an.appointment_id = a.id
      JOIN services s ON a.service_id = s.id
      WHERE an.client_id = $1
      ORDER BY an.scheduled_for DESC
      LIMIT $2
    `, [clientId, limit]);
  }

  /**
   * Verificar se notificação já foi agendada
   */
  static async exists(appointmentId, sendType) {
    const result = await query(`
      SELECT id FROM appointment_notifications
      WHERE appointment_id = $1 AND send_type = $2
      LIMIT 1
    `, [appointmentId, sendType]);

    return result.length > 0;
  }

  /**
   * Deletar notificação
   */
  static async delete(notificationId) {
    return query(`
      DELETE FROM appointment_notifications
      WHERE id = $1
      RETURNING *
    `, [notificationId]);
  }

  /**
   * Deletar notificações de um agendamento
   */
  static async deleteByAppointmentId(appointmentId) {
    return query(`
      DELETE FROM appointment_notifications
      WHERE appointment_id = $1
      RETURNING *
    `, [appointmentId]);
  }

  /**
   * Obter estatísticas de notificações
   */
  static async getStats(clientId, startDate, endDate) {
    const stats = await query(`
      SELECT 
        delivery_status,
        COUNT(*) as count
      FROM appointment_notifications
      WHERE client_id = $1
      AND scheduled_for >= $2
      AND scheduled_for <= $3
      GROUP BY delivery_status
    `, [clientId, startDate.toISOString(), endDate.toISOString()]);

    const formatted = {
      pending: 0,
      sent: 0,
      failed: 0,
      skipped: 0,
      total: 0
    };

    stats.forEach(s => {
      const status = s.delivery_status || 'pending';
      formatted[status] = parseInt(s.count);
      formatted.total += parseInt(s.count);
    });

    return formatted;
  }
}

module.exports = AppointmentNotificationRepository;

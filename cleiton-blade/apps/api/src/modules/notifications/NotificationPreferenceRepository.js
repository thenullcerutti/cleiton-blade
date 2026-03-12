/**
 * Repository para preferências de notificação do cliente
 */

const { query } = require('../../config/database');

class NotificationPreferenceRepository {
  /**
   * Obter preferências de notificação de um cliente
   */
  static async getByClientId(clientId) {
    const result = await query(
      `SELECT * FROM notification_preferences WHERE client_id = $1`,
      [clientId]
    );

    // Se não existir, criar com valores padrão
    if (result.length === 0) {
      return this.create(clientId);
    }

    return result[0];
  }

  /**
   * Criar preferências de notificação padrão
   */
  static async create(clientId) {
    const result = await query(`
      INSERT INTO notification_preferences 
      (client_id, whatsapp_enabled, email_enabled, sms_enabled, morning_reminder_enabled, one_hour_before_enabled)
      VALUES ($1, true, true, false, true, true)
      RETURNING *
    `, [clientId]);

    return result[0];
  }

  /**
   * Atualizar preferências de notificação
   */
  static async update(clientId, preferences) {
    const updates = {
      updated_at: new Date().toISOString()
    };

    if (preferences.whatsapp_enabled !== undefined) {
      updates.whatsapp_enabled = preferences.whatsapp_enabled;
    }
    if (preferences.email_enabled !== undefined) {
      updates.email_enabled = preferences.email_enabled;
    }
    if (preferences.sms_enabled !== undefined) {
      updates.sms_enabled = preferences.sms_enabled;
    }
    if (preferences.morning_reminder_enabled !== undefined) {
      updates.morning_reminder_enabled = preferences.morning_reminder_enabled;
    }
    if (preferences.one_hour_before_enabled !== undefined) {
      updates.one_hour_before_enabled = preferences.one_hour_before_enabled;
    }
    if (preferences.quiet_hours_start !== undefined) {
      updates.quiet_hours_start = preferences.quiet_hours_start;
    }
    if (preferences.quiet_hours_end !== undefined) {
      updates.quiet_hours_end = preferences.quiet_hours_end;
    }

    let sql = `UPDATE notification_preferences SET `;
    const values = [];
    let paramCount = 1;

    for (const [key, value] of Object.entries(updates)) {
      if (paramCount > 1) sql += ', ';
      sql += `${key} = $${paramCount++}`;
      values.push(value);
    }

    sql += ` WHERE client_id = $${paramCount} RETURNING *`;
    values.push(clientId);

    const result = await query(sql, values);
    return result[0];
  }

  /**
   * Habilitar/desabilitar notificações por canal
   */
  static async toggleChannel(clientId, channel, enabled) {
    const channelMap = {
      whatsapp: 'whatsapp_enabled',
      email: 'email_enabled',
      sms: 'sms_enabled'
    };

    if (!channelMap[channel]) {
      throw new Error(`Canal inválido: ${channel}`);
    }

    const result = await query(`
      UPDATE notification_preferences SET ${channelMap[channel]} = $1, updated_at = $2
      WHERE client_id = $3
      RETURNING *
    `, [enabled, new Date().toISOString(), clientId]);

    return result[0];
  }

  /**
   * Habilitar/desabilitar reminders
   */
  static async toggleReminder(clientId, reminderType, enabled) {
    const reminderMap = {
      morning: 'morning_reminder_enabled',
      one_hour_before: 'one_hour_before_enabled'
    };

    if (!reminderMap[reminderType]) {
      throw new Error(`Tipo de lembrete inválido: ${reminderType}`);
    }

    const result = await query(`
      UPDATE notification_preferences SET ${reminderMap[reminderType]} = $1, updated_at = $2
      WHERE client_id = $3
      RETURNING *
    `, [enabled, new Date().toISOString(), clientId]);

    return result[0];
  }

  /**
   * Definir horas silenciosas (não enviar notificações neste período)
   */
  static async setQuietHours(clientId, startTime, endTime) {
    const result = await query(`
      UPDATE notification_preferences SET quiet_hours_start = $1, quiet_hours_end = $2, updated_at = $3
      WHERE client_id = $4
      RETURNING *
    `, [startTime, endTime, new Date().toISOString(), clientId]);

    return result[0];
  }

  /**
   * Verificar se está em horários silenciosos
   */
  static async isInQuietHours(clientId) {
    const preferences = await this.getByClientId(clientId);

    if (!preferences.quiet_hours_start || !preferences.quiet_hours_end) {
      return false;
    }

    const now = new Date();
    const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS

    return currentTime >= preferences.quiet_hours_start && currentTime <= preferences.quiet_hours_end;
  }
}

module.exports = NotificationPreferenceRepository;

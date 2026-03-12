const { query } = require('../../config/database');

/**
 * Sistema de eventos interno
 * Permite emitir eventos que são registrados no banco e podem ser processados por filas
 */

class EventEmitter {
  constructor() {
    this.listeners = {};
  }

  /**
   * Registra um listener para um evento específico
   * Permite integração com sistemas de fila no futuro
   */
  on(eventType, callback) {
    if (!this.listeners[eventType]) {
      this.listeners[eventType] = [];
    }
    this.listeners[eventType].push(callback);
  }

  /**
   * Remove um listener
   */
  off(eventType, callback) {
    if (this.listeners[eventType]) {
      this.listeners[eventType] = this.listeners[eventType].filter(cb => cb !== callback);
    }
  }

  /**
   * Emite um evento - registra no banco e chama listeners
   * @param {string} eventType - Tipo do evento
   * @param {Object} payload - Dados do evento
   */
  async emit(eventType, payload = {}) {
    try {
      // Registra no banco de dados
      const eventLogSql = `
        INSERT INTO events_log (event_type, payload, status)
        VALUES ($1, $2, $3)
        RETURNING id;
      `;

      await query(eventLogSql, [
        eventType,
        JSON.stringify(payload),
        'pending'
      ]);

      // Chama listeners em memória (para processamento imediato)
      if (this.listeners[eventType]) {
        for (const callback of this.listeners[eventType]) {
          try {
            callback(payload);
          } catch (error) {
            console.error(`Erro ao executar listener para ${eventType}:`, error);
          }
        }
      }

      console.log(`📤 Evento emitido: ${eventType}`);
      return true;
    } catch (error) {
      console.error(`Erro ao emitir evento ${eventType}:`, error);
      throw error;
    }
  }

  /**
   * Obtém eventos not processados
   */
  async getUnprocessedEvents(limit = 100) {
    const sql = `
      SELECT * FROM events_log
      WHERE status = 'pending'
      ORDER BY created_at ASC
      LIMIT $1;
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }

  /**
   * Marca evento como processado
   */
  async markAsProcessed(eventId) {
    const sql = `
      UPDATE events_log
      SET status = 'processed', processed_at = CURRENT_TIMESTAMP
      WHERE id = $1;
    `;

    await query(sql, [eventId]);
  }

  /**
   * Marca evento como falho
   */
  async markAsFailed(eventId, error) {
    const sql = `
      UPDATE events_log
      SET 
        status = 'failed',
        retry_count = retry_count + 1,
        last_error = $2
      WHERE id = $1;
    `;

    await query(sql, [eventId, error.message]);
  }
}

// Instância singleton do event emitter
const eventEmitter = new EventEmitter();

// Eventos obrigatórios
const EVENTS = {
  APPOINTMENT_CREATED: 'APPOINTMENT_CREATED',
  APPOINTMENT_UPDATED: 'APPOINTMENT_UPDATED',
  APPOINTMENT_CANCELED: 'APPOINTMENT_CANCELED',
  APPOINTMENT_COMPLETED: 'APPOINTMENT_COMPLETED',
  PAYMENT_CONFIRMED: 'PAYMENT_CONFIRMED',
  PAYMENT_FAILED: 'PAYMENT_FAILED',
  CLIENT_CREATED: 'CLIENT_CREATED',
  PROFESSIONAL_CREATED: 'PROFESSIONAL_CREATED',
  WHATSAPP_MESSAGE_RECEIVED: 'WHATSAPP_MESSAGE_RECEIVED',
};

module.exports = {
  eventEmitter,
  EVENTS,
};

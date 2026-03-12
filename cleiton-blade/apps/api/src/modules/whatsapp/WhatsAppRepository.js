const { query } = require('../../config/database');

/**
 * Repositório de mensagens WhatsApp
 * Armazena histórico de mensagens do WhatsApp
 */

class WhatsAppRepository {
  /**
   * Lista mensagens de um cliente
   */
  static async findByClientId(clientId, limit = 50) {
    const sql = `
      SELECT 
        id, client_id, direction, message_body, message_type,
        timestamp, conversation_id, processed
      FROM whatsapp_messages
      WHERE client_id = $1
      ORDER BY timestamp DESC
      LIMIT $2;
    `;

    const result = await query(sql, [clientId, limit]);
    return result.rows;
  }

  /**
   * Busca mensagem por ID
   */
  static async findById(id) {
    const sql = `
      SELECT 
        id, client_id, direction, message_body, message_type,
        timestamp, conversation_id, whatsapp_message_id, processed
      FROM whatsapp_messages
      WHERE id = $1;
    `;

    const result = await query(sql, [id]);
    return result.rows[0] || null;
  }

  /**
   * Registra mensagem entrante
   */
  static async storeIncomingMessage(clientId, messageBody, whatsappMessageId, conversationId, messageType = 'text') {
    const sql = `
      INSERT INTO whatsapp_messages 
      (client_id, direction, message_body, message_type, whatsapp_message_id, conversation_id, processed, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING id, client_id, direction, message_body, message_type, whatsapp_message_id, conversation_id, processed, timestamp;
    `;

    const result = await query(sql, [
      clientId,
      'incoming',
      messageBody,
      messageType,
      whatsappMessageId,
      conversationId,
      false
    ]);

    return result.rows[0];
  }

  /**
   * Registra mensagem outgoing
   */
  static async storeOutgoingMessage(clientId, messageBody, whatsappMessageId = null, conversationId = null) {
    const sql = `
      INSERT INTO whatsapp_messages 
      (client_id, direction, message_body, message_type, whatsapp_message_id, conversation_id, processed, timestamp)
      VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)
      RETURNING id, client_id, direction, message_body, message_type, whatsapp_message_id, conversation_id, processed, timestamp;
    `;

    const result = await query(sql, [
      clientId,
      'outgoing',
      messageBody,
      'text',
      whatsappMessageId,
      conversationId,
      true
    ]);

    return result.rows[0];
  }

  /**
   * Marca mensagem como processada
   */
  static async markAsProcessed(messageId) {
    const sql = `
      UPDATE whatsapp_messages
      SET processed = true
      WHERE id = $1;
    `;

    await query(sql, [messageId]);
  }

  /**
   * Busca conversas não processadas
   */
  static async findUnprocessedMessages(limit = 100) {
    const sql = `
      SELECT 
        id, client_id, direction, message_body,
        conversation_id, whatsapp_message_id
      FROM whatsapp_messages
      WHERE processed = false AND direction = 'incoming'
      ORDER BY timestamp ASC
      LIMIT $1;
    `;

    const result = await query(sql, [limit]);
    return result.rows;
  }
}

module.exports = WhatsAppRepository;

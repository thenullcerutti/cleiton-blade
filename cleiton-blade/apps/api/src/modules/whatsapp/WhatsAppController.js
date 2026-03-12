const { formatSuccess, formatError } = require('../../shared/utils/helpers');
const WhatsAppService = require('./WhatsAppService');

/**
 * Controller para WhatsApp
 * Gerencia webhooks e interações com WhatsApp Business API
 */

class WhatsAppController {
  /**
   * GET /whatsapp/webhook
   * Verificação de webhook do WhatsApp (hub.verify)
   */
  static async verifyWebhook(req, res, next) {
    try {
      const { 'hub.mode': mode, 'hub.verify_token': token, 'hub.challenge': challenge } = req.query;

      if (mode !== 'subscribe') {
        return res.status(400).json(
          formatError('Modo inválido', 'INVALID_MODE')
        );
      }

      const isValid = WhatsAppService.verifyWebhookToken(token);

      if (!isValid) {
        return res.status(403).json(
          formatError('Token inválido', 'INVALID_TOKEN')
        );
      }

      // Retorna o challenge para confirmação
      res.status(200).send(challenge);
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /whatsapp/webhook
   * Recebe mensagens do WhatsApp
   */
  static async handleWebhook(req, res, next) {
    try {
      const result = await WhatsAppService.processWebhook(req.body);

      // Responde imediatamente com 200 OK
      res.status(200).json(result);

      // Processamento assíncrono continua em background
    } catch (error) {
      // Log o erro mas ainda retorna 200 para WhatsApp não reenviar
      console.error('Erro ao processar webhook WhatsApp:', error);
      res.status(200).json({ success: true, processed: 0 });
    }
  }

  /**
   * GET /whatsapp/conversation/:clientId
   * Obtém histórico de conversação com um cliente
   */
  static async getConversation(req, res, next) {
    try {
      const { clientId } = req.params;
      const { limit } = req.query;

      const conversation = await WhatsAppService.getConversationHistory(
        clientId,
        limit ? parseInt(limit) : 50
      );

      return res.status(200).json(formatSuccess(conversation));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /whatsapp/send
   * Envia mensagem para um cliente
   */
  static async sendMessage(req, res, next) {
    try {
      const { clientId, message } = req.body;

      if (!clientId || !message) {
        return res.status(400).json(
          formatError('clientId e message são obrigatórios', 'MISSING_FIELDS')
        );
      }

      const result = await WhatsAppService.sendMessage(clientId, message);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /whatsapp/process-scheduling
   * Processa solicitação de agendamento via mensagem
   */
  static async processSchedulingRequest(req, res, next) {
    try {
      const { clientId, message } = req.body;

      if (!clientId || !message) {
        return res.status(400).json(
          formatError('clientId e message são obrigatórios', 'MISSING_FIELDS')
        );
      }

      const result = await WhatsAppService.processSchedulingRequest(clientId, message);

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /whatsapp/unprocessed
   * Obtém mensagens não processadas
   */
  static async getUnprocessedMessages(req, res, next) {
    try {
      const { limit } = req.query;

      const result = await WhatsAppService.getUnprocessedMessages(
        limit ? parseInt(limit) : 100
      );

      return res.status(200).json(formatSuccess(result));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = WhatsAppController;

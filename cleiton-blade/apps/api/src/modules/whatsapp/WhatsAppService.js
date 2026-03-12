const { ValidationError, NotFoundError } = require('../../shared/errors/AppError');
const WhatsAppRepository = require('./WhatsAppRepository');
const ClientRepository = require('../clients/ClientRepository');
const AppointmentService = require('../appointments/AppointmentService');
const { eventEmitter, EVENTS } = require('../events/EventEmitter');

/**
 * Serviço WhatsApp
 * Preparado para integração com WhatsApp Business API
 * Estrutura para webhook, recebimento de mensagens, agendamento via WhatsApp
 */

class WhatsAppService {
  /**
   * Processa webhook de entrada (verificação e mensagens)
   * Chamado por POST /whatsapp/webhook
   */
  static async processWebhook(body) {
    const { object, entry } = body;

    if (object !== 'whatsapp_business_account') {
      throw new ValidationError('Webhook inválido');
    }

    if (!entry || entry.length === 0) {
      return { success: true, message: 'Sem dados a processar' };
    }

    const results = [];

    for (const entryData of entry) {
      if (entryData.changes) {
        for (const change of entryData.changes) {
          if (change.field === 'messages') {
            const result = await this.handleIncomingMessage(change.value);
            results.push(result);
          }
        }
      }
    }

    return { success: true, processedMessages: results.length };
  }

  /**
   * Processa mensagem entrante
   */
  static async handleIncomingMessage(messageData) {
    try {
      const { messages, contacts } = messageData;

      if (!messages || messages.length === 0) {
        return { status: 'skip', reason: 'Sem mensagens' };
      }

      const message = messages[0];
      const contact = contacts ? contacts[0] : null;

      const phoneNumber = message.from;
      const messageId = message.id;
      const timestamp = new Date(parseInt(message.timestamp) * 1000);
      const conversationId = `${phoneNumber}-${contact?.wa_id || phoneNumber}`;

      // Tenta encontrar ou criar cliente
      let client = await ClientRepository.findByPhone(phoneNumber);

      if (!client) {
        // Cria novo cliente automaticamente ao receber primeira mensagem
        const clientName = contact?.profile?.name || `Cliente ${phoneNumber}`;
        client = await ClientRepository.create(clientName, phoneNumber);
      }

      // Extrai conteúdo da mensagem
      let messageBody = '';
      let messageType = 'text';

      if (message.type === 'text') {
        messageBody = message.text.body;
        messageType = 'text';
      } else if (message.type === 'image') {
        messageBody = message.image?.caption || '[Imagem recebida]';
        messageType = 'image';
      } else if (message.type === 'document') {
        messageBody = `[Documento: ${message.document?.filename || message.document?.id}]`;
        messageType = 'document';
      } else if (message.type === 'location') {
        messageBody = `[Localização: ${message.location?.latitude}°, ${message.location?.longitude}°]`;
        messageType = 'location';
      }

      // Armazena mensagem
      const storedMessage = await WhatsAppRepository.storeIncomingMessage(
        client.id,
        messageBody,
        messageId,
        conversationId,
        messageType
      );

      // Emite evento
      await eventEmitter.emit(EVENTS.WHATSAPP_MESSAGE_RECEIVED, {
        messageId: storedMessage.id,
        clientId: client.id,
        phoneNumber,
        messageBody,
        messageType,
        timestamp,
      });

      // Processa mensagem (análise de intenção, resposta automática, etc)
      // Por enquanto, apenas registra
      await WhatsAppRepository.markAsProcessed(storedMessage.id);

      return {
        status: 'success',
        messageId: storedMessage.id,
        clientId: client.id,
        body: messageBody,
      };
    } catch (error) {
      console.error('Erro ao processar mensagem WhatsApp:', error);
      return { status: 'error', error: error.message };
    }
  }

  /**
   * Verifica webhook token (GET /whatsapp/webhook)
   * Parte da verificação inicial do webhook do WhatsApp
   */
  static verifyWebhookToken(token) {
    const config = require('../../config/env');
    const expectedToken = config.whatsapp.webhookVerifyToken;

    if (!expectedToken) {
      throw new ValidationError('Webhook not configured');
    }

    return token === expectedToken;
  }

  /**
   * Busca histórico de conversas de um cliente
   */
  static async getConversationHistory(clientId, limit = 50) {
    const client = await ClientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    const messages = await WhatsAppRepository.findByClientId(clientId, limit);

    return {
      clientId,
      clientPhone: client.phone,
      messageCount: messages.length,
      messages,
    };
  }

  /**
   * Simula resposta automática ao receber "agendar"
   * Retorna pontos disponíveis e serviços
   * (Integração mais complexa com agendamento viria aqui)
   */
  static async processSchedulingRequest(clientId, messageContent) {
    const client = await ClientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    // Muito simplificado - apenas exemplifica a estrutura
    // Em produção, isso seria bem mais complexo com NLP/intent detection

    const isSchedulingRequest = messageContent.toLowerCase().includes('agendar') ||
                               messageContent.toLowerCase().includes('marcar') ||
                               messageContent.toLowerCase().includes('agendamento');

    if (!isSchedulingRequest) {
      return { isSchedulingRequest: false };
    }

    // Retorna resposta com informações de agendamento
    const responseMessage = `Olá ${client.name}! 👋

Para agendar um atendimento, você pode:
1. Usar nosso app
2. Consultar horários disponíveis
3. Confirmar data e hora

Deseja proceder? Envie os números do(s) serviço(s) desejado(s). ✨`;

    return {
      isSchedulingRequest: true,
      shouldRespond: true,
      responseMessage,
      clientId,
      phone: client.phone,
    };
  }

  /**
   * Envia mensagem via WhatsApp (estrutura preparada)
   * Implementação real depende da integração com WhatsApp Business API
   */
  static async sendMessage(clientId, messageBody) {
    const client = await ClientRepository.findById(clientId);
    if (!client) {
      throw new NotFoundError('Cliente não encontrado');
    }

    // Armazena mensagem como outgoing
    const message = await WhatsAppRepository.storeOutgoingMessage(
      clientId,
      messageBody
    );

    // Aqui seria feita a chamada à API do WhatsApp
    // const sent = await this.callWhatsAppAPI(client.phone, messageBody);

    // Por enquanto, apenas simula
    console.log(`[WhatsApp] Mensagem para ${client.phone}: ${messageBody}`);

    return {
      messageId: message.id,
      clientId,
      status: 'queued',
      message: 'Mensagem enfileirada para envio',
    };
  }

  /**
   * Busca mensagens não processadas para fila
   */
  static async getUnprocessedMessages(limit = 100) {
    const messages = await WhatsAppRepository.findUnprocessedMessages(limit);

    return {
      count: messages.length,
      messages,
    };
  }
}

module.exports = WhatsAppService;

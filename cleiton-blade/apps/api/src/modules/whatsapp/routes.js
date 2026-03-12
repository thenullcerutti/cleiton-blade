const express = require('express');
const WhatsAppController = require('./WhatsAppController');
const { authMiddleware, roleMiddleware } = require('../../shared/middlewares/auth');

const router = express.Router();

/**
 * GET /whatsapp/webhook
 * Webhook verification (público - não requer auth)
 */
router.get('/webhook', WhatsAppController.verifyWebhook);

/**
 * POST /whatsapp/webhook
 * Recebe mensagens do WhatsApp (público - não requer auth)
 */
router.post('/webhook', WhatsAppController.handleWebhook);

// Endpoints abaixo requerem autenticação

/**
 * GET /whatsapp/conversation/:clientId
 * Obtém histórico de conversação
 */
router.get(
  '/conversation/:clientId',
  authMiddleware,
  WhatsAppController.getConversation
);

/**
 * POST /whatsapp/send
 * Envia mensagem de forma manual
 */
router.post(
  '/send',
  authMiddleware,
  roleMiddleware('admin'),
  WhatsAppController.sendMessage
);

/**
 * POST /whatsapp/process-scheduling
 * Processa mensagem de agendamento
 */
router.post(
  '/process-scheduling',
  authMiddleware,
  WhatsAppController.processSchedulingRequest
);

/**
 * GET /whatsapp/unprocessed
 * Lista mensagens não processadas (para fila/processamento)
 */
router.get(
  '/unprocessed',
  authMiddleware,
  roleMiddleware('admin'),
  WhatsAppController.getUnprocessedMessages
);

module.exports = router;

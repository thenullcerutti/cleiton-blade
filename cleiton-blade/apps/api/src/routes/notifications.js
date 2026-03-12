/**
 * Rotas de gerenciamento de notificações
 * 
 * Endpoints:
 * GET  /api/notifications/preferences - Obter preferências
 * PUT  /api/notifications/preferences - Atualizar preferências
 * POST /api/notifications/preferences/channel/:channel/toggle - Habilitar/desabilitar canal
 * POST /api/notifications/preferences/reminder/:type/toggle - Habilitar/desabilitar lembrete
 * POST /api/notifications/preferences/quiet-hours - Definir horas silenciosas
 * GET  /api/notifications/history - Histórico de notificações
 * POST /api/notifications/send-pending - Enviar notificações pendentes (admin/job)
 */

const express = require('express');
const router = express.Router();
const NotificationService = require('../modules/notifications/NotificationService');
const { authenticate, authorize } = require('../shared/middlewares/authMiddleware');
const { AppError } = require('../shared/errors/AppError');

/**
 * Obter preferências de notificação do cliente
 */
router.get('/preferences', authenticate, async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const preferences = await NotificationService.getClientPreferences(clientId);

    res.json({
      success: true,
      data: preferences,
      message: 'Preferências recuperadas com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Atualizar preferências de notificação
 * Body: { whatsapp_enabled, email_enabled, sms_enabled, morning_reminder_enabled, one_hour_before_enabled }
 */
router.put('/preferences', authenticate, async (req, res, next) => {
  try {
    const clientId = req.user.id;
    const result = await NotificationService.updateClientPreferences(clientId, req.body);

    res.json({
      success: true,
      data: result.data,
      message: 'Preferências atualizadas com sucesso'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Habilitar/desabilitar um canal de notificação
 * Canais: whatsapp, email, sms
 * Query: enabled=true|false
 */
router.post('/preferences/channel/:channel/toggle', authenticate, async (req, res, next) => {
  try {
    const { channel } = req.params;
    const { enabled } = req.query;
    const clientId = req.user.id;

    if (!['whatsapp', 'email', 'sms'].includes(channel)) {
      return res.status(400).json({
        success: false,
        message: 'Canal inválido. Canais válidos: whatsapp, email, sms'
      });
    }

    if (enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "enabled" obrigatório (true/false)'
      });
    }

    const isEnabled = enabled === 'true';
    const NotificationPreferenceRepository = require('../notifications/NotificationPreferenceRepository');
    const result = await NotificationPreferenceRepository.toggleChannel(clientId, channel, isEnabled);

    res.json({
      success: true,
      data: result,
      message: `Channel ${channel} ${isEnabled ? 'habilitado' : 'desabilitado'}`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Habilitar/desabilitar lembretes
 * Tipos: morning, one_hour_before
 * Query: enabled=true|false
 */
router.post('/preferences/reminder/:type/toggle', authenticate, async (req, res, next) => {
  try {
    const { type } = req.params;
    const { enabled } = req.query;
    const clientId = req.user.id;

    if (!['morning', 'one_hour_before'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Tipo de lembrete inválido. Válidos: morning, one_hour_before'
      });
    }

    if (enabled === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetro "enabled" obrigatório (true/false)'
      });
    }

    const isEnabled = enabled === 'true';
    const NotificationPreferenceRepository = require('../notifications/NotificationPreferenceRepository');
    const result = await NotificationPreferenceRepository.toggleReminder(clientId, type, isEnabled);

    res.json({
      success: true,
      data: result,
      message: `Lembrete de ${type} ${isEnabled ? 'habilitado' : 'desabilitado'}`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Definir horas silenciosas
 * Body: { quiet_hours_start: "HH:MM", quiet_hours_end: "HH:MM" }
 */
router.post('/preferences/quiet-hours', authenticate, async (req, res, next) => {
  try {
    const { quiet_hours_start, quiet_hours_end } = req.body;
    const clientId = req.user.id;

    if (!quiet_hours_start || !quiet_hours_end) {
      return res.status(400).json({
        success: false,
        message: 'Parâmetros obrigatórios: quiet_hours_start, quiet_hours_end (formato HH:MM)'
      });
    }

    // Validar formato HH:MM
    const timeRegex = /^([0-1][0-9]|2[0-3]):[0-5][0-9]$/;
    if (!timeRegex.test(quiet_hours_start) || !timeRegex.test(quiet_hours_end)) {
      return res.status(400).json({
        success: false,
        message: 'Formato de hora inválido. Use HH:MM (ex: 22:00)'
      });
    }

    const NotificationPreferenceRepository = require('../notifications/NotificationPreferenceRepository');
    const result = await NotificationPreferenceRepository.setQuietHours(
      clientId,
      quiet_hours_start,
      quiet_hours_end
    );

    res.json({
      success: true,
      data: result,
      message: `Horas silenciosas definidas de ${quiet_hours_start} a ${quiet_hours_end}`
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Obter histórico de notificações do cliente
 * Query: limit=50
 */
router.get('/history', authenticate, async (req, res, next) => {
  try {
    const { limit = 50 } = req.query;
    const clientId = req.user.id;

    const notifications = await NotificationService.getClientNotificationHistory(clientId, parseInt(limit));

    res.json({
      success: true,
      data: notifications,
      count: notifications.length,
      message: 'Histórico de notificações'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * ADMIN/CRON: Enviar notificações pendentes
 * Este endpoint deve ser chamado periodicamente por um job/cron
 */
router.post('/send-pending', authenticate, authorize(['admin']), async (req, res, next) => {
  try {
    const result = await NotificationService.sendPendingNotifications();

    res.json({
      success: true,
      data: result,
      message: 'Notificações processadas'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

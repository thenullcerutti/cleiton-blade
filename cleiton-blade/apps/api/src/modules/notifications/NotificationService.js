/**
 * Serviço de notificações de agendamento
 * Responsável por agendar e enviar lembretes
 */

const AppointmentNotificationRepository = require('./AppointmentNotificationRepository');
const NotificationPreferenceRepository = require('./NotificationPreferenceRepository');
const { AppError } = require('../../shared/errors/AppError');

class NotificationService {
  /**
   * Agendar notificações para um agendamento
   * Cria registros de notificação para:
   * - 7 da manhã do dia do agendamento
   * - 1 hora antes do horário agendado
   */
  static async scheduleAppointmentNotifications(appointmentId, clientId, appointmentDateTime, notificationsEnabled = true) {
    try {
      if (!notificationsEnabled) {
        return { scheduled: false, message: 'Notificações desabilitadas pelo cliente' };
      }

      const appointmentDate = new Date(appointmentDateTime);
      const preferences = await NotificationPreferenceRepository.getByClientId(clientId);

      const notifications = [];

      // Notificação 1: 7 da manhã do dia do agendamento
      if (preferences.morning_reminder_enabled) {
        const morningTime = new Date(appointmentDate);
        morningTime.setHours(7, 0, 0, 0);

        // Só agendar se ainda não passou
        if (morningTime > new Date()) {
          const exists = await AppointmentNotificationRepository.exists(appointmentId, 'morning_reminder');
          if (!exists) {
            const notification = await AppointmentNotificationRepository.create(
              appointmentId,
              clientId,
              'morning_reminder',
              morningTime
            );
            notifications.push(notification);
          }
        }
      }

      // Notificação 2: 1 hora antes do agendamento
      if (preferences.one_hour_before_enabled) {
        const oneHourBefore = new Date(appointmentDate);
        oneHourBefore.setHours(oneHourBefore.getHours() - 1);

        // Só agendar se ainda não passou
        if (oneHourBefore > new Date()) {
          const exists = await AppointmentNotificationRepository.exists(appointmentId, 'one_hour_before');
          if (!exists) {
            const notification = await AppointmentNotificationRepository.create(
              appointmentId,
              clientId,
              'one_hour_before',
              oneHourBefore
            );
            notifications.push(notification);
          }
        }
      }

      return {
        scheduled: true,
        notifications: notifications,
        count: notifications.length
      };
    } catch (error) {
      throw new AppError('Erro ao agendar notificações: ' + error.message, 500);
    }
  }

  /**
   * Enviar notificações pendentes
   * Deve ser executado periodicamente (a cada 5 minutos, por exemplo)
   */
  static async sendPendingNotifications() {
    try {
      const pendingNotifications = await AppointmentNotificationRepository.getPendingNotifications();

      if (pendingNotifications.length === 0) {
        return { sent: 0, failed: 0, skipped: 0 };
      }

      let sent = 0;
      let failed = 0;
      let skipped = 0;

      for (const notification of pendingNotifications) {
        try {
          // Verificar se cliente quer receber notificações
          const preferences = await NotificationPreferenceRepository.getByClientId(notification.client_id);

          if (!preferences.whatsapp_enabled && !preferences.email_enabled && !preferences.sms_enabled) {
            await AppointmentNotificationRepository.updateStatus(notification.id, 'skipped');
            skipped++;
            continue;
          }

          // Verificar horários silenciosos
          const inQuietHours = await NotificationPreferenceRepository.isInQuietHours(notification.client_id);
          if (inQuietHours) {
            skipped++;
            continue;
          }

          // Tentar enviar por WhatsApp
          if (preferences.whatsapp_enabled && notification.client_phone) {
            const success = await this.sendWhatsAppNotification(
              notification.client_phone,
              notification.client_name,
              notification.service_name,
              notification.appointment_datetime,
              notification.send_type
            );

            if (success) {
              await AppointmentNotificationRepository.updateStatus(
                notification.id,
                'sent',
                'whatsapp'
              );
              sent++;
              continue;
            }
          }

          // Fallback: tentar enviar por Email
          if (preferences.email_enabled && notification.client_email) {
            const success = await this.sendEmailNotification(
              notification.client_email,
              notification.client_name,
              notification.service_name,
              notification.appointment_datetime,
              notification.send_type
            );

            if (success) {
              await AppointmentNotificationRepository.updateStatus(
                notification.id,
                'sent',
                'email'
              );
              sent++;
              continue;
            }
          }

          // Se nenhum canal funcionou, marcar como falha
          await AppointmentNotificationRepository.updateStatus(
            notification.id,
            'failed',
            null,
            'Nenhum canal de comunicação disponível'
          );
          failed++;

        } catch (error) {
          await AppointmentNotificationRepository.updateStatus(
            notification.id,
            'failed',
            null,
            error.message
          );
          failed++;
        }
      }

      return { sent, failed, skipped, total: pendingNotifications.length };
    } catch (error) {
      throw new AppError('Erro ao enviar notificações: ' + error.message, 500);
    }
  }

  /**
   * Enviar notificação via WhatsApp
   */
  static async sendWhatsAppNotification(phone, clientName, serviceName, appointmentTime, reminderType) {
    try {
      // TODO: Implementar integração com WhatsApp API
      // Por enquanto, apenas simular sucesso
      const message = this.buildNotificationMessage(
        clientName,
        serviceName,
        appointmentTime,
        reminderType,
        'whatsapp'
      );

      console.log(`[WhatsApp] Enviando para ${phone}: ${message}`);

      // Simular envio bem-sucedido
      return true;

      // Exemplo do que a integração deveria fazer:
      // const response = await twilioClient.messages.create({
      //   from: process.env.TWILIO_PHONE,
      //   to: phone,
      //   body: message
      // });
      // return !!response.sid;
    } catch (error) {
      console.error(`Erro ao enviar WhatsApp para ${phone}:`, error.message);
      return false;
    }
  }

  /**
   * Enviar notificação via Email
   */
  static async sendEmailNotification(email, clientName, serviceName, appointmentTime, reminderType) {
    try {
      // TODO: Implementar integração com Email API (SendGrid, AWS SES, etc)
      // Por enquanto, apenas simular sucesso
      const message = this.buildNotificationMessage(
        clientName,
        serviceName,
        appointmentTime,
        reminderType,
        'email'
      );

      console.log(`[Email] Enviando para ${email}: ${message}`);

      // Simular envio bem-sucedido
      return true;

      // Exemplo do que a integração deveria fazer:
      // await sendgridClient.send({
      //   to: email,
      //   from: process.env.SENDGRID_FROM_EMAIL,
      //   subject: 'Lembrete de Agendamento - Cleiton Blade',
      //   html: message
      // });
      // return true;
    } catch (error) {
      console.error(`Erro ao enviar Email para ${email}:`, error.message);
      return false;
    }
  }

  /**
   * Construir mensagem de notificação
   */
  static buildNotificationMessage(clientName, serviceName, appointmentTime, reminderType, channel = 'whatsapp') {
    const appointmentDate = new Date(appointmentTime);
    const time = appointmentDate.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const date = appointmentDate.toLocaleDateString('pt-BR');

    let message = '';

    if (reminderType === 'morning_reminder') {
      if (channel === 'whatsapp') {
        message = `Olá ${clientName}! 👋\n\nLembrete do seu agendamento de hoje:\n\n📅 ${date}\n⏰ ${time}\n✂️ Serviço: ${serviceName}\n\n🏪 Cleiton Blade\nAte logo!`;
      } else {
        message = `<h2>Lembrete de Agendamento</h2><p>Olá ${clientName},</p><p>Você tem um agendamento marcado para hoje:</p><ul><li><strong>Data:</strong> ${date}</li><li><strong>Horário:</strong> ${time}</li><li><strong>Serviço:</strong> ${serviceName}</li></ul><p>Esperamos você!</p><p>Cleiton Blade</p>`;
      }
    } else if (reminderType === 'one_hour_before') {
      if (channel === 'whatsapp') {
        message = `Ótimo ${clientName}! ⏰\n\nFalta 1 hora para seu agendamento:\n\n⏰ ${time}\n✂️ Serviço: ${serviceName}\n\n🏪 Cleiton Blade`;
      } else {
        message = `<h2>Agendamento em 1 hora</h2><p>Olá ${clientName},</p><p>Lembrete: você tem um agendamento marcado para em 1 hora.</p><ul><li><strong>Horário:</strong> ${time}</li><li><strong>Serviço:</strong> ${serviceName}</li></ul><p>Prepare-se e nos vejo em em breve!</p><p>Cleiton Blade</p>`;
      }
    }

    return message;
  }

  /**
   * Cancelar notificações de um agendamento
   * (quando agendamento é cancelado)
   */
  static async cancelAppointmentNotifications(appointmentId) {
    try {
      await AppointmentNotificationRepository.deleteByAppointmentId(appointmentId);
      return { cancelled: true, message: 'Notificações canceladas' };
    } catch (error) {
      throw new AppError('Erro ao cancelar notificações: ' + error.message, 500);
    }
  }

  /**
   * Obter histórico de notificações do cliente
   */
  static async getClientNotificationHistory(clientId, limit = 50) {
    try {
      return await AppointmentNotificationRepository.getByClientId(clientId, limit);
    } catch (error) {
      throw new AppError('Erro ao obter histórico: ' + error.message, 500);
    }
  }

  /**
   * Obter preferências de notificação do cliente
   */
  static async getClientPreferences(clientId) {
    try {
      return await NotificationPreferenceRepository.getByClientId(clientId);
    } catch (error) {
      throw new AppError('Erro ao obter preferências: ' + error.message, 500);
    }
  }

  /**
   * Atualizar preferências de notificação
   */
  static async updateClientPreferences(clientId, preferences) {
    try {
      const updated = await NotificationPreferenceRepository.update(clientId, preferences);
      return { success: true, data: updated };
    } catch (error) {
      throw new AppError('Erro ao atualizar preferências: ' + error.message, 500);
    }
  }
}

module.exports = NotificationService;

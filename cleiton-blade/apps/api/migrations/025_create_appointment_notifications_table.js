/**
 * Migration: Create appointment notifications table
 * Tabela para rastrear notificações de agendamento
 * Registra lembretes de manhã e 1 hora antes do horário
 */

const sql = `
  CREATE TABLE IF NOT EXISTS appointment_notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL,
    client_id UUID NOT NULL,
    send_type VARCHAR(50) NOT NULL CHECK (send_type IN ('morning_reminder', 'one_hour_before')),
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    sent_at TIMESTAMP WITH TIME ZONE,
    sent_via VARCHAR(50) CHECK (sent_via IN ('whatsapp', 'email', 'sms')),
    delivery_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (delivery_status IN ('pending', 'sent', 'failed', 'skipped')),
    failure_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_appointment_notifications_appointment_id ON appointment_notifications(appointment_id);
  CREATE INDEX IF NOT EXISTS idx_appointment_notifications_client_id ON appointment_notifications(client_id);
  CREATE INDEX IF NOT EXISTS idx_appointment_notifications_scheduled_for ON appointment_notifications(scheduled_for);
  CREATE INDEX IF NOT EXISTS idx_appointment_notifications_send_type ON appointment_notifications(send_type);
  CREATE INDEX IF NOT EXISTS idx_appointment_notifications_status ON appointment_notifications(delivery_status);
  CREATE INDEX IF NOT EXISTS idx_appointment_notifications_pending ON appointment_notifications(delivery_status, scheduled_for)
    WHERE delivery_status = 'pending';
`;

module.exports = {
  up: sql,
  name: '025_create_appointment_notifications_table',
};

/**
 * Migration: Add notification and client info fields to appointments
 * Adiciona campos de informações do cliente e notificações ao agendamento
 */

const sql = `
  ALTER TABLE appointments
  ADD COLUMN IF NOT EXISTS client_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS client_phone VARCHAR(20),
  ADD COLUMN IF NOT EXISTS client_email VARCHAR(255),
  ADD COLUMN IF NOT EXISTS notifications_enabled BOOLEAN DEFAULT TRUE,
  ADD COLUMN IF NOT EXISTS observations TEXT;

  CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON appointments(client_phone);
  CREATE INDEX IF NOT EXISTS idx_appointments_client_email ON appointments(client_email);
`;

module.exports = {
  up: sql,
  name: '024_add_notification_fields_to_appointments',
};

/**
 * Migration: Disable RLS for development
 * Desabilita RLS para permitir acesso público ao banco de dados em desenvolvimento
 * 
 * Em produção, você deve re-habilitar RLS com policies apropriadas
 */

const sql = `
  -- Desabilitar RLS em todas as tabelas para desenvolvimento
  ALTER TABLE users DISABLE ROW LEVEL SECURITY;
  ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
  ALTER TABLE professionals DISABLE ROW LEVEL SECURITY;
  ALTER TABLE services DISABLE ROW LEVEL SECURITY;
  ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
  ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
  ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;
  ALTER TABLE events_log DISABLE ROW LEVEL SECURITY;
`;

module.exports = {
  up: sql,
  name: '012_disable_rls_for_development'
};

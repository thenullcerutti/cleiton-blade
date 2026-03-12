/**
 * Migration: Adicionar colunas de owner/relacionamento para RLS
 * 
 * Adiciona colunas que permitem diferenciar o "dono" dos dados
 * para implementar RLS adequadamente
 */

const sql = `
  -- Adicionar user_id a tabelas se não existir
  ALTER TABLE clients ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
  ALTER TABLE professionals ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
  ALTER TABLE appointments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);
  ALTER TABLE payments ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

  -- Adicionar índices para performance
  CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
  CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_user_id ON appointments(user_id);
  CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
`;

module.exports = {
  up: sql,
  name: '014_add_user_ownership_columns'
};

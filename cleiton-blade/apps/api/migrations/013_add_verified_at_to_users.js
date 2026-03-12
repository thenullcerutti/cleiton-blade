/**
 * Migration 013: Adicionar coluna verified_at à tabela users
 * Controla se o email foi verificado para ativar a conta
 */

const sql = `
  -- Adicionar coluna verified_at à tabela users
  ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
`;

module.exports = {
  up: sql,
  name: '013_add_verified_at_to_users'
};

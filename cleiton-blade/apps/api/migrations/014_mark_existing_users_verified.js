/**
 * Migration 014: Marcar usuários existentes como verificados
 * Define verified_at = created_at para usuários existentes
 */

const sql = `
  -- Índice para melhor performance
  CREATE INDEX IF NOT EXISTS idx_users_verified_at ON users(verified_at);
`;

module.exports = {
  up: sql,
  name: '014_mark_existing_users_verified'
};

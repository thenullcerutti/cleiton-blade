/**
 * Migration 015: Adicionar coluna api_key à tabela users
 * Armazena a chave secreta para autenticação de API
 */

const sql = `
  -- Adicionar coluna api_key para armazenar chave secreta de admin
  ALTER TABLE users ADD COLUMN IF NOT EXISTS api_key VARCHAR(255) UNIQUE;
  
  -- Índice para buscar por api_key
  CREATE INDEX IF NOT EXISTS idx_users_api_key ON users(api_key);
`;

module.exports = {
  up: sql,
  name: '016_add_api_key_to_users'
};

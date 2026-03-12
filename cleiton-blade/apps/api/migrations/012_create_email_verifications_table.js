/**
 * Migration 012: Criar tabela de verificações de email
 * Armazena tokens únicos para confirmar emails antes de ativar contas
 */

const sql = `
  -- Tabela para armazenar tokens de verificação de email
  CREATE TABLE IF NOT EXISTS email_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    verified_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    attempts INT DEFAULT 0,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    
    CONSTRAINT fk_email_verifications_user 
      FOREIGN KEY (user_id) 
      REFERENCES users(id) ON DELETE CASCADE
  );
  
  -- Índices para melhor performance
  CREATE INDEX IF NOT EXISTS idx_email_verifications_token ON email_verifications(token);
  CREATE INDEX IF NOT EXISTS idx_email_verifications_user_id ON email_verifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_email_verifications_expires_at ON email_verifications(expires_at);
`;

module.exports = {
  up: sql,
  name: '012_create_email_verifications_table'
};

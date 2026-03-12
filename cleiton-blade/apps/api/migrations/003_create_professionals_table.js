/**
 * Migration: Create professionals table
 * Tabela de profissionais que prestam serviços
 */

const sql = `
  CREATE TABLE IF NOT EXISTS professionals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE,
    name VARCHAR(150) NOT NULL,
    commission_percentage DECIMAL(5,2) DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON professionals(user_id);
  CREATE INDEX IF NOT EXISTS idx_professionals_active ON professionals(active);
`;

module.exports = {
  up: sql,
  name: '003_create_professionals_table',
};

module.exports = {
  up: sql,
  name: '003_create_professionals_table',
};

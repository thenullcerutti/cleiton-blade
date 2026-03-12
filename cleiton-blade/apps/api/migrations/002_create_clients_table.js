/**
 * Migration: Create clients table
 * Tabela de clientes que agendarão serviços
 */

const sql = `
  CREATE TABLE IF NOT EXISTS clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    loyalty_points INTEGER DEFAULT 0,
    blocked BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_clients_phone ON clients(phone);
  CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
  CREATE INDEX IF NOT EXISTS idx_clients_blocked ON clients(blocked);
`;

module.exports = {
  up: sql,
  name: '002_create_clients_table',
};

module.exports = {
  up: sql,
  name: '002_create_clients_table',
};

/**
 * Migration: Create services table
 * Tabela de serviços oferecidos
 */

const sql = `
  CREATE TABLE IF NOT EXISTS services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price > 0),
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );

  CREATE INDEX IF NOT EXISTS idx_services_active ON services(active);
  CREATE INDEX IF NOT EXISTS idx_services_name ON services(LOWER(name));
`;

module.exports = {
  up: sql,
  name: '004_create_services_table',
};

module.exports = {
  up: sql,
  name: '004_create_services_table',
};

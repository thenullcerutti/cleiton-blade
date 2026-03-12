/**
 * Migration: Create payments table
 * Tabela de pagamentos
 */

const sql = `
  CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    appointment_id UUID NOT NULL UNIQUE,
    method VARCHAR(20) NOT NULL CHECK (method IN ('pix', 'card', 'cash', 'pending')),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'paid', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (appointment_id) REFERENCES appointments(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_payments_appointment_id ON payments(appointment_id);
  CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
  CREATE INDEX IF NOT EXISTS idx_payments_method ON payments(method);
`;

module.exports = {
  up: sql,
  name: '007_create_payments_table',
};

module.exports = {
  up: sql,
  name: '007_create_payments_table',
};

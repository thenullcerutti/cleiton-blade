/**
 * Migration: Melhorar tabela de agendamentos
 * 
 * Adiciona Status e Nota de observações
 */

const { query } = require('../../config/database');

const sql = `
ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show')),
ADD COLUMN IF NOT EXISTS notes VARCHAR(500),
ADD COLUMN IF NOT EXISTS cancelled_reason VARCHAR(255),
ADD COLUMN IF NOT EXISTS cancelled_at TIMESTAMP;

-- Índices para buscas comuns
CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
CREATE INDEX IF NOT EXISTS idx_appointments_cancelled_at ON appointments(cancelled_at);
`;

module.exports = { sql };

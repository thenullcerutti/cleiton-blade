/**
 * Migration: Adicionar coluna de duração à tabela de serviços
 * 
 * Permite definir quanto tempo cada serviço leva
 */

const { query } = require('../../config/database');

const sql = `
ALTER TABLE services 
ADD COLUMN IF NOT EXISTS duration_minutes INTEGER DEFAULT 30 CHECK (duration_minutes >= 15);

-- Índice para buscar serviços por duração
CREATE INDEX IF NOT EXISTS idx_services_duration ON services(duration_minutes);
`;

module.exports = { sql };

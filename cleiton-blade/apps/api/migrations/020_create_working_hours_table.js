/**
 * Migration: Criar tabela de horários de trabalho
 * 
 * Armazena os horários gerais de funcionamento (seg-dom, 09:00-18:00, etc)
 */

const { query } = require('../../config/database');

const sql = `
CREATE TABLE IF NOT EXISTS working_hours (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 0=Domingo, 1=Segunda, ..., 6=Sábado
  day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6),
  
  -- Horário de início (HH:MM)
  start_time VARCHAR(5) NOT NULL,
  
  -- Horário de término (HH:MM)
  end_time VARCHAR(5) NOT NULL,
  
  -- Se está ativo ou não
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  
  -- Garantir apenas um horário por dia por usuário
  UNIQUE(user_id, day_of_week)
);

CREATE INDEX IF NOT EXISTS idx_working_hours_user_id ON working_hours(user_id);
CREATE INDEX IF NOT EXISTS idx_working_hours_day ON working_hours(day_of_week);
`;

module.exports = { sql };

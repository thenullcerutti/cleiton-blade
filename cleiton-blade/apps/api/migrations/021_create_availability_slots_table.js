/**
 * Migration: Criar tabela de slots de disponibilidade
 * 
 * Armazena slots bloqueados/desbloqueados em datas específicas
 * (para bloquear um horário específico sem afetar outros dias)
 */

const { query } = require('../../config/database');

const sql = `
CREATE TABLE IF NOT EXISTS availability_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
  
  -- Data e horário do slot
  date_time TIMESTAMP NOT NULL,
  
  -- Duração em minutos (calculada baseado no serviço)
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  
  -- Status: 'available', 'booked', 'blocked', 'pending'
  status VARCHAR(20) DEFAULT 'available',
  
  -- Motivo do bloqueio (se status = blocked)
  blocked_reason VARCHAR(255),
  
  -- ID do agendamento (se status = booked ou pending)
  appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
  
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_availability_slots_professional ON availability_slots(professional_id);
CREATE INDEX IF NOT EXISTS idx_availability_slots_date_time ON availability_slots(date_time);
CREATE INDEX IF NOT EXISTS idx_availability_slots_status ON availability_slots(status);
`;

module.exports = { sql };

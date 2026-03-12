/**
 * Migration: Create schedules table
 * Tabela de jornadas de trabalho dos profissionais (agenda de disponibilidade)
 */

const sql = `
  CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    professional_id UUID NOT NULL,
    weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    break_start TIME,
    break_end TIME,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE
  );

  CREATE INDEX IF NOT EXISTS idx_schedules_professional_id ON schedules(professional_id);
  CREATE INDEX IF NOT EXISTS idx_schedules_weekday ON schedules(weekday);
`;

module.exports = {
  up: sql,
  name: '005_create_schedules_table',
};

module.exports = {
  up: sql,
  name: '005_create_schedules_table',
};

/**
 * Migration: Create events_log table
 * Tabela de registro de eventos do sistema para futura integração com fila
 */

const sql = `
  CREATE TABLE IF NOT EXISTS events_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    payload JSONB,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP WITH TIME ZONE
  );

  CREATE INDEX IF NOT EXISTS idx_events_log_event_type ON events_log(event_type);
  CREATE INDEX IF NOT EXISTS idx_events_log_status ON events_log(status);
  CREATE INDEX IF NOT EXISTS idx_events_log_created_at ON events_log(created_at);
`;

module.exports = {
  up: sql,
  name: '009_create_events_log_table',
};

module.exports = {
  up: sql,
  name: '009_create_events_log_table',
};

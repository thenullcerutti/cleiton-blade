/**
 * Migration: Create appointments table
 * Tabela de agendamentos
 */

const sql = `
  CREATE TABLE IF NOT EXISTS appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    client_id UUID NOT NULL,
    professional_id UUID NOT NULL,
    service_id UUID NOT NULL,
    appointment_datetime TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'confirmed', 'completed', 'canceled', 'no_show')),
    origin VARCHAR(20) NOT NULL CHECK (origin IN ('whatsapp', 'app', 'web', 'admin')),
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE RESTRICT,
    FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE RESTRICT,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE RESTRICT,
    UNIQUE (professional_id, appointment_datetime)
  );

  CREATE INDEX IF NOT EXISTS idx_appointments_client_id ON appointments(client_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_professional_id ON appointments(professional_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_service_id ON appointments(service_id);
  CREATE INDEX IF NOT EXISTS idx_appointments_datetime ON appointments(appointment_datetime);
  CREATE INDEX IF NOT EXISTS idx_appointments_status ON appointments(status);
  CREATE INDEX IF NOT EXISTS idx_appointments_payment_status ON appointments(payment_status);
  CREATE INDEX IF NOT EXISTS idx_appointments_prof_time ON appointments(professional_id, appointment_datetime);
`;

module.exports = {
  up: sql,
  name: '006_create_appointments_table',
};

module.exports = {
  up: sql,
  name: '006_create_appointments_table',
};

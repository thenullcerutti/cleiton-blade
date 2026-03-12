/**
 * Migration 026 - Create availability_slots table
 * Tabela para armazenar slots de disponibilidade de agendamento
 */

const { query } = require('../src/config/database');

async function up() {
  try {
    // Criar tabela de availability_slots se não existir
    await query(`
      CREATE TABLE IF NOT EXISTS availability_slots (
        id SERIAL PRIMARY KEY,
        professional_id INTEGER NOT NULL,
        date_time TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'booked', 'blocked')),
        appointment_id INTEGER,
        blocked_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        
        FOREIGN KEY (professional_id) REFERENCES professionals(id) ON DELETE CASCADE,
        UNIQUE(professional_id, date_time)
      );
    `);

    console.log('✅ Tabela availability_slots criada com sucesso');

    // Criar índices para melhor performance
    await query(`
      CREATE INDEX IF NOT EXISTS idx_availability_slots_professional 
      ON availability_slots(professional_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_availability_slots_datetime 
      ON availability_slots(date_time);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_availability_slots_status 
      ON availability_slots(status);
    `);

    console.log('✅ Índices criados com sucesso');

  } catch (error) {
    console.error('❌ Erro na migration 026:', error.message);
    throw error;
  }
}

async function down() {
  try {
    await query(`DROP TABLE IF EXISTS availability_slots CASCADE;`);
    console.log('✅ Tabela availability_slots removida');
  } catch (error) {
    console.error('❌ Erro ao reverter migration 026:', error.message);
    throw error;
  }
}

module.exports = { up, down };

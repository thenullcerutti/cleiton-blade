const { query } = require('./src/config/database');

(async () => {
  try {
    // Apenas tentar criar a tabela
    const createSql = `
      CREATE TABLE IF NOT EXISTS availability_slots (
        id BIGSERIAL PRIMARY KEY,
        professional_id BIGINT NOT NULL,
        date_time TIMESTAMP NOT NULL,
        duration_minutes INTEGER DEFAULT 30,
        status VARCHAR(20) DEFAULT 'available',
        appointment_id BIGINT,
        blocked_reason VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `;

    await query(createSql);
    console.log('✅ Tabela criada ou já existe');

    // Tentar inserir um slot de teste
    const insertSql = `
      INSERT INTO availability_slots (professional_id, date_time, duration_minutes, status)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT DO NOTHING
    `;

    await query(insertSql, [1, '2026-03-12T07:00:00', 30, 'available']);
    console.log('✅ Slot inserido');

    process.exit(0);
  } catch (e) {
    console.error('❌ Erro:', e.message);
    console.error(e);
    process.exit(1);
  }
})();

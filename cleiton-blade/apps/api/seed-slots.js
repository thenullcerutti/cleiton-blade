const { query } = require('./src/config/database');

async function seedSlots() {
  try {
    const baseDate = '2026-03-12';
    const slots = [];

    // Gerar slots de 15 em 15 minutos das 7:00 às 18:00
    for (let h = 7; h < 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        const hour = String(h).padStart(2, '0');
        const minute = String(m).padStart(2, '0');
        slots.push([1, `${baseDate}T${hour}:${minute}:00`, 30, 'available']);
      }
    }

    // Inserir em lotes
    let inserted = 0;
    for (const slot of slots) {
      try {
        const sql = `
          INSERT INTO availability_slots (professional_id, date_time, duration_minutes, status)
          VALUES ($1, $2, $3, $4)
        `;
        await query(sql, slot);
        inserted++;
      } catch (e) {
        // Pode dar erro de UNIQUE se já existir
        if (e.message.includes('duplicate')) {
          continue;
        }
        throw e;
      }
    }

    console.log(`✅ Inseridos ${inserted} slots de disponibilidade para ${baseDate}`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error.message);
    process.exit(1);
  }
}

seedSlots();

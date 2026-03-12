const bcrypt = require('bcrypt');
const { query } = require('../src/config/database');

/**
 * Script para popular o banco de dados com dados iniciais (PostgreSQL)
 */

const seedDatabase = async () => {
  try {
    console.log('🌱 Iniciando seed do banco de dados...');

    // Criar usuário admin padrão
    const adminPassword = await bcrypt.hash('admin123456', 10);
    
    const adminUserSql = `
      INSERT INTO users (name, email, password_hash, role, active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `;

    const adminResult = await query(adminUserSql, [
      'Administrator',
      'admin@cleiton-blade.com',
      adminPassword,
      'admin',
      true
    ]);

    if (adminResult.rows.length > 0) {
      console.log('✅ Usuário admin criado');
    } else {
      console.log('ℹ️  Usuário admin já existe');
    }

    // Criar serviços padrão
    const servicesData = [
      { name: 'Corte Cabelo', duration: 30, price: 50.00 },
      { name: 'Barba', duration: 25, price: 35.00 },
      { name: 'Corte + Barba', duration: 50, price: 75.00 },
      { name: 'Hidratação Capilar', duration: 45, price: 60.00 },
      { name: 'Alisamento', duration: 120, price: 200.00 },
    ];

    const servicesSql = `
      INSERT INTO services (name, duration_minutes, price, active)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (name) DO NOTHING;
    `;

    for (const service of servicesData) {
      await query(servicesSql, [
        service.name,
        service.duration,
        service.price,
        true
      ]);
    }

    console.log('✅ Serviços padrão criados');

    // Criar profissional de exemplo
    const professionalPassword = await bcrypt.hash('prof123456', 10);
    
    const profUserSql = `
      INSERT INTO users (name, email, password_hash, role, active)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (email) DO NOTHING
      RETURNING id;
    `;

    const profResult = await query(profUserSql, [
      'João Silva',
      'joao@cleiton-blade.com',
      professionalPassword,
      'professional',
      true
    ]);

    if (profResult.rows.length > 0) {
      const profUserId = profResult.rows[0].id;

      const profSql = `
        INSERT INTO professionals (user_id, name, commission_percentage, active)
        VALUES ($1, $2, $3, $4)
        ON CONFLICT (user_id) DO NOTHING;
      `;

      await query(profSql, [
        profUserId,
        'João Silva',
        20.00,
        true
      ]);

      console.log('✅ Profissional de exemplo criado');

      // Criar horários de trabalho para segunda a sexta (0-4)
      const schedulesSql = `
        INSERT INTO schedules (professional_id, weekday, start_time, end_time, break_start, break_end)
        VALUES ($1, $2, $3, $4, $5, $6);
      `;

      const weekdays = [0, 1, 2, 3, 4]; // Segunda a Sexta
      const schedProfs = await query('SELECT id FROM professionals WHERE user_id = $1', [profUserId]);

      if (schedProfs.rows.length > 0) {
        const profId = schedProfs.rows[0].id;
        
        for (const weekday of weekdays) {
          await query(schedulesSql, [
            profId,
            weekday,
            '08:00',
            '17:00',
            '12:00',
            '13:00'
          ]);
        }

        console.log('✅ Horários de trabalho criados');
      }
    } else {
      console.log('ℹ️  Profissional já existe');
    }

    console.log('✅ Seed do banco de dados concluído com sucesso!');
    console.log('\n📝 Credenciais de acesso:');
    console.log('   Email: admin@cleiton-blade.com');
    console.log('   Senha: admin123456');
    console.log('\n   Email (Professional): joao@cleiton-blade.com');
    console.log('   Senha (Professional): prof123456');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante o seed:', error);
    process.exit(1);
  }
};

seedDatabase();

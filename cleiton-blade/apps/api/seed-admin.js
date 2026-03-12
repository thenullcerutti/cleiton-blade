#!/usr/bin/env node

/**
 * Script para criar/atualizar conta admin fixa
 * Execução: npm run seed:admin ou node seed-admin.js
 */

require('dotenv').config();
const { hashPassword } = require('./src/shared/utils/helpers');
const { query } = require('./src/config/database');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cleitonblade.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Cleiton@2026Blade!';
const ADMIN_SECRET_KEY = process.env.ADMIN_SECRET_KEY || 'cleiton-blade-admin-2026';

async function seedAdmin() {
  try {
    console.log(`\n🔐 Criando/Atualizando conta admin...`);
    console.log(`📧 Email: ${ADMIN_EMAIL}\n`);

    // Verificar se admin já existe
    const existing = await query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER($1)',
      [ADMIN_EMAIL]
    );

    const passwordHash = await hashPassword(ADMIN_PASSWORD);

    if (existing.rows.length > 0) {
      // Atualizar senha existente - tenta com api_key, se falhar tenta sem
      console.log('📝 Atualizando senha do admin existente...');
      let result;
      try {
        result = await query(
          `UPDATE users 
           SET password_hash = $1, api_key = $2, active = true, updated_at = CURRENT_TIMESTAMP
           WHERE email = $3
           RETURNING id, email, role`,
          [passwordHash, ADMIN_SECRET_KEY, ADMIN_EMAIL]
        );
      } catch (err) {
        console.log('⚠️  Coluna api_key ainda processando no Supabase, tentando sem...');
        result = await query(
          `UPDATE users 
           SET password_hash = $1, active = true, updated_at = CURRENT_TIMESTAMP
           WHERE email = $2
           RETURNING id, email, role`,
          [passwordHash, ADMIN_EMAIL]
        );
      }

      const admin = result.rows[0];
      console.log(`✅ Admin atualizado com sucesso!`);
      console.log(`\n📌 ID: ${admin.id}`);
      console.log(`📌 Email: ${admin.email}`);
      console.log(`📌 Role: ${admin.role}`);
    } else {
      // Criar novo admin - tenta com api_key, se falhar tenta sem
      console.log('✨ Criando novo admin...');
      let result;
      try {
        result = await query(
          `INSERT INTO users (name, email, password_hash, api_key, role, active)
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING id, email, role`,
          ['Administrador', ADMIN_EMAIL, passwordHash, ADMIN_SECRET_KEY, 'admin', true]
        );
      } catch (err) {
        console.log('⚠️  Coluna api_key ainda processando no Supabase, tentando sem...');
        result = await query(
          `INSERT INTO users (name, email, password_hash, role, active)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING id, email, role`,
          ['Administrador', ADMIN_EMAIL, passwordHash, 'admin', true]
        );
      }

      const admin = result.rows[0];
      console.log(`✅ Admin criado com sucesso!`);
      console.log(`\n📌 ID: ${admin.id}`);
      console.log(`📌 Email: ${admin.email}`);
      console.log(`📌 Role: ${admin.role}`);
    }

    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`🎯 Credenciais de Login:`);
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
    console.log(`📧 Email: ${ADMIN_EMAIL}`);
    console.log(`🔑 Senha: ${ADMIN_PASSWORD}`);
    console.log(`🔐 Chave Secreta (API): ${ADMIN_SECRET_KEY}`);
    console.log(`\n⚠️  GUARDE ESSAS CREDENCIAIS EM UM LUGAR SEGURO!`);
    console.log(`\n💡 Próximo passo: npm run dev`);
    console.log(`\nDepois acesse: http://localhost:3002/admin/login\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao criar admin:', error.message);
    process.exit(1);
  }
}

seedAdmin();

#!/usr/bin/env node

require('dotenv').config();
const { query } = require('./src/config/database');

async function markAdminVerified() {
  try {
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cleitonblade.com';

    console.log('🔐 Marcando admin como verificado...');
    console.log(`📧 Email: ${ADMIN_EMAIL}\n`);

    const result = await query(
      `UPDATE users 
       SET verified_at = CURRENT_TIMESTAMP
       WHERE email = $1 AND role = 'admin'
       RETURNING id, email, role, verified_at`,
      [ADMIN_EMAIL]
    );

    if (result.rows.length === 0) {
      throw new Error(`Admin não encontrado: ${ADMIN_EMAIL}`);
    }

    const admin = result.rows[0];
    console.log('✅ Admin marcado como verificado!\n');
    console.log(`📌 ID: ${admin.id}`);
    console.log(`📌 Email: ${admin.email}`);
    console.log(`📌 Role: ${admin.role}`);
    console.log(`📌 Verificado em: ${admin.verified_at}`);
    console.log('\n💡 Agora pode fazer login: http://localhost:3002/admin/login\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao verificar admin:', error.message);
    process.exit(1);
  }
}

markAdminVerified();

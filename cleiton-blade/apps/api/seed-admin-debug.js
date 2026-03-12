#!/usr/bin/env node

require('dotenv').config();
const { hashPassword } = require('./src/shared/utils/helpers');

const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cleitonblade.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Cleiton@2026Blade!';

async function seedAdmin() {
  try {
    const passwordHash = await hashPassword(ADMIN_PASSWORD);
    
    const sqlUpdate = `UPDATE users 
         SET password_hash = $1, verified_at = CURRENT_TIMESTAMP, active = true, updated_at = CURRENT_TIMESTAMP
         WHERE email = $2
         RETURNING id, email, role`;

    console.log('SQL Query:');
    console.log(sqlUpdate);
    console.log('\nValues:');
    console.log([passwordHash, ADMIN_EMAIL]);
    
    // Agora teste o parsing
    const now = new Date().toISOString();
    let processedSql = sqlUpdate.replace(/CURRENT_TIMESTAMP/gi, `'${now}'`);
    
    console.log('\nProcessed SQL:');
    console.log(processedSql);
    
    // Teste o regex
    const updateMatch = processedSql.match(/UPDATE\s+(\w+)\s+SET\s+([\s\S]*?)\s+WHERE\s+([\s\S]*?)(?:RETURNING|;|$)/i);
    console.log('\nRegex Match:');
    console.log(updateMatch);
    
    if (updateMatch) {
      const [, table, setClause, whereClause] = updateMatch;
      console.log('\nTable:', table);
      console.log('SET Clause:', setClause);
      console.log('WHERE Clause:', whereClause);
    }
    
  } catch (error) {
    console.error('Erro:', error.message);
  }
}

seedAdmin();

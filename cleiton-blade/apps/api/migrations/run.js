const fs = require('fs');
const path = require('path');
const { query } = require('../src/config/database');

/**
 * Script para executar todas as migrations
 * Cria as tabelas necessárias no banco de dados
 */

const executeMigrations = async () => {
  try {
    console.log('🔄 Iniciando migrations...');

    // Obter todos os arquivos de migration
    const migrationsDir = path.join(__dirname);
    const files = fs.readdirSync(migrationsDir)
      .filter(file => /^\d+_.*\.js$/.test(file))
      .sort();

    for (const file of files) {
      const migration = require(path.join(migrationsDir, file));
      console.log(`▶️  Executando: ${migration.name}`);

      try {
        await query(migration.up);
        console.log(`✅ ${migration.name} executada com sucesso`);
      } catch (error) {
        console.error(`❌ Erro ao executar ${migration.name}:`, error.message);
        throw error;
      }
    }

    console.log('✅ Todas as migrations foram executadas com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro durante as migrations:', error);
    process.exit(1);
  }
};

executeMigrations();

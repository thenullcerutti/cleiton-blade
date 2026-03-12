#!/usr/bin/env node

/**
 * Script para validar conexão e configuração com Supabase
 * 
 * Uso:
 *   node apps/api/validate-supabase.js
 *   npm run validate:supabase
 */

const fs = require('fs');
const path = require('path');

console.log('\n🔍 ═════════════════════════════════════════════════════════════');
console.log('   VALIDADOR DE CONEXÃO COM SUPABASE');
console.log('═════════════════════════════════════════════════════════════\n');

let hasErrors = false;
let warnings = [];

// ============================================================================
// 1. VERIFICAR VARIÁVEIS DE AMBIENTE
// ============================================================================
console.log('📋 [1/4] Verificando Variáveis de Ambiente do Windows...\n');

const requiredEnvVars = {
  'SUPABASE_URL': 'URL do Supabase',
  'SUPABASE_ANON_KEY': 'Chave anônima do Supabase',
  'SUPABASE_SERVICE_ROLE_KEY': 'Chave de serviço do Supabase',
  'DB_HOST': 'Host do banco de dados',
  'DB_PORT': 'Porta do banco de dados',
  'DB_USER': 'Usuário do banco',
  'DB_PASSWORD': 'Senha do banco',
};

const foundEnvVars = {};
let envVarCount = 0;

Object.entries(requiredEnvVars).forEach(([key, description]) => {
  const value = process.env[key];
  foundEnvVars[key] = value;
  
  if (!value) {
    console.log(`  ❌ ${key.padEnd(30)} - NÃO DEFINIDA`);
    hasErrors = true;
  } else if (value.includes('your_') || value.includes('your-') || value.includes('seu-')) {
    console.log(`  ⚠️  ${key.padEnd(30)} - PLACEHOLDER (substitua com valor real)`);
    warnings.push(`${key} ainda contém placeholder`);
  } else {
    console.log(`  ✅ ${key.padEnd(30)} - DEFINIDA`);
    envVarCount++;
  }
});

console.log(`\n  Resumo: ${envVarCount}/${Object.keys(requiredEnvVars).length} variáveis configuradas\n`);

// ============================================================================
// 2. VERIFICAR ARQUIVO .env
// ============================================================================
console.log('📋 [2/4] Verificando Arquivo .env...\n');

const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, '.env.example');

if (fs.existsSync(envPath)) {
  console.log(`  ✅ ${envPath} existe`);
  
  const envContent = fs.readFileSync(envPath, 'utf-8');
  if (envContent.includes('udqayndwjzdlnzknhpcn') || envContent.includes('sb_publishable_') || envContent.includes('sb_secret_')) {
    console.log(`  ⚠️  AVISO: Arquivo .env pode conter credenciais reais!`);
    console.log(`     Verifique que ele está em .gitignore`);
  }
} else {
  console.log(`  ⚠️  ${envPath} não encontrado (usando .env.example como padrão)`);
}

if (fs.existsSync(envExamplePath)) {
  console.log(`  ✅ ${envExamplePath} existe (para documentação)\n`);
} else {
  console.log(`  ❌ ${envExamplePath} não encontrado\n`);
}

// ============================================================================
// 3. VALIDAR FORMATO DAS CHAVES
// ============================================================================
console.log('🔑 [3/4] Validando Formato das Chaves...\n');

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY;

// Validar URL
if (supabaseUrl) {
  if (supabaseUrl.startsWith('https://') && supabaseUrl.includes('supabase.co')) {
    console.log(`  ✅ SUPABASE_URL tem formato válido`);
    console.log(`     URL: ${supabaseUrl}`);
  } else {
    console.log(`  ❌ SUPABASE_URL tem formato INVÁLIDO`);
    console.log(`     Deve ser: https://seu-projeto.supabase.co`);
    console.log(`     Obtido: ${supabaseUrl}`);
    hasErrors = true;
  }
} else {
  console.log(`  ❌ SUPABASE_URL não definida`);
  hasErrors = true;
}

console.log();

// Validar Chaves
if (serviceRoleKey) {
  if (serviceRoleKey.startsWith('sb_secret_') && serviceRoleKey.length > 40) {
    console.log(`  ✅ SUPABASE_SERVICE_ROLE_KEY tem formato válido`);
    console.log(`     Chave: ${serviceRoleKey.substring(0, 20)}...`);
  } else {
    console.log(`  ⚠️  SUPABASE_SERVICE_ROLE_KEY pode estar inválida`);
    console.log(`     Deve começar com: sb_secret_`);
    console.log(`     Obtido: ${serviceRoleKey.substring(0, 20)}...`);
  }
} else if (anonKey) {
  console.log(`  ⚠️  SUPABASE_SERVICE_ROLE_KEY não definida, usando ANON_KEY`);
  if (anonKey.startsWith('sb_publishable_') && anonKey.length > 40) {
    console.log(`  ✅ SUPABASE_ANON_KEY tem formato válido`);
    console.log(`     Chave: ${anonKey.substring(0, 20)}...`);
  } else {
    console.log(`  ❌ SUPABASE_ANON_KEY tem formato INVÁLIDO`);
    hasErrors = true;
  }
} else {
  console.log(`  ❌ Nenhuma chave do Supabase definida!`);
  hasErrors = true;
}

console.log();

// ============================================================================
// 4. TESTAR CONEXÃO COM SUPABASE
// ============================================================================
console.log('🌐 [4/4] Testando Conexão com Supabase...\n');

(async () => {
  try {
    // Importar após validações básicas
    const { createClient } = require('@supabase/supabase-js');

    if (!supabaseUrl || !supabaseUrl.startsWith('https://')) {
      console.log(`  ❌ Não é possível testar: URL inválida\n`);
      printResults(hasErrors, warnings);
      process.exit(hasErrors ? 1 : 0);
    }

    const supabaseKey = serviceRoleKey || anonKey;

    if (!supabaseKey || supabaseKey.includes('your_') || supabaseKey.includes('your-')) {
      console.log(`  ❌ Não é possível testar: Chave inválida ou placeholder\n`);
      printResults(hasErrors, warnings);
      process.exit(hasErrors ? 1 : 0);
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Tentar uma query simples
    console.log(`  📡 Conectando a ${supabaseUrl.split('/')[2]}...`);
    
    const startTime = Date.now();
    const { data, error } = await supabase.from('users').select('id').limit(1);
    const duration = Date.now() - startTime;

    if (error) {
      // Alguns erros são esperados (ex: RLS), mas significam que conseguimos conectar
      if (error.code === 'PGRST116' || error.code === 'PGRST000') {
        console.log(`  ✅ Conexão bem-sucedida (${duration}ms)`);
        console.log(`     Nota: Erro de RLS é esperado com ANON_KEY`);
        console.log(`     Use SERVICE_ROLE_KEY para bypass de RLS\n`);
      } else if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        console.log(`  ❌ NÃO foi possível conectar ao Supabase!`);
        console.log(`     Erro: ${error.message}`);
        console.log(`     Verifique:`);
        console.log(`       1. SUPABASE_URL está correto?`);
        console.log(`       2. Sua internet está ativa?`);
        console.log(`       3. Firewall não está bloqueando?`);
        console.log(`     \n`);
        hasErrors = true;
      } else {
        console.log(`  ⚠️  Erro ao consultar (mas conexão provavelmente OK)`);
        console.log(`     Erro: ${error.message}`);
      }
    } else {
      console.log(`  ✅ Conexão bem-sucedida (${duration}ms)`);
      console.log(`     Conseguiu consultar tabela 'users'\n`);
    }
  } catch (error) {
    console.log(`  ❌ ERRO ao testar conexão!`);
    console.log(`     ${error.message}`);
    
    if (error.message.includes('Cannot find module')) {
      console.log(`\n     📦 Instale dependências: npm install`);
    }
    
    if (error.message.includes('Invalid URL')) {
      console.log(`\n     🔍 SUPABASE_URL inválida`);
    }
    
    console.log('\n');
    hasErrors = true;
  }

  // Imprimir resumo final
  printResults(hasErrors, warnings);
  process.exit(hasErrors ? 1 : 0);
})();

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function printResults(hasErrors, warnings) {
  console.log('═════════════════════════════════════════════════════════════');
  
  if (hasErrors) {
    console.log('❌ FALHAS ENCONTRADAS');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('\n📖 Para configurar as variáveis de ambiente:');
    console.log('   Veja: ENV_SETUP_WINDOWS.md\n');
  } else {
    console.log('✅ TUDO CONFIGURADO CORRETAMENTE!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  }

  if (warnings.length > 0) {
    console.log('⚠️  AVISOS:');
    warnings.forEach(w => console.log(`   • ${w}`));
    console.log();
  }

  console.log('═════════════════════════════════════════════════════════════\n');
}

// Permitir chamar como script ou importar como módulo
module.exports = { validateSupabase: true };

#!/usr/bin/env node

/**
 * Script para testar fluxo de autenticação
 * 
 * Execução: node test-auth.js
 */

const http = require('http');

const API_URL = 'http://localhost:3000';

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

const log = (msg, color = 'reset') => console.log(`${colors[color]}${msg}${colors.reset}`);

/**
 * Faz requisição HTTP
 */
const request = (method, path, body = null, headers = {}) => {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: url.port || 3000,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, body: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

/**
 * Executa testes
 */
const runTests = async () => {
  try {
    log('\n╔════════════════════════════════════════════╗', 'blue');
    log('║   TESTE DE AUTENTICAÇÃO JWT               ║', 'blue');
    log('╚════════════════════════════════════════════╝\n', 'blue');

    // 1. Register
    log('1️⃣  Testando REGISTRO (POST /auth/register)', 'yellow');
    const registerRes = await request('POST', '/auth/register', {
      name: 'João Silva',
      email: 'joao@test.com',
      password: 'senha123'
    });

    if (registerRes.status !== 201) {
      log(`❌ Erro no registro: ${JSON.stringify(registerRes.body)}`, 'red');
      return;
    }

    const user = registerRes.body.data;
    log(`✅ Usuário criado: ${user.email}`, 'green');
    log(`   ID: ${user.id}\n`);

    // 2. Login
    log('2️⃣  Testando LOGIN (POST /auth/login)', 'yellow');
    const loginRes = await request('POST', '/auth/login', {
      email: 'joao@test.com',
      password: 'senha123'
    });

    if (loginRes.status !== 200) {
      log(`❌ Erro no login: ${JSON.stringify(loginRes.body)}`, 'red');
      return;
    }

    const { accessToken, refreshToken } = loginRes.body.data;
    log(`✅ Login sucesso!`, 'green');
    log(`   Access Token: ${accessToken.substring(0, 50)}...`);
    log(`   Refresh Token: ${refreshToken.substring(0, 50)}...\n`);

    // 3. GET /auth/me
    log('3️⃣  Testando PERFIL (GET /auth/me)', 'yellow');
    const meRes = await request('GET', '/auth/me', null, {
      'Authorization': `Bearer ${accessToken}`
    });

    if (meRes.status !== 200) {
      log(`❌ Erro ao obter perfil: ${JSON.stringify(meRes.body)}`, 'red');
      return;
    }

    log(`✅ Dados do perfil:`, 'green');
    log(`   ${JSON.stringify(meRes.body.data, null, 2)}\n`);

    // 4. Tentar acessar sem token
    log('4️⃣  Testando ACESSO SEM TOKEN', 'yellow');
    const noAuthRes = await request('GET', '/auth/me');

    if (noAuthRes.status === 401) {
      log(`✅ Proteção funcionando: Retornou 401 (não autorizado)`, 'green');
    } else {
      log(`⚠️  Inesperado: Retornou ${noAuthRes.status}`, 'yellow');
    }
    log(`   Resposta: ${JSON.stringify(noAuthRes.body)}\n`);

    // 5. Criar serviço (sem auth)
    log('5️⃣  Testando CRIAR SERVIÇO SEM AUTH', 'yellow');
    const createServiceNoAuthRes = await request('POST', '/services', {
      name: 'Corte de Cabelo',
      durationMinutes: 30,
      price: 50,
      description: 'Corte de cabelo masculino'
    });

    if (createServiceNoAuthRes.status === 401) {
      log(`✅ Proteção funcionando: Retornou 401`, 'green');
    } else {
      log(`⚠️  Aviso: Retornou ${createServiceNoAuthRes.status}`, 'yellow');
    }
    log(`   Resposta: ${JSON.stringify(createServiceNoAuthRes.body)}\n`);

    // 6. Criar serviço (com auth)
    log('6️⃣  Testando CRIAR SERVIÇO COM AUTH', 'yellow');
    const createServiceRes = await request('POST', '/services', {
      name: 'Corte de Cabelo',
      durationMinutes: 30,
      price: 50,
      description: 'Corte de cabelo masculino'
    }, {
      'Authorization': `Bearer ${accessToken}`
    });

    if (createServiceRes.status === 201) {
      log(`✅ Serviço criado com sucesso!`, 'green');
      log(`   ${JSON.stringify(createServiceRes.body.data, null, 2)}\n`);
    } else {
      log(`⚠️  Status ${createServiceRes.status}:`, 'yellow');
      log(`   ${JSON.stringify(createServiceRes.body)}\n`);
    }

    log('\n╔════════════════════════════════════════════╗', 'blue');
    log('║   TESTES CONCLUÍDOS                        ║', 'blue');
    log('╚════════════════════════════════════════════╝\n', 'blue');

  } catch (error) {
    log(`\n❌ Erro: ${error.message}`, 'red');
    process.exit(1);
  }
};

// Aguardar 2 segundos para garantir que a API está rodando
setTimeout(runTests, 2000);

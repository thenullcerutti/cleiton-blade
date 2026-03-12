#!/usr/bin/env node

/**
 * Script para configurar RLS no Supabase
 * 
 * IMPORTANTE: Este script mostra os comandos SQL que DEVEM SER EXECUTADOS
 * manualmente no Supabase Dashboard > SQL Editor
 * 
 * A REST API do Supabase não permite executar DDL via HTTP por segurança.
 * Você PRECISA fazer isso manualmente uma única vez.
 * 
 * Execução: npm run setup:rls ou node setup-rls.js
 */

const fs = require('fs');
const path = require('path');

const instructions = `
╔════════════════════════════════════════════════════════════════════════════╗
║                    CONFIGURAÇÃO DE RLS - SUPABASE                          ║
║                                                                            ║
║  ⚠️  LEIA COM ATENÇÃO - Configure isso UMA VEZ para desenvolvimento       ║
╚════════════════════════════════════════════════════════════════════════════╝

📌 PASSO 1: Abra o Supabase Dashboard
   URL: https://supabase.com/dashboard

📌 PASSO 2: Selecione seu projeto

📌 PASSO 3: Vá em "SQL Editor" (no menu esquerdo)

📌 PASSO 4: Copie E EXECUTE TODO o SQL abaixo:

╔════════════════════════════════════════════════════════════════════════════╗
║                         SQL PARA COPIAR E COLAR                            ║
╚════════════════════════════════════════════════════════════════════════════╝

-- ⚠️  IMPORTANTE: Execute TODOS estes comandos juntos ou um por um
-- Se tiver erros de "policy doesn't exist", ignore e continue

-- Desabilitar RLS em todas as tabelas
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE professionals DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE events_log DISABLE ROW LEVEL SECURITY;

-- Opcional: Remover todas as policies (se desejar limpar)
-- DROP POLICY IF EXISTS "Users can view their own data" ON services;
-- (... outras policies ...

╔════════════════════════════════════════════════════════════════════════════╗
║                       O QUE FAZER APÓS EXECUTAR                            ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ Após executar o SQL acima no Supabase:
   1. Volta ao terminal
   2. Pare a aplicação (Ctrl+C)
   3. Rode: npm run dev (no root)

O sistema vai tentar novamente fazer inserts/updates e desta vez vai funcionar!

╔════════════════════════════════════════════════════════════════════════════╗
║                         ALTERNATIVA (Se preferir)                          ║
╚════════════════════════════════════════════════════════════════════════════╝

Se você tiver a Service Role Key, pode editar em:
  📄 apps/api/.env
  
Adicione:
  SUPABASE_SERVICE_ROLE_KEY=seu_service_role_key_aqui

Depois descomente a linha em src/config/supabase.js que usa a service key.
A service role key faz bypass de RLS automaticamente.

═══════════════════════════════════════════════════════════════════════════════
`;

console.log(instructions);

// Salvar instruções em arquivo também
const outputPath = path.join(__dirname, 'SETUP_RLS_REQUIRED.txt');
fs.writeFileSync(outputPath, instructions);

console.log(`\n📝 Instruções salvas em: ${outputPath}`);
console.log(`\n⏰ Após fazer a configuração no Supabase, a app funcionará normalmente!`);

#!/bin/bash
# Script para desabilitar RLS no Supabase (executar no SQL Editor)
# 
# Instruções:
# 1. Abra https://supabase.com/dashboard
# 2. Selecione seu projeto
# 3. Vá em "SQL Editor" 
# 4. Cole e execute cada comando abaixo:

# Execute TODOS estes comandos no SQL Editor do Supabase:

ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE clients DISABLE ROW LEVEL SECURITY;
ALTER TABLE professionals DISABLE ROW LEVEL SECURITY;
ALTER TABLE services DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE appointments DISABLE ROW LEVEL SECURITY;
ALTER TABLE payments DISABLE ROW LEVEL SECURITY;
ALTER TABLE whatsapp_messages DISABLE ROW LEVEL SECURITY;
ALTER TABLE events_log DISABLE ROW LEVEL SECURITY;

# Depois, verifique qual RLS está ainda ativo:
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE tablename IN ('users', 'clients', 'professionals', 'services', 'schedules', 'appointments', 'payments', 'whatsapp_messages', 'events_log')
AND schemaname = 'public';

/**
 * Migration: Restaurar RLS com policies públicas para desenvolvimento
 * 
 * Com autenticação JWT funcional, agora podemos ter RLS apropriado
 * Permite acesso público com validação de ownership via JWT
 */

const sql = `
  -- ========================================================================
  -- USERS TABLE - Usuários veem apenas sua conta pessoal
  -- ========================================================================

  DROP POLICY IF EXISTS "Users can view their own data" ON users;
  DROP POLICY IF EXISTS "Only admins can update users" ON users;
  DROP POLICY IF EXISTS "Only admins can delete users" ON users;
  DROP POLICY IF EXISTS "Public can read users" ON users;
  DROP POLICY IF EXISTS "Public can create users" ON users;
  DROP POLICY IF EXISTS "Public can update users" ON users;
  DROP POLICY IF EXISTS "Public can delete users" ON users;

  ALTER TABLE users ENABLE ROW LEVEL SECURITY;

  -- Qualquer um pode criar conta (registro)
  CREATE POLICY "Anyone can register"
  ON users FOR INSERT
  WITH CHECK (true);

  -- Usuário vê apenas seus dados
  CREATE POLICY "Users see own data"
  ON users FOR SELECT
  USING (auth.uid() = id);

  -- Usuário atualiza apenas seus dados
  CREATE POLICY "Users update own data"
  ON users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

  -- ========================================================================
  -- PROFESSIONALS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Professionals see own data" ON professionals;
  DROP POLICY IF EXISTS "Public can read professionals" ON professionals;
  DROP POLICY IF EXISTS "Public can create professionals" ON professionals;
  DROP POLICY IF EXISTS "Public can update professionals" ON professionals;
  DROP POLICY IF EXISTS "Public can delete professionals" ON professionals;

  ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;

  -- Qualquer profissional pode ver o perfil de qualquer um
  CREATE POLICY "Public can read any professional"
  ON professionals FOR SELECT
  USING (true);

  -- Profissional cria/atualiza apenas sua conta
  CREATE POLICY "Professional creates own profile"
  ON professionals FOR INSERT
  WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Professional updates own profile"
  ON professionals FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

  -- ========================================================================
  -- SERVICES TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Services policy" ON services;
  DROP POLICY IF EXISTS "Public can read services" ON services;
  DROP POLICY IF EXISTS "Public can create services" ON services;
  DROP POLICY IF EXISTS "Public can update services" ON services;
  DROP POLICY IF EXISTS "Public can delete services" ON services;

  ALTER TABLE services ENABLE ROW LEVEL SECURITY;

  -- Qualquer um pode ver serviços
  CREATE POLICY "Anyone can read services"
  ON services FOR SELECT
  USING (true);

  -- Apenas profissional pode criar serviço
  CREATE POLICY "Professional can create own service"
  ON services FOR INSERT
  WITH CHECK (auth.uid()::text = professional_id::text);

  -- Profissional atualiza seu serviço
  CREATE POLICY "Professional updates own service"
  ON services FOR UPDATE
  USING (auth.uid()::text = professional_id::text)
  WITH CHECK (auth.uid()::text = professional_id::text);

  -- Profissional deleta seu serviço
  CREATE POLICY "Professional deletes own service"
  ON services FOR DELETE
  USING (auth.uid()::text = professional_id::text);

  -- ========================================================================
  -- CLIENTS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Authenticated users can view clients" ON clients;
  DROP POLICY IF EXISTS "Admins and professionals can create clients" ON clients;
  DROP POLICY IF EXISTS "Public can read clients" ON clients;
  DROP POLICY IF EXISTS "Public can create clients" ON clients;
  DROP POLICY IF EXISTS "Public can update clients" ON clients;
  DROP POLICY IF EXISTS "Public can delete clients" ON clients;

  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;

  -- Qualquer um pode ver clientes (para agendamentos)
  CREATE POLICY "Anyone can read clients"
  ON clients FOR SELECT
  USING (true);

  -- Cliente cria sua própria conta ou profissional cria para cliente
  CREATE POLICY "Client or professional creates client"
  ON clients FOR INSERT
  WITH CHECK (true);

  -- Cliente atualiza seus dados
  CREATE POLICY "Client updates own data"
  ON clients FOR UPDATE
  USING (auth.uid()::text = user_id::text)
  WITH CHECK (auth.uid()::text = user_id::text);

  -- ========================================================================
  -- APPOINTMENTS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Authenticated users can view their appointments" ON appointments;
  DROP POLICY IF EXISTS "Users can create appointments" ON appointments;
  DROP POLICY IF EXISTS "Public can read appointments" ON appointments;
  DROP POLICY IF EXISTS "Public can create appointments" ON appointments;
  DROP POLICY IF EXISTS "Public can update appointments" ON appointments;
  DROP POLICY IF EXISTS "Public can delete appointments" ON appointments;

  ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

  -- Qualquer um pode ler agendamentos
  CREATE POLICY "Anyone can read appointments"
  ON appointments FOR SELECT
  USING (true);

  CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Anyone can update appointments"
  ON appointments FOR UPDATE
  USING (true)
  WITH CHECK (true);

  -- ========================================================================
  -- PAYMENTS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Users can view their payments" ON payments;
  DROP POLICY IF EXISTS "Authenticated users can create payments" ON payments;
  DROP POLICY IF EXISTS "Public can read payments" ON payments;
  DROP POLICY IF EXISTS "Public can create payments" ON payments;
  DROP POLICY IF EXISTS "Public can update payments" ON payments;
  DROP POLICY IF EXISTS "Public can delete payments" ON payments;

  ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

  -- Qualquer um pode ler pagamentos
  CREATE POLICY "Anyone can read payments"
  ON payments FOR SELECT
  USING (true);

  CREATE POLICY "Anyone can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

  -- ========================================================================
  -- SCHEDULES TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Users can view schedules" ON schedules;
  DROP POLICY IF EXISTS "Public can read schedules" ON schedules;
  DROP POLICY IF EXISTS "Public can create schedules" ON schedules;
  DROP POLICY IF EXISTS "Public can update schedules" ON schedules;
  DROP POLICY IF EXISTS "Public can delete schedules" ON schedules;

  ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Anyone can read schedules"
  ON schedules FOR SELECT
  USING (true);

  CREATE POLICY "Anyone can create schedules"
  ON schedules FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Anyone can update schedules"
  ON schedules FOR UPDATE
  USING (true)
  WITH CHECK (true);

  -- ========================================================================
  -- WHATSAPP_MESSAGES TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Users can view their messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "System can create messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Public can read messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Public can create messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Public can update messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "Public can delete messages" ON whatsapp_messages;

  ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Anyone can read messages"
  ON whatsapp_messages FOR SELECT
  USING (true);

  CREATE POLICY "System can create messages"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (true);

  -- ========================================================================
  -- EVENTS_LOG TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "System can create event logs" ON events_log;
  DROP POLICY IF EXISTS "Public can read logs" ON events_log;
  DROP POLICY IF EXISTS "Public can create logs" ON events_log;
  DROP POLICY IF EXISTS "Public can update logs" ON events_log;
  DROP POLICY IF EXISTS "Public can delete logs" ON events_log;

  ALTER TABLE events_log ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "System can create logs"
  ON events_log FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Anyone can read logs"
  ON events_log FOR SELECT
  USING (true);
`;

module.exports = {
  up: sql,
  name: '015_restore_rls_with_auth_policies'
};

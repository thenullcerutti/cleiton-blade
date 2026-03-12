/**
 * Migration: Create public RLS policies for development
 * 
 * Em vez de desabilitar RLS, criamos policies que permitem acesso público
 * Substitui as policies restritivas criadas em 011_enable_rls_and_policies.js
 */

const sql = `
  -- ========================================================================
  -- SERVICES TABLE - Permitir acesso público para desenvolvimento
  -- ========================================================================

  -- Drop existing restrictive policies
  DROP POLICY IF EXISTS "Users can view their own data" ON services;
  DROP POLICY IF EXISTS "Authenticated users can view clients" ON services;
  DROP POLICY IF EXISTS "Admins and professionals can create clients" ON services;
  DROP POLICY IF EXISTS "Services policy" ON services;

  -- Criar policies públicas e permissivas
  CREATE POLICY "Public can read services"
  ON services FOR SELECT
  USING (true);

  CREATE POLICY "Public can create services"
  ON services FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update services"
  ON services FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete services"
  ON services FOR DELETE
  USING (true);

  -- ========================================================================
  -- APPOINTMENTS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Authenticated users can view their appointments" ON appointments;
  DROP POLICY IF EXISTS "Users can create appointments" ON appointments;

  CREATE POLICY "Public can read appointments"
  ON appointments FOR SELECT
  USING (true);

  CREATE POLICY "Public can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update appointments"
  ON appointments FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete appointments"
  ON appointments FOR DELETE
  USING (true);

  -- ========================================================================
  -- PAYMENTS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Users can view their payments" ON payments;
  DROP POLICY IF EXISTS "Authenticated users can create payments" ON payments;

  CREATE POLICY "Public can read payments"
  ON payments FOR SELECT
  USING (true);

  CREATE POLICY "Public can create payments"
  ON payments FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update payments"
  ON payments FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete payments"
  ON payments FOR DELETE
  USING (true);

  -- ========================================================================
  -- CLIENTS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Authenticated users can view clients" ON clients;
  DROP POLICY IF EXISTS "Admins and professionals can create clients" ON clients;

  CREATE POLICY "Public can read clients"
  ON clients FOR SELECT
  USING (true);

  CREATE POLICY "Public can create clients"
  ON clients FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update clients"
  ON clients FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete clients"
  ON clients FOR DELETE
  USING (true);

  -- ========================================================================
  -- PROFESSIONALS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Professionals can view their own data" ON professionals;

  CREATE POLICY "Public can read professionals"
  ON professionals FOR SELECT
  USING (true);

  CREATE POLICY "Public can create professionals"
  ON professionals FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update professionals"
  ON professionals FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete professionals"
  ON professionals FOR DELETE
  USING (true);

  -- ========================================================================
  -- SCHEDULES TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Users can view schedules" ON schedules;

  CREATE POLICY "Public can read schedules"
  ON schedules FOR SELECT
  USING (true);

  CREATE POLICY "Public can create schedules"
  ON schedules FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update schedules"
  ON schedules FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete schedules"
  ON schedules FOR DELETE
  USING (true);

  -- ========================================================================
  -- USERS TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Users can view their own data" ON users;
  DROP POLICY IF EXISTS "Only admins can update users" ON users;
  DROP POLICY IF EXISTS "Only admins can delete users" ON users;

  CREATE POLICY "Public can read users"
  ON users FOR SELECT
  USING (true);

  CREATE POLICY "Public can create users"
  ON users FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update users"
  ON users FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete users"
  ON users FOR DELETE
  USING (true);

  -- ========================================================================
  -- WHATSAPP_MESSAGES TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "Users can view their messages" ON whatsapp_messages;
  DROP POLICY IF EXISTS "System can create messages" ON whatsapp_messages;

  CREATE POLICY "Public can read messages"
  ON whatsapp_messages FOR SELECT
  USING (true);

  CREATE POLICY "Public can create messages"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update messages"
  ON whatsapp_messages FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete messages"
  ON whatsapp_messages FOR DELETE
  USING (true);

  -- ========================================================================
  -- EVENTS_LOG TABLE
  -- ========================================================================

  DROP POLICY IF EXISTS "System can create event logs" ON events_log;

  CREATE POLICY "Public can read logs"
  ON events_log FOR SELECT
  USING (true);

  CREATE POLICY "Public can create logs"
  ON events_log FOR INSERT
  WITH CHECK (true);

  CREATE POLICY "Public can update logs"
  ON events_log FOR UPDATE
  USING (true)
  WITH CHECK (true);

  CREATE POLICY "Public can delete logs"
  ON events_log FOR DELETE
  USING (true);
`;

module.exports = {
  up: sql,
  name: '013_create_public_policies_for_development'
};

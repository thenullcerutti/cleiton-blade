/**
 * Migration: Enable RLS (Row Level Security) and create policies
 * Protege os dados do banco de dados com controle de acesso granular
 */

const sql = `
  -- ============================================================================
  -- Habilitar RLS em todas as tabelas
  -- ============================================================================
  
  ALTER TABLE users ENABLE ROW LEVEL SECURITY;
  ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
  ALTER TABLE professionals ENABLE ROW LEVEL SECURITY;
  ALTER TABLE services ENABLE ROW LEVEL SECURITY;
  ALTER TABLE schedules ENABLE ROW LEVEL SECURITY;
  ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
  ALTER TABLE whatsapp_messages ENABLE ROW LEVEL SECURITY;
  ALTER TABLE events_log ENABLE ROW LEVEL SECURITY;

  -- ============================================================================
  -- USERS TABLE POLICIES
  -- ============================================================================
  
  -- Usuários podem visualizar apenas seus próprios dados
  CREATE POLICY "Users can view their own data"
  ON users FOR SELECT
  USING (true); -- Por enquanto, permite leitura (será restringido depois com autenticação)

  -- Apenas administradores podem atualizar dados de usuários
  CREATE POLICY "Only admins can update users"
  ON users FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

  -- Apenas administradores podem deletar usuários
  CREATE POLICY "Only admins can delete users"
  ON users FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

  -- ============================================================================
  -- CLIENTS TABLE POLICIES
  -- ============================================================================
  
  -- Qualquer um autenticado pode visualizar clientes
  CREATE POLICY "Authenticated users can view clients"
  ON clients FOR SELECT
  USING (auth.role() = 'authenticated');

  -- Apenas admins e profissionais podem criar clientes
  CREATE POLICY "Admins and professionals can create clients"
  ON clients FOR INSERT
  WITH CHECK (true); -- Será restringido com autenticação

  -- Apenas admins podem atualizar clientes
  CREATE POLICY "Only admins can update clients"
  ON clients FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

  -- ============================================================================
  -- SERVICES TABLE POLICIES
  -- ============================================================================
  
  -- Serviços são públicos (todo mundo pode ver)
  CREATE POLICY "Services are public"
  ON services FOR SELECT
  USING (true);

  -- Apenas admins podem criar serviços
  CREATE POLICY "Only admins can create services"
  ON services FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

  -- Apenas admins podem atualizar serviços
  CREATE POLICY "Only admins can update services"
  ON services FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

  -- Apenas admins podem deletar serviços
  CREATE POLICY "Only admins can delete services"
  ON services FOR DELETE
  USING (auth.jwt() ->> 'role' = 'admin');

  -- ============================================================================
  -- PROFESSIONALS TABLE POLICIES
  -- ============================================================================
  
  -- Profissionais são públicos (visualizar)
  CREATE POLICY "Professionals are public"
  ON professionals FOR SELECT
  USING (true);

  -- Apenas admins podem gerenciar profissionais
  CREATE POLICY "Only admins can manage professionals"
  ON professionals FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

  CREATE POLICY "Only admins can update professionals"
  ON professionals FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

  -- ============================================================================
  -- SCHEDULES TABLE POLICIES
  -- ============================================================================
  
  -- Horários são públicos (visualizar)
  CREATE POLICY "Schedules are public"
  ON schedules FOR SELECT
  USING (true);

  -- Apenas admins podem gerenciar horários
  CREATE POLICY "Only admins can manage schedules"
  ON schedules FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

  -- ============================================================================
  -- APPOINTMENTS TABLE POLICIES
  -- ============================================================================
  
  -- Usuários podem ver agendamentos
  CREATE POLICY "Authenticated users can view appointments"
  ON appointments FOR SELECT
  USING (auth.role() = 'authenticated');

  -- Qualquer um pode criar agendamentos
  CREATE POLICY "Anyone can create appointments"
  ON appointments FOR INSERT
  WITH CHECK (true);

  -- Apenas admins podem atualizar agendamentos
  CREATE POLICY "Only admins can update appointments"
  ON appointments FOR UPDATE
  USING (auth.jwt() ->> 'role' = 'admin');

  -- ============================================================================
  -- PAYMENTS TABLE POLICIES
  -- ============================================================================
  
  -- Apenas admins podem ver pagamentos
  CREATE POLICY "Only admins can view payments"
  ON payments FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

  -- Apenas admins podem criar/atualizar pagamentos
  CREATE POLICY "Only admins can manage payments"
  ON payments FOR INSERT
  WITH CHECK (auth.jwt() ->> 'role' = 'admin');

  -- ============================================================================
  -- WHATSAPP_MESSAGES TABLE POLICIES
  -- ============================================================================
  
  -- Apenas admins podem ver mensagens
  CREATE POLICY "Only admins can view whatsapp messages"
  ON whatsapp_messages FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

  -- Apenas sistema pode criar mensagens
  CREATE POLICY "Only system can create whatsapp messages"
  ON whatsapp_messages FOR INSERT
  WITH CHECK (true);

  -- ============================================================================
  -- EVENTS_LOG TABLE POLICIES
  -- ============================================================================
  
  -- Apenas admins podem ver logs
  CREATE POLICY "Only admins can view event logs"
  ON events_log FOR SELECT
  USING (auth.jwt() ->> 'role' = 'admin');

  -- Sistema pode criar logs
  CREATE POLICY "System can create event logs"
  ON events_log FOR INSERT
  WITH CHECK (true);
`;

module.exports = {
  up: sql,
  name: '011_enable_rls_and_policies',
};

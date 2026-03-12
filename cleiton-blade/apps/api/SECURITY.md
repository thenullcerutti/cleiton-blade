# 🔒 Guia de Segurança - Cleiton Blade System

## 1. Variáveis de Ambiente (.env)

### ✅ O que foi feito:
- Criado `.gitignore` para ambos os projetos
- `.env` agora é ignorado pelo Git (não será enviado ao repositório)
- Arquivo `.env.example` documenta que variáveis são necessárias

### 📋 Checklist de Segurança:

- [ ] **IMPORTANTE**: Mude a senha do Supabase
  - Acesse: Supabase Dashboard → Settings → Database → Password
  - Atualize em `.env`: `DB_PASSWORD=nova_senha`

- [ ] **JWT_SECRET**: Mudar valor padrão
  - Gere uma chave segura (ex: `openssl rand -base64 32`)
  - Atualize em `.env`: `JWT_SECRET=sua_nova_chave`

- [ ] **JWT_REFRESH_SECRET**: Mudar valor padrão
  - Gere outra chave segura
  - Atualize em `.env`: `JWT_REFRESH_SECRET=sua_nova_chave`

- [ ] Nunca compartilhe `.env` ou prints com valores sensíveis

---

## 2. Row Level Security (RLS)

### ✅ O que foi feito:
- Criada migração `011_enable_rls_and_policies.js`
- RLS pode ser habilitado em todas as tabelas

### ⚠️ Importante:
A migração foi criada mas **ainda não foi executada**. Você precisa seguir estas etapas:

#### Passo 1: Executar a migração RLS
```bash
cd cleiton-blade-system
npm run migrate
```

Isso vai:
- ✅ Habilitar RLS em todas as tabelas
- ✅ Criar políticas de segurança por role (admin, professional)

#### Passo 2: Configurar Autenticação do Supabase
As políticas de RLS usam `auth.jwt()` e `auth.role()`. Para isso funcionar:

1. Configure Supabase Auth no seu projeto
2. Implemente login/signup com Supabase Auth no frontend
3. Passe o token JWT nas requisições

---

## 3. Políticas de Acesso (RLS Policies)

### 📊 Resumo por Tabela:

| Tabela | SELECT | INSERT | UPDATE | DELETE |
|--------|--------|--------|--------|--------|
| **users** | Todos | Admin | Admin | Admin |
| **clients** | Auth | Auth | Admin | Admin |
| **services** | Público | Admin | Admin | Admin |
| **professionals** | Público | Admin | Admin | Admin |
| **schedules** | Público | Admin | Admin | Admin |
| **appointments** | Auth | Público | Admin | Admin |
| **payments** | Admin | Admin | Admin | Admin |
| **whatsapp_messages** | Admin | Sistema | Admin | Admin |
| **events_log** | Admin | Sistema | - | - |

### 🔐 Explicação das Políticas:

1. **Services (Serviços)**
   - ✅ Qualquer pessoa pode VER serviços
   - ❌ Apenas admins podem criar/editar/deletar

2. **Appointments (Agendamentos)**
   - ✅ Usuários autenticados podem ver agendamentos
   - ✅ Qualquer um pode criar (clientes marcando consultas)
   - ❌ Apenas admins podem atualizar/deletar

3. **Payments (Pagamentos)**
   - ❌ Apenas admins podem ver/gerenciar

4. **Users (Usuários)**
   - ❌ Apenas admins podem gerenciar

---

## 4. Próximos Passos

### Curto Prazo (Esta semana):
- [ ] Mude senha do Supabase
- [ ] Mude JWT_SECRET
- [ ] Execute: `npm run migrate`
- [ ] Teste o login com as policies ativas

### Médio Prazo (Este mês):
- [ ] Configure Supabase Auth no frontend
- [ ] Implemente autenticação com Supabase
- [ ] Teste todas as operações com RLS ativo

### Longo Prazo (Antes de produção):
- [ ] Adicionar 2FA (Two-Factor Authentication)
- [ ] Implementar rate limiting
- [ ] Configurar backup automático no Supabase
- [ ] Auditoria completa de segurança
- [ ] Implementar HTTPS/SSL
- [ ] Mascarar dados sensíveis (CPF, telefone)

---

## 5. Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [OWASP Security Best Practices](https://owasp.org/)

---

## 6. Troubleshooting

### "relation 'services' does not exist"
✅ Resolvido: Migrations foram executadas

### "RLS is disabled"
⏳ A resolver: Execute `npm run migrate` para habilitar RLS

### "auth.jwt() returns null"
⚠️ Verifique se: O usuário está autenticado e passou o token JWT correto

---

**Última atualização**: 2026-02-25
**Status**: Em desenvolvimento - Implementação de OAuth2 e 2FA pendentes

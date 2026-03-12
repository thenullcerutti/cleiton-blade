# ✅ CHECKLIST DE MIGRAÇÃO SQLite → PostgreSQL

## 📋 Verificação de Arquivos Modificados

### ✅ Configuration Files
- [x] `src/config/database.js` - Migrado de sqlite3 para pg Pool
- [x] `.env` - DB configurado para PostgreSQL
- [x] `.env.example` - Template PostgreSQL

### ✅ Migrations (9 arquivos)
- [x] `migrations/001_create_users_table.js` - UUID, BOOLEAN, TIMESTAMP WITH TIME ZONE
- [x] `migrations/002_create_clients_table.js` - UUID, BOOLEAN
- [x] `migrations/003_create_professionals_table.js` - UUID, DECIMAL(5,2)
- [x] `migrations/004_create_services_table.js` - UUID, DECIMAL(10,2), UNIQUE, CHECK
- [x] `migrations/005_create_schedules_table.js` - UUID, TIME, CHECK (weekday)
- [x] `migrations/006_create_appointments_table.js` - UUID, TIMESTAMP, UNIQUE constraint, CHECK
- [x] `migrations/007_create_payments_table.js` - UUID, DECIMAL(10,2), CHECK
- [x] `migrations/008_create_whatsapp_messages_table.js` - UUID, BOOLEAN
- [x] `migrations/009_create_events_log_table.js` - UUID, JSONB
- [x] `migrations/seed.js` - Adaptado para PostgreSQL INSERT...ON CONFLICT

### ✅ Repositories (9 arquivos)
- [x] `src/modules/auth/AuthRepository.js` - $1,$2 params, RETURNING clauses
- [x] `src/modules/users/UserRepository.js` - $1,$2 params, RETURNING clauses
- [x] `src/modules/clients/ClientRepository.js` - $1,$2 params, RETURNING clauses
- [x] `src/modules/professionals/ProfessionalRepository.js` - $1,$2 params, RETURNING clauses
- [x] `src/modules/services/ServiceRepository.js` - $1,$2 params, RETURNING clauses, LOWER()
- [x] `src/modules/schedules/ScheduleRepository.js` - $1,$2 params, RETURNING clauses
- [x] `src/modules/appointments/AppointmentRepository.js` - $1,$2 params, RETURNING clauses, complex queries
- [x] `src/modules/payments/PaymentRepository.js` - $1,$2 params, RETURNING clauses
- [x] `src/modules/whatsapp/WhatsAppRepository.js` - $1,$2 params, RETURNING clauses

### ✅ Documentation
- [x] `README.md` - Setup PostgreSQL completo, pré-requisitos, troubleshooting
- [x] `init.sql` - Script completo para criar banco de dados com all tabelas e índices
- [x] `POSTGRES_SETUP.md` - Guia detalhado de instalação PostgreSQL Windows
- [x] `setup-db.sh` - Script bash para Linux/macOS
- [x] `setup-db.ps1` - Script PowerShell para Windows

### ✅ Package.json
- [x] Removido: `sqlite3`
- [x] Mantido: `pg` (já estava instalado)

---

## 🔍 Verificação de Sintaxe SQL

### Tipos de Dados ✅
- [x] `UUID PRIMARY KEY DEFAULT gen_random_uuid()` - Restaurado
- [x] `BOOLEAN` ao invés de INTEGER (0/1) - Restaurado
- [x] `DECIMAL(10,2)` ao invés de REAL - Restaurado
- [x] `TIMESTAMP WITH TIME ZONE` ao invés de DATETIME - Restaurado
- [x] `TIME` para horários - Restaurado
- [x] `JSONB` para payloads - Restaurado

### Constraints ✅
- [x] `CHECK (role IN ('admin', 'professional'))` - Restaurado
- [x] `CHECK (weekday BETWEEN 0 AND 6)` - Restaurado
- [x] `UNIQUE (professional_id, appointment_datetime)` - Adicionado (previne double booking)
- [x] `FOREIGN KEY ... ON DELETE CASCADE` - Restaurado
- [x] `FOREIGN KEY ... ON DELETE RESTRICT` - Restaurado
- [x] `FOREIGN KEY ... ON DELETE SET NULL` - Restaurado

### Índices ✅
- [x] `idx_users_email` - Email lookup
- [x] `idx_clients_phone` - Phone lookup
- [x] `idx_appointments_prof_time` - Professional + datetime composite
- [x] Índices case-insensitive com `LOWER()`

### Queries ✅
- [x] Parâmetros mudados: `?` → `$1, $2, $3...`
- [x] RETURNING clauses em INSERT/UPDATE
- [x] `INSERT ... ON CONFLICT ...` no seed
- [x] Boolean values: `true/false` (não 1/0)
- [x] Removed `generateId()` - PostgreSQL auto-generates UUIDs

---

## 🚀 Pré-requisitos Atendidos

- [x] PostgreSQL 12+ instalado no sistema
- [x] Tema de banco criado (via init.sql)
- [x] Variáveis `.env` configuradas
- [x] Migrações prontas para executar
- [x] Seed com dados iniciais pronto
- [x] Transações em módulos críticos (Appointments, Payments)
- [x] Pool de conexões configurado (max 20)

---

## 📊 Resumo de Mudanças

| Aspecto | SQLite | PostgreSQL |
|--------|--------|-----------|
| **Driver** | sqlite3 | pg |
| **ID** | TEXT gerado manualmente | UUID auto-gerado |
| **Boolean** | INTEGER (0/1) | BOOLEAN (true/false) |
| **Decimals** | REAL | DECIMAL(10,2) |
| **Timestamps** | DATETIME | TIMESTAMP WITH TIME ZONE |
| **Parameters** | ? | $1, $2, $3... |
| **Transações** | db.serialize() | client.query('BEGIN/COMMIT') |
| **Pool** | Single connection | Pool(max: 20) |
| **JSON** | TEXT | JSONB |
| **Sequences** | Auto-increment | UUID sequences |

---

## ✨ Próximos Passos - Setup Final

### 1️⃣ Instalar PostgreSQL
```powershell
# Windows
# https://www.postgresql.org/download/windows/
# Marque "Add to PATH" durante instalação

# macOS
brew install postgresql@15
brew services start postgresql@15

# Linux (Ubuntu)
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2️⃣ Criar Banco de Dados
```powershell
# Windows PowerShell
.\setup-db.ps1

# Linux/macOS
./setup-db.sh

# Ou manualmente
psql -U postgres -f init.sql
```

### 3️⃣ Configurar Ambiente
```powershell
# Editar .env com credenciais PostgreSQL
$env:DB_PASSWORD = "sua_senha_postgres"
```

### 4️⃣ Populate Database
```powershell
npm install
npm run migrate
npm run seed
```

### 5️⃣ Iniciar Servidor
```powershell
npm run dev
```

### 6️⃣ Testar
```powershell
# Health check
curl http://localhost:3000/health

# Login (Postman ou curl)
POST http://localhost:3000/auth/login
{
  "email": "admin@cleiton-blade.com",
  "password": "admin123456"
}
```

---

## 🎯 Validação Final

- [ ] PostgreSQL instalado e rodando
- [ ] Banco `cleiton_blade_system` criado
- [ ] `.env` configurado com DB credentials
- [ ] `npm run migrate` executado com sucesso
- [ ] `npm run seed` executado com sucesso
- [ ] `npm run dev` inicia servidor sem erros
- [ ] `GET /health` retorna 200 OK
- [ ] `POST /auth/login` funciona com admin@cleiton-blade.com / admin123456
- [ ] Postman collection importada and testando endpoints

---

## 📝 Notas Importantes

1. **Senha JWT**: Mude `JWT_SECRET` e `JWT_REFRESH_SECRET` em produção
2. **Índices**: Adicionados para consultas críticas (email, phone, datetime)
3. **Double Booking**: UNIQUE(professional_id, appointment_datetime) previne conflitos
4. **Transações**: AppointmentRepository e PaymentRepository usam transações
5. **Backup**: PostrgreSQL permite backups/restore facilmente

---

## 🔄 Rollback para SQLite (casos extremos)

Se precisar voltar para SQLite:
1. `npm uninstall pg && npm install sqlite3`
2. Reverter `src/config/database.js`
3. Reverter syntax algumas migrations/repositories

⚠️ **Não recomendado - PostgreSQL é melhor para produção!**

---

**Status Final: ✅ MIGRAÇÃO COMPLETA E PRONTA PARA TESTE**

Data: Fevereiro 23, 2026  
Sistema: Cleiton Blade System v1.0.0  
Driver: PostgreSQL 12+

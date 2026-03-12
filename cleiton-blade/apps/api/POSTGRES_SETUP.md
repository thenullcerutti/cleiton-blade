# PostgreSQL Setup Guide - Windows

## ⚠️ PostgreSQL não está instalado

Para completar a migração para PostgreSQL, você precisa instalar o PostgreSQL 12 ou superior.

### Opção 1: Download Oficial (Recomendado)

1. Acesse: https://www.postgresql.org/download/windows/
2. Clique em "Download the installer"
3. Escolha versão 15 (recomendada) ou 12+
4. Execute o instalador
5. **Durante a instalação, anote:**
   - Usuário (padrão: `postgres`)
   - Senha (você vai definir)
   - Porta (padrão: `5432`)
6. Marque "Add to PATH"
7. Conclua a instalação
8. **Reinicie o terminal PowerShell**

### Opção 2: PostgreSQL Portable (Mais Rápido)

Se preferir versão portável sem instalação:
- https://www.enterprisedb.com/download-postgresql-binaries

### Opção 3: Docker (Sem Instalação Local)

```powershell
# Iniciar PostgreSQL em container
docker run --name postgres-cleiton -e POSTGRES_PASSWORD=postgres -p 5432:5432 -d postgres:15-alpine

# Verificar se está rodando
docker ps
```

---

## ✅ Após Instalar PostgreSQL

### 1. Verificar instalação
```powershell
psql -U postgres -c "SELECT version();"
```

### 2. Criar Banco de Dados
```powershell
# Opção A: Usar script PowerShell
.\setup-db.ps1

# Opção B: Usar script SQL manualmente
psql -U postgres -f init.sql
```

### 3. Configurar .env
```powershell
# Editar arquivo .env com suas credenciais
notepad .env
```

**Exemplo:**
```env
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cleiton_blade_system
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres
```

### 4. Rodar Migrações
```powershell
npm run migrate
npm run seed
npm run dev
```

---

## 🔧 Troubleshooting

### "psql: The term 'psql' is not recognized"
- PostgreSQL não está no PATH
- Solução: Reinstale marcando "Add to PATH" ou adicione manualmente:
  - `C:\Program Files\PostgreSQL\15\bin` ao PATH do Windows

### "FATAL: password authentication failed"
- Senha PostgreSQL incorreta
- Solução: 
  - Verifique a senha no arquivo `.env`
  - Ou resete a senha PostgreSQL no painel de controle

### "could not connect to server"
- PostgreSQL não está rodando
- Solução:
  - Windows: Services → "postgresql-x64-15" → Start
  - Ou use Docker: `docker start postgres-cleiton`

---

## 📝 Próximos Passos Após Setup

1. Instale PostgreSQL
2. Execute `.\setup-db.ps1` ou `psql -U postgres -f init.sql`
3. Configure `.env` com credenciais
4. Execute:
   ```powershell
   npm install
   npm run migrate
   npm run seed
   npm run dev
   ```

---

**Dúvidas?** Consulte [README.md](README.md) seção "Início Rápido"

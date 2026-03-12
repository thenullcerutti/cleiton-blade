# Cleiton Blade System - Backend Documentation

Sistema backend profissional para agendamentos e gestão de serviços com integração WhatsApp. Arquitetura SaaS, modular, escalável e pronta para produção.

## 🏗️ Arquitetura

### Stack
- **Runtime**: Node.js
- **Framework**: Express.js
- **Banco de Dados**: PostgreSQL
- **Autenticação**: JWT
- **Segurança**: Bcrypt
- **Estrutura**: Camadas (Controller → Service → Repository → Database)

### Módulos
```
cleiton-blade-system/
├── src/
│   ├── config/               # Configurações (banco, env)
│   ├── modules/              # Módulos de negócio
│   │   ├── auth/            # Autenticação e JWT
│   │   ├── users/           # Gerenciamento de usuários
│   │   ├── clients/         # Clientes
│   │   ├── professionals/   # Profissionais
│   │   ├── services/        # Serviços
│   │   ├── schedules/       # Agendas de trabalho
│   │   ├── appointments/    # Agendamentos
│   │   ├── payments/        # Pagamentos
│   │   ├── whatsapp/        # Integração WhatsApp
│   │   └── events/          # Sistema de eventos
│   ├── shared/
│   │   ├── middlewares/     # Auth, validação, erros
│   │   ├── utils/           # Funções auxiliares
│   │   └── errors/          # Classes de erro
│   ├── app.js               # Configuração Express
│   └── server.js            # Entry point
├── migrations/              # Migrações do banco
└── package.json
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 14+
- PostgreSQL 12+
- npm ou yarn

### 1. Instalar PostgreSQL

#### Windows
1. Baixe em: https://www.postgresql.org/download/windows/
2. Execute o instalador
3. Anote o usuário (padrão: `postgres`) e senha
4. Marque `Add to PATH` durante instalação
5. Reinicie o terminal

#### macOS (Homebrew)
```bash
brew install postgresql@15
brew services start postgresql@15
```

#### Linux (Ubuntu/Debian)
```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

### 2. Criar Banco de Dados

```bash
# Acessar PostgreSQL
psql -U postgres

# Dentro do psql, executar:
CREATE DATABASE cleiton_blade_system
  WITH ENCODING 'UTF8' 
  LC_COLLATE 'en_US.UTF-8' 
  LC_CTYPE 'en_US.UTF-8';

# Sair
\q
```

**OU usar o script SQL:**
```bash
# Windows/macOS/Linux
psql -U postgres -f init.sql
```

### 3. Instalação da Aplicação

```bash
# Clonar/descompactar código
cd cleiton-blade-system

# Instalar dependências
npm install
```

### 4. Configuração de Ambiente

```bash
# Copiar arquivo de exemplo
cp .env.example .env

# Editar .env com suas credenciais PostgreSQL
nano .env  # Linux/macOS
notepad .env  # Windows
```

**Conteúdo do .env:**
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=cleiton_blade_system
DB_USER=postgres
DB_PASSWORD=sua_senha_postgres

# Server
NODE_ENV=development
PORT=3000

# JWT (MUDE ESTAS CHAVES EM PRODUÇÃO!)
JWT_SECRET=sua_chave_super_secreta_desenvolvimento_aqui
JWT_EXPIRATION=7d
JWT_REFRESH_SECRET=sua_outra_chave_secreta_desenvolvimento
JWT_REFRESH_EXPIRATION=30d

# Bcrypt
BCRYPT_ROUNDS=10

# WhatsApp (opcional)
WHATSAPP_WEBHOOK_VERIFY_TOKEN=token_verificacao_webhook
```

### 5. Popular Banco de Dados

```bash
# Executar migrações (criar tabelas)
npm run migrate

# Popular com dados iniciais (admin + serviços + profissional exemplo)
npm run seed
```

### 6. Iniciar Servidor

```bash
# Desenvolvimento (hot reload com nodemon)
npm run dev

# Produção
npm start
```

Saída esperada:
```
✨ Servidor rodando em: http://localhost:3000
🗄️  Banco de Dados: localhost:5432
```

### 7. Testar API

**Health Check:**
```bash
curl http://localhost:3000/health
# Resposta: {"success":true,"message":"API is running"}
```

**Login com dados padrão:**
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@cleiton-blade.com","password":"admin123456"}'
```

**Importar Postman Collection:**
- Abra Postman
- Collections → Import
- Selecione: `cleiton-blade-system.postman_collection.json`
- Teste todos os endpoints

---

## 🔐 Autenticação

### Registro (Admin)
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "Administrador",
  "email": "admin@example.com",
  "password": "senha123456"
}
```

### Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "senha123456"
}

Response:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@example.com",
      "role": "admin"
    }
  }
}
```

### Usar Token
```bash
Authorization: Bearer {accessToken}
```

### Renovar Token
```bash
POST /auth/refresh
{"refreshToken": "TOKEN"}
```

## 📋 Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar novo admin
- `POST /auth/login` - Fazer login
- `POST /auth/refresh` - Renovar token
- `GET /auth/me` - Dados do usuário logado
- `PUT /auth/change-password` - Mudar senha

### Usuários (Admin only)
- `GET /users` - Listar usuários
- `GET /users/:id` - Obter usuário
- `PUT /users/:id` - Atualizar usuário
- `PUT /users/:id/toggle` - Ativar/desativar
- `DELETE /users/:id` - Deletar usuário

### Clientes
- `GET /clients` - Listar clientes
- `GET /clients/:id` - Obter cliente
- `GET /clients/phone/:phone` - Buscar por telefone
- `POST /clients` - Criar cliente
- `PUT /clients/:id` - Atualizar cliente
- `PUT /clients/:id/block` - Bloquear cliente
- `POST /clients/:id/loyalty-points` - Adicionar pontos

### Profissionais
- `GET /professionals` - Listar profissionais
- `GET /professionals/:id` - Obter profissional
- `GET /professionals/:id/schedules` - Horários de trabalho
- `GET /professionals/:id/appointments` - Agendamentos
- `POST /professionals` - Criar (admin only)
- `PUT /professionals/:id` - Atualizar (admin only)

### Serviços
- `GET /services` - Listar serviços
- `GET /services/:id` - Obter serviço
- `POST /services` - Criar (admin only)
- `PUT /services/:id` - Atualizar (admin only)
- `PUT /services/:id/toggle` - Ativar/desativar (admin only)

### Agendas (Horários de Trabalho)
- `GET /schedules/professional/:professionalId` - Listar agendas
- `POST /schedules` - Criar agenda
- `PUT /schedules/:id` - Atualizar agenda
- `DELETE /schedules/:id` - Deletar agenda

### Agendamentos ⭐ (Principal)
```bash
# Obter horários disponíveis (MUITO IMPORTANTE)
GET /appointments/available?professional_id={id}&date=2024-02-25&service_id={id}

Response:
{
  "success": true,
  "data": {
    "professionalId": "uuid",
    "serviceId": "uuid",
    "date": "2024-02-25",
    "durationMinutes": 30,
    "availableSlots": [
      {"time": "2024-02-25T09:00:00.000Z", "timeDisplay": "09:00"},
      {"time": "2024-02-25T09:30:00.000Z", "timeDisplay": "09:30"},
      // ... mais horários
    ],
    "totalSlots": 15
  }
}
```

- `GET /appointments` - Listar agendamentos
- `GET /appointments/:id` - Obter agendamento
- `GET /appointments/client/:clientId` - Do cliente
- `GET /appointments/professional/:professionalId` - Do profissional
- `POST /appointments` - Criar agendamento
- `PUT /appointments/:id/confirm` - Confirmar
- `PUT /appointments/:id/complete` - Marcar concluído
- `PUT /appointments/:id/cancel` - Cancelar
- `PUT /appointments/:id/no-show` - Não compareceu

### Pagamentos
- `GET /payments` - Listar (admin)
- `GET /payments/:id` - Obter pagamento
- `GET /payments/appointment/:appointmentId` - Do agendamento
- `POST /payments` - Criar pagamento
- `PUT /payments/:id/confirm` - Confirmar pagamento
- `PUT /payments/:id/fail` - Marcar como falho
- `PUT /payments/:id/refund` - Reembolsar
- `GET /payments/stats` - Estatísticas (admin)

### WhatsApp (Preparação para API)
- `GET /whatsapp/webhook` - Verificação de webhook (público)
- `POST /whatsapp/webhook` - Receber mensagens (público)
- `GET /whatsapp/conversation/:clientId` - Histórico
- `POST /whatsapp/send` - Enviar mensagem (admin)
- `POST /whatsapp/process-scheduling` - Processar agendamento
- `GET /whatsapp/unprocessed` - Mensagens não processadas

## 📊 Padrão de Resposta

### Sucesso
```json
{
  "success": true,
  "data": { /* dados */ },
  "error": null
}
```

### Erro
```json
{
  "success": false,
  "data": null,
  "error": {
    "message": "Descrição do erro",
    "code": "ERROR_CODE"
  }
}
```

## 🎯 Fluxo de Agendamento (Exemplo)

```
1. Cliente busca horários disponíveis
   GET /appointments/available?professional_id=X&date=2024-02-25&service_id=Y

2. Sistema retorna slots livres
   [09:00, 09:30, 10:00, ...]

3. Cliente escolhe um horário e cria agendamento
   POST /appointments
   {
     "clientId": "X",
     "professionalId": "Y",
     "serviceId": "Z",
     "appointmentDatetime": "2024-02-25T09:00:00Z"
   }

4. Sistema cria pagamento
   POST /payments
   {
     "appointmentId": "X",
     "method": "pix",
     "amount": 100.00
   }

5. Cliente confirma pagamento
   PUT /payments/{id}/confirm

6. Profissional pode confirmar agendamento
   PUT /appointments/{id}/confirm

7. Após atendimento, marca como concluído
   PUT /appointments/{id}/complete
```

## 🔗 Sistema de Eventos

Eventos capturados no banco (`events_log`):
- `APPOINTMENT_CREATED` - Agendamento criado
- `APPOINTMENT_CANCELED` - Agendamento cancelado
- `PAYMENT_CONFIRMED` - Pagamento confirmado
- `PAYMENT_FAILED` - Pagamento falhou
- `CLIENT_CREATED` - Cliente criado
- `PROFESSIONAL_CREATED` - Profissional criado
- `WHATSAPP_MESSAGE_RECEIVED` - Mensagem WhatsApp recebida

Preparado para integração com fila (Redis/RabbitMQ) no futuro.

## 📱 WhatsApp Integration (Preparação)

A estrutura está pronta para integração com WhatsApp Business API:

1. **Webhook Setup**: Configure a URL `https://seu-dominio.com/whatsapp/webhook`
2. **Webhook Token**: Configure no `.env` `WHATSAPP_WEBHOOK_VERIFY_TOKEN`
3. **Receber Mensagens**: Sistema já captura e armazena mensagens
4. **Processar**: Detectar intenção de agendamento e responder automaticamente
5. **Agendar**: Cliente pode confirmar agendamento via WhatsApp

Exemplo de fluxo:
```
Cliente: "Quero agendar um corte de cabelo"
→ Sistema recebe em /whatsapp/webhook
→ Armazena em whatsapp_messages
→ Detecta intenção de agendamento
→ Responde com horários disponíveis
→ Cliente escolhe horário
→ Sistema cria agendamento
```

## 🗄️ Banco de Dados

### Tabelas
- `users` - Usuários do sistema (admin, professional)
- `clients` - Clientes que agendarão serviços
- `professionals` - Profissionais que prestam serviços
- `services` - Serviços oferecidos
- `schedules` - Horários de trabalho dos profissionais
- `appointments` - Agendamentos
- `payments` - Pagamentos
- `whatsapp_messages` - Histórico de mensagens WhatsApp
- `events_log` - Log de eventos do sistema

## 🔒 Segurança

- ✅ Senhas hasheadas com bcrypt
- ✅ Autenticação JWT com expiração
- ✅ Refresh tokens
- ✅ Validação de inputs
- ✅ Tratamento de erros global
- ✅ CORS configurável
- ✅ Variáveis sensíveis via `.env`

## 📈 Escalabilidade Futura

Estrutura preparada para:
- ✅ Fila de eventos (Redis/RabbitMQ)
- ✅ Cache (Redis)
- ✅ Processamento assíncrono
- ✅ Webhooks personalizados
- ✅ Múltiplos bancos de dados
- ✅ Load balancing
- ✅ Autenticação OAuth2

## 🧪 Testing

```bash
# Usar as requisições Postman fornecidas
# Arquivo: cleiton-blade-system.postman_collection.json
```

## 📝 Variáveis de Ambiente Importantes

```env
# Desenvolvimento
NODE_ENV=development
DEBUG=true

# Segurança - MUDE EM PRODUÇÃO!
JWT_SECRET=mudar_em_producao_chave_segura_aqui
JWT_REFRESH_SECRET=mudar_em_producao_outra_chave_segura

# WhatsApp - Não obrigatório agora
WHATSAPP_WEBHOOK_VERIFY_TOKEN=seu_token_aqui
```

## 💡 Dicas de Desenvolvimento

1. **Postman**: Importe a coleção para testar endpoints
2. **Logs**: Verifique a saída do terminal para debbugging
3. **Banco de Dados**: Use `npm run migrate` e `npm run seed` 
4. **Hot Reload**: `npm run dev` recarrega automaticamente
5. **Erros**: Confira a resposta em `error.code` para tratamento no front

## 🙋 FAQ

**Como criar um profissional?**
```bash
1. Criar usuário tipo 'professional'
   POST /auth/register (com role: professional)
2. Criar profissional vinculado ao user
   POST /professionals
3. Definir agendas (horários de trabalho)
   POST /schedules
```

**Como o sistema calcula horários disponíveis?**
- Obtém horários de trabalho do profissional (schedules)
- Filtra agendamentos existentes (appointments)
- Considera duração do serviço
- Remove intervalos/pausas
- Retorna slots de 30 minutos

**Posso integrar com WhatsApp agora?**
Não, a estrutura está pronta mas precisa:
- Configurar conta WhatsApp Business
- Obter access token
- Configurar webhook no painel do WhatsApp
- Implementar NLP para detectar intenções de mensagens

## 📞 Suporte

Para dúvidas, verifique:
1. Logs do servidor
2. Status do banco de dados
3. Token JWT válido
4. Variáveis `.env` configuradas

## 📄 Licença

Propriedade - Cleiton Blade System

---

**Versão**: 1.0.0  
**Data**: Fevereiro 2026  
**Status**: ✅ Pronto para Produção

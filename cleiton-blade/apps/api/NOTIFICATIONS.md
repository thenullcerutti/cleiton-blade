# Sistema de Notificações de Agendamento

## Overview

O sistema de notificações permite que clientes recebam lembretes automáticos sobre seus agendamentos via WhatsApp e/ou Email. As notificações são enviadas em dois momentos específicos:

1. **Lembrete Matinal (7:00 AM)** - No dia do agendamento
2. **Lembrete Final (1 hora antes)** - Uma hora antes do horário agendado

## Preferências de Notificação

Cada cliente pode gerenciar suas preferências de notificação:

### Canais de Comunicação
- **WhatsApp** - Receber via WhatsApp (padrão: habilitado)
- **Email** - Receber via Email (padrão: habilitado)
- **SMS** - Receber via SMS (padrão: desabilitado)

### Tipos de Lembretes
- **Lembrete Matinal** - Recebbr notificação às 7 AM (padrão: habilitado)
- **Lembrete 1 Hora Antes** - Receber notificação 1 hora antes (padrão: habilitado)

### Horas Silenciosas
Clientes podem definir um período em que **NÃO desejam receber notificações** (ex: 22:00-07:00)

---

## API Endpoints

### Base URL
```
/api/notifications
```

### GET /api/notifications/preferences
**Descrição:** Obter preferências de notificação do cliente

**Permissions:** Cliente autenticado

**Exemplo Request:**
```bash
GET /api/notifications/preferences
Authorization: Bearer <token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "pref-1",
    "client_id": "client-123",
    "whatsapp_enabled": true,
    "email_enabled": true,
    "sms_enabled": false,
    "morning_reminder_enabled": true,
    "one_hour_before_enabled": true,
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "07:00",
    "created_at": "2026-03-01T10:00:00.000Z",
    "updated_at": "2026-03-11T15:00:00.000Z"
  },
  "message": "Preferências recuperadas com sucesso"
}
```

---

### PUT /api/notifications/preferences
**Descrição:** Atualizar preferências de notificação

**Permissions:** Cliente autenticado

**Body:**
```json
{
  "whatsapp_enabled": true,
  "email_enabled": false,
  "sms_enabled": true,
  "morning_reminder_enabled": true,
  "one_hour_before_enabled": true,
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "07:00"
}
```

**Exemplo Request:**
```bash
PUT /api/notifications/preferences
Authorization: Bearer <token>
Content-Type: application/json

{
  "whatsapp_enabled": true,
  "email_enabled": true,
  "morning_reminder_enabled": false
}
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "pref-1",
    "client_id": "client-123",
    "whatsapp_enabled": true,
    "email_enabled": true,
    "sms_enabled": false,
    "morning_reminder_enabled": false,
    "one_hour_before_enabled": true,
    "quiet_hours_start": null,
    "quiet_hours_end": null,
    "updated_at": "2026-03-11T15:30:00.000Z"
  },
  "message": "Preferências atualizadas com sucesso"
}
```

---

### POST /api/notifications/preferences/channel/:channel/toggle
**Descrição:** Habilitar/desabilitar um canal de notificação

**Permissions:** Cliente autenticado

**Parameters:**
- `:channel` - Pode ser: `whatsapp`, `email` ou `sms`
- Query param `enabled` - `true` ou `false`

**Exemplo Request:**
```bash
POST /api/notifications/preferences/channel/whatsapp/toggle?enabled=false
Authorization: Bearer <token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "pref-1",
    "client_id": "client-123",
    "whatsapp_enabled": false,
    "email_enabled": true,
    "sms_enabled": false
  },
  "message": "Channel whatsapp desabilitado"
}
```

---

### POST /api/notifications/preferences/reminder/:type/toggle
**Descrição:** Habilitar/desabilitar um tipo de lembrete

**Permissions:** Cliente autenticado

**Parameters:**
- `:type` - Pode ser: `morning` ou `one_hour_before`
- Query param `enabled` - `true` ou `false`

**Exemplo Request:**
```bash
POST /api/notifications/preferences/reminder/morning/toggle?enabled=false
Authorization: Bearer <token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "pref-1",
    "client_id": "client-123",
    "morning_reminder_enabled": false,
    "one_hour_before_enabled": true
  },
  "message": "Lembrete de morning desabilitado"
}
```

---

### POST /api/notifications/preferences/quiet-hours
**Descrição:** Definir horas silenciosas (período sem notificações)

**Permissions:** Cliente autenticado

**Body:**
```json
{
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "07:00"
}
```

**Formato:** HH:MM (24 horas)

**Exemplo Request:**
```bash
POST /api/notifications/preferences/quiet-hours
Authorization: Bearer <token>
Content-Type: application/json

{
  "quiet_hours_start": "22:00",
  "quiet_hours_end": "07:00"
}
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "pref-1",
    "client_id": "client-123",
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "07:00"
  },
  "message": "Horas silenciosas definidas de 22:00 a 07:00"
}
```

---

### GET /api/notifications/history
**Descrição:** Obter histórico de notificações do cliente

**Permissions:** Cliente autenticado

**Query Parameters:**
- `limit` (opcional, padrão: 50): Número máximo de registros

**Exemplo Request:**
```bash
GET /api/notifications/history?limit=20
Authorization: Bearer <token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notif-1",
      "appointment_id": "appt-1",
      "client_id": "client-123",
      "send_type": "morning_reminder",
      "scheduled_for": "2026-03-11T07:00:00.000Z",
      "sent_at": "2026-03-11T07:00:02.000Z",
      "sent_via": "whatsapp",
      "delivery_status": "sent",
      "appointment_datetime": "2026-03-11T14:30:00.000Z",
      "appointment_status": "confirmed",
      "service_name": "Corte Masculino"
    },
    {
      "id": "notif-2",
      "appointment_id": "appt-2",
      "client_id": "client-123",
      "send_type": "one_hour_before",
      "scheduled_for": "2026-03-10T16:00:00.000Z",
      "sent_at": "2026-03-10T16:00:01.000Z",
      "sent_via": "email",
      "delivery_status": "sent",
      "appointment_datetime": "2026-03-10T17:00:00.000Z",
      "appointment_status": "completed",
      "service_name": "Barba + Corte"
    }
  ],
  "count": 2,
  "message": "Histórico de notificações"
}
```

---

### POST /api/notifications/send-pending
**Descrição:** Enviar notificações pendentes (deve ser chamado periodicamente)

**Permissions:** Admin

**Como Usar:** Este endpoint deve ser chamado por um **job/cron job** a cada 5 minutos para processar notificações agendadas.

**Exemplo Request:**
```bash
POST /api/notifications/send-pending
Authorization: Bearer <admin-token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "sent": 5,
    "failed": 1,
    "skipped": 2,
    "total": 8
  },
  "message": "Notificações processadas"
}
```

---

## Fluxo de Funcionamento

### 1. Cliente cria um agendamento
```bash
POST /api/appointments
{
  "slotId": "slot-1",
  "serviceId": "service-1",
  "professionalId": "prof-1",
  "notes": "..."
}
```

**Sistema automaticamente:**
- ✅ Salva nome, telefone, email do cliente
- ✅ Verifica preferências de notificação do cliente
- ✅ Cria 2 registros de notificação (7AM e 1h antes)
- ✅ Marca como `pending` para envio posterior

### 2. Job/Cron envia notificações
A cada 5 minutos, um job executa:
```bash
POST /api/notifications/send-pending
Authorization: Bearer <admin-token>
```

**Sistema:**
- ✅ Busca notificações pendentes com `scheduled_for <= now()`
- ✅ Verifica preferências do cliente (canais habilitados?)
- ✅ Verifica horas silenciosas
- ✅ Tenta enviar via WhatsApp (preferência 1)
- ✅ Se falhar, tenta via Email (preferência 2)
- ✅ Atualiza status para `sent` ou `failed`

### 3. Cliente gerencia preferências
Cliente pode a qualquer momento:
- Desabilitar WhatsApp → Notificações irão apenas por Email
- Desabilitar Email → Notificações irão apenas por WhatsApp
- Desabilitar ambos → Nenhuma notificação será enviada
- Desabilitar lembrete matinal → Só recebe notificação 1h antes
- Definir horas silenciosas → Entre 22:00-07:00nenhuma notificação

---

## Configuração de Job/Cron

Para enviar notificações automaticamente, você deve configurar um job que execute a cada 5 minutos.

### Opção 1: Node-Cron (Simples)
```javascript
const cron = require('node-cron');
const axios = require('axios');

// A cada 5 minutos
cron.schedule('*/5 * * * *', async () => {
  try {
    await axios.post('http://localhost:3000/api/notifications/send-pending', {}, {
      headers: {
        'Authorization': `Bearer ${process.env.NOTIFICATION_JOB_TOKEN}`
      }
    });
    console.log('✅ Notificações processadas');
  } catch (error) {
    console.error('❌ Erro ao processar notificações:', error.message);
  }
});
```

### Opção 2: PM2 Cron (Produção)
Criar arquivo `notification-job.js`:
```javascript
const NotificationService = require('./src/modules/notifications/NotificationService');

setInterval(async () => {
  try {
    const result = await NotificationService.sendPendingNotifications();
    console.log('✅ Notificações:', result);
  } catch (error) {
    console.error('❌ Erro:', error);
  }
}, 5 * 60 * 1000); // 5 minutos
```

Executar com PM2:
```bash
pm2 start notification-job.js --name "notification-cron"
```

### Opção 3: AWS Lambda/Google Cloud Functions
Deploy a função que executa `NotificationService.sendPendingNotifications()` e configure para rodar a cada 5 minutos.

---

## Campos de Agendamento (Appointments)

Ao criar um agendamento, os seguintes campos são salvos:

```javascript
{
  // Campos existentes
  id: UUID,
  client_id: UUID,
  professional_id: UUID,
  service_id: UUID,
  appointment_datetime: TIMESTAMP,
  status: string,
  payment_status: string,
  origin: string,
  
  // Novos campos
  client_name: string,           // Nome do cliente
  client_phone: string,          // Telefone (WhatsApp)
  client_email: string,          // Email
  observations: string,          // Observações/notas
  notifications_enabled: boolean // Se cliente quer notificações
}
```

---

## Exemplo de Uso Completo

### 1. Cliente se registra e configura preferências
```bash
# Desabilitar SMS (ele não vai usar)
POST /api/notifications/preferences/channel/sms/toggle?enabled=false
```

### 2. Cliente agenda um serviço
```bash
POST /api/appointments
{
  "slotId": "slot-123",
  "serviceId": "service-1",
  "professionalId": "prof-1",
  "notes": "Gostaria de corte moderno"
}
```

**Sistema automático:**
- Cria notificação para 2026-03-11 07:00 (7 AM)
- Cria notificação para 2026-03-11 17:00 (1h antes das 18:00)

### 3. Job envia notificações

**2026-03-11 07:00:05** - Primeira notificação:
```
WhatsApp para +5511999999999:
"Olá João! 👋
Lembrete do seu agendamento de hoje:

📅 11/03/2026
⏰ 18:00
✂️ Serviço: Corte Masculino

🏪 Cleiton Blade
Até logo!"
```

**2026-03-11 17:00:05** - Segunda notificação:
```
WhatsApp para +5511999999999:
"Ótimo João! ⏰
Falta 1 hora para seu agendamento:

⏰ 18:00
✂️ Serviço: Corte Masculino

🏪 Cleiton Blade"
```

---

## Status de Notificação

| Status | Significado |
|--------|-------------|
| `pending` | Aguardando para ser enviada |
| `sent` | Enviada com sucesso |
| `failed` | Falha ao enviar |
| `skipped` | Pulada (cliente desabilitou) |

---

## Integração com WhatsApp

Para integrar com WhatsApp real, use a API do Twilio ou WhatsApp Business API:

```javascript
// Exemplo com Twilio
const twilio = require('twilio');
const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);

await client.messages.create({
  from: process.env.TWILIO_WHATSAPP_FROM,
  to: `whatsapp:${phone}`,
  body: message
});
```

---

## Integração com Email

Para integrar com Email, use SendGrid ou AWS SES:

```javascript
// Exemplo com SendGrid
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

await sgMail.send({
  to: email,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Lembrete de Agendamento',
  html: message
});
```

---

## Troubleshooting

### 👉 Notificações não estão sendo enviadas
1. Verifique se o Cron Job está rodando
2. Verifique se o cliente tem email/telefone cadastrado
3. Verifique preferências do cliente (canais habilitados?)
4. Verifique logs do endpoint `/api/notifications/send-pending`

### 👉 Cliente não recebe notificações mesmo tendo ativado
1. Cheque horas silenciosas do cliente
2. Verifique se o serviço de integração (WhatsApp/Email) está funcionando
3. Veja relatório de falhas em `/api/notifications/history`

### 👉 Como desabilitar notificações de um agendamento específico?
Atualize o campo `notifications_enabled` para `false` no agendamento, ou cliente pode desabilitar todos os canais/lembretes.

# Documentação da API de Agendamento (Scheduling)

## Overview

Este documento descreve os novos endpoints de agendamento com suporte a:
- Definição de horários de trabalho (working hours)
- Geração automática de slots de disponibilidade
- Agendamento e gerenciamento de appointments
- Controle de bloqueios e desabilitações

## 1. Working Hours (Horários de Trabalho)

### Base URL
```
/api/working-hours
```

### GET /api/working-hours/:professionalId
**Descrição:** Obter todos os horários de trabalho de um profissional

**Parâmetros:**
- `professionalId` (path, obrigatório): ID do profissional

**Exemplo Request:**
```bash
GET /api/working-hours/prof-123
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "work-1",
      "professional_id": "prof-123",
      "day_of_week": 1,
      "day_name": "Segunda",
      "start_time": "09:00",
      "end_time": "18:00",
      "is_active": true,
      "created_at": "2026-03-01T10:00:00.000Z"
    },
    {
      "id": "work-2",
      "professional_id": "prof-123",
      "day_of_week": 2,
      "day_name": "Terça",
      "start_time": "09:00",
      "end_time": "18:00",
      "is_active": true,
      "created_at": "2026-03-01T10:00:00.000Z"
    }
  ],
  "message": "Horários recuperados com sucesso"
}
```

### POST /api/working-hours
**Descrição:** Criar ou atualizar horário de trabalho

**Permissions:** Requer `admin` ou `professional` role

**Body:**
```json
{
  "professionalId": "prof-123",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "18:00"
}
```

**dayOfWeek Values:**
- 0 = Domingo
- 1 = Segunda
- 2 = Terça
- 3 = Quarta
- 4 = Quinta
- 5 = Sexta
- 6 = Sábado

**Exemplo Request:**
```bash
POST /api/working-hours
Authorization: Bearer <token>
Content-Type: application/json

{
  "professionalId": "prof-123",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "18:00"
}
```

**Exemplo Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "work-1",
    "professional_id": "prof-123",
    "day_of_week": 1,
    "day_name": "Segunda",
    "start_time": "09:00",
    "end_time": "18:00",
    "is_active": true,
    "created_at": "2026-03-01T10:00:00.000Z"
  },
  "message": "Horário definido com sucesso"
}
```

### PATCH /api/working-hours/:id/toggle
**Descrição:** Habilitar ou desabilitar um dia de trabalho

**Permissions:** Requer `admin` ou `professional` role

**Query Parameters:**
- `enabled` (obrigatório): "true" ou "false"

**Exemplo Request:**
```bash
PATCH /api/working-hours/work-1/toggle?enabled=false
Authorization: Bearer <token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "work-1",
    "professional_id": "prof-123",
    "day_of_week": 1,
    "day_name": "Segunda",
    "start_time": "09:00",
    "end_time": "18:00",
    "is_active": false,
    "created_at": "2026-03-01T10:00:00.000Z"
  },
  "message": "Dia desabilitado com sucesso"
}
```

### DELETE /api/working-hours/:professionalId/:dayOfWeek
**Descrição:** Deletar horário de trabalho para um dia

**Permissions:** Requer `admin` ou `professional` role

**Exemplo Request:**
```bash
DELETE /api/working-hours/prof-123/1
Authorization: Bearer <token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "message": "Horário deletado com sucesso"
  }
}
```

---

## 2. Availability (Disponibilidade de Slots)

### Base URL
```
/api/availability
```

### GET /api/availability/slots
**Descrição:** Obter slots disponíveis para um profissional em um período

**Query Parameters:**
- `professionalId` (obrigatório): ID do profissional
- `startDate` (obrigatório): Data inicial em formato ISO (YYYY-MM-DD)
- `endDate` (obrigatório): Data final em formato ISO
- `serviceId` (opcional): ID do serviço (filtra por duração)

**Exemplo Request:**
```bash
GET /api/availability/slots?professionalId=prof-123&startDate=2026-03-01&endDate=2026-03-31&serviceId=service-1
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "professional_id": "prof-123",
    "service_id": "service-1",
    "service_duration": 30,
    "available_slots": {
      "2026-03-02": [
        {
          "id": "slot-1",
          "time": "09:00",
          "datetime": "2026-03-02T09:00:00.000Z",
          "duration_minutes": 30
        },
        {
          "id": "slot-2",
          "time": "09:15",
          "datetime": "2026-03-02T09:15:00.000Z",
          "duration_minutes": 30
        },
        {
          "id": "slot-3",
          "time": "09:30",
          "datetime": "2026-03-02T09:30:00.000Z",
          "duration_minutes": 30
        }
      ],
      "2026-03-03": [
        {
          "id": "slot-4",
          "time": "09:00",
          "datetime": "2026-03-03T09:00:00.000Z",
          "duration_minutes": 30
        }
      ]
    },
    "total_slots": 20
  }
}
```

### GET /api/availability/slots/next
**Descrição:** Obter próximo horário disponível

**Query Parameters:**
- `professionalId` (obrigatório): ID do profissional
- `afterDate` (opcional): Data de início (padrão: hoje)

**Exemplo Request:**
```bash
GET /api/availability/slots/next?professionalId=prof-123&afterDate=2026-03-05
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "slot-1",
    "datetime": "2026-03-05T09:00:00.000Z",
    "time": "09:00"
  }
}
```

### POST /api/availability/slots/:slotId/block
**Descrição:** Bloquear um slot individual (impedir agendamento)

**Permissions:** Requer `admin` ou `professional` role

**Body (opcional):**
```json
{
  "reason": "Manutenção pessoal"
}
```

**Exemplo Request:**
```bash
POST /api/availability/slots/slot-1/block
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Almoço"
}
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "slot-1",
    "professional_id": "prof-123",
    "slot_datetime": "2026-03-02T09:00:00.000Z",
    "status": "blocked",
    "block_reason": "Almoço"
  },
  "message": "Slot bloqueado com sucesso"
}
```

### POST /api/availability/slots/:slotId/unblock
**Descrição:** Desbloquear um slot

**Permissions:** Requer `admin` ou `professional` role

**Exemplo Request:**
```bash
POST /api/availability/slots/slot-1/unblock
Authorization: Bearer <token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "slot-1",
    "professional_id": "prof-123",
    "slot_datetime": "2026-03-02T09:00:00.000Z",
    "status": "available"
  },
  "message": "Slot desbloqueado com sucesso"
}
```

### POST /api/availability/slots/block-multiple
**Descrição:** Bloquear múltiplos slots de uma vez

**Permissions:** Requer `admin` ou `professional` role

**Body:**
```json
{
  "slotIds": ["slot-1", "slot-2", "slot-3"],
  "reason": "Feriado nacional"
}
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "blocked": 3,
    "failed": [],
    "total": 3
  },
  "message": "3 slots bloqueados com sucesso"
}
```

### GET /api/availability/blocked-slots
**Descrição:** Obter slots bloqueados em um período

**Query Parameters:**
- `professionalId` (obrigatório)
- `startDate` (obrigatório)
- `endDate` (obrigatório)

**Exemplo Request:**
```bash
GET /api/availability/blocked-slots?professionalId=prof-123&startDate=2026-03-01&endDate=2026-03-31
```

### GET /api/availability/stats
**Descrição:** Obter estatísticas de disponibilidade

**Query Parameters:**
- `professionalId` (obrigatório)
- `startDate` (obrigatório)
- `endDate` (obrigatório)

**Exemplo Request:**
```bash
GET /api/availability/stats?professionalId=prof-123&startDate=2026-03-01&endDate=2026-03-31
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "total_slots": 100,
    "available": 45,
    "booked": 35,
    "blocked": 20,
    "pending": 0,
    "occupancy_rate": 35
  }
}
```

---

## 3. Appointments (Agendamentos)

### Base URL
```
/api/appointments
```

### GET /api/appointments
**Descrição:** Listar todos os agendamentos (admin only)

**Permissions:** Requer `admin` role

**Query Parameters:**
- `page` (opcional, padrão: 1)
- `pageSize` (opcional, padrão: 20)
- `status` (opcional): pending, confirmed, completed, cancelled, no_show
- `professionalId` (opcional)

**Exemplo Request:**
```bash
GET /api/appointments?page=1&pageSize=20&status=confirmed
Authorization: Bearer <token>
```

### GET /api/appointments/my
**Descrição:** Obter meus agendamentos (cliente)

**Query Parameters:**
- `status` (opcional)
- `page` (opcional)

**Exemplo Request:**
```bash
GET /api/appointments/my?status=confirmed
Authorization: Bearer <token>
```

### GET /api/appointments/professional
**Descrição:** Obter agendamentos do profissional

**Permissions:** Requer `professional` ou `admin` role

**Query Parameters:**
- `status` (opcional)
- `startDate` (opcional)
- `endDate` (opcional)
- `professionalId` (obrigatório para admin)

**Exemplo Request:**
```bash
GET /api/appointments/professional?startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <token>
```

### GET /api/appointments/:id
**Descrição:** Obter um agendamento específico

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "id": "appt-1",
    "slot_id": "slot-1",
    "client_id": "client-123",
    "service_id": "service-1",
    "professional_id": "prof-123",
    "appointment_date": "2026-03-02T09:00:00.000Z",
    "duration_minutes": 30,
    "status": "confirmed",
    "notes": "Cliente preferência: tesoura americana",
    "created_at": "2026-03-01T10:00:00.000Z"
  }
}
```

### POST /api/appointments
**Descrição:** Criar novo agendamento

**Permissions:** Requer cliente autenticado

**Body:**
```json
{
  "slotId": "slot-1",
  "serviceId": "service-1",
  "professionalId": "prof-123",
  "notes": "Cliente tem alergia a certos produtos"
}
```

**Exemplo Request:**
```bash
POST /api/appointments
Authorization: Bearer <token>
Content-Type: application/json

{
  "slotId": "slot-1",
  "serviceId": "service-1",
  "professionalId": "prof-123",
  "notes": "Preferência: corte moderno"
}
```

**Exemplo Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "appt-1",
    "slot_id": "slot-1",
    "client_id": "client-123",
    "service_id": "service-1",
    "professional_id": "prof-123",
    "appointment_date": "2026-03-02T09:00:00.000Z",
    "duration_minutes": 30,
    "status": "pending",
    "notes": "Preferência: corte moderno",
    "client": { /* dados do cliente */ },
    "service": { /* dados do serviço */ },
    "professional": { /* dados do profissional */ }
  },
  "message": "Agendamento criado com sucesso"
}
```

### POST /api/appointments/:id/confirm
**Descrição:** Confirmar um agendamento pendente

**Permissions:** Requer `admin` ou `professional` role

**Exemplo Request:**
```bash
POST /api/appointments/appt-1/confirm
Authorization: Bearer <token>
```

### POST /api/appointments/:id/cancel
**Descrição:** Cancelar um agendamento

**Permissions:** Cliente pode cancelar seu próprio agendamento, admin pode cancelar qualquer um

**Body:**
```json
{
  "reason": "Motivo do cancelamento"
}
```

**Exemplo Request:**
```bash
POST /api/appointments/appt-1/cancel
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Imprevistos pessoais"
}
```

### POST /api/appointments/:id/no-show
**Descrição:** Marcar cliente como não comparecido

**Permissions:** Requer `admin` ou `professional` role

**Body:**
```json
{
  "reason": "Cliente não compareceu"
}
```

**Exemplo Request:**
```bash
POST /api/appointments/appt-1/no-show
Authorization: Bearer <token>
```

### POST /api/appointments/:id/complete
**Descrição:** Marcar agendamento como concluído

**Permissions:** Requer `admin` ou `professional` role

**Exemplo Request:**
```bash
POST /api/appointments/appt-1/complete
Authorization: Bearer <token>
```

### POST /api/appointments/:id/reschedule
**Descrição:** Reagendar para outro horário

**Body:**
```json
{
  "newSlotId": "slot-2"
}
```

**Exemplo Request:**
```bash
POST /api/appointments/appt-1/reschedule
Authorization: Bearer <token>
Content-Type: application/json

{
  "newSlotId": "slot-2"
}
```

### GET /api/appointments/stats
**Descrição:** Obter estatísticas de agendamentos

**Permissions:** Requer `admin` role

**Query Parameters:**
- `professionalId` (obrigatório)
- `startDate` (obrigatório)
- `endDate` (obrigatório)

**Exemplo Request:**
```bash
GET /api/appointments/stats?professionalId=prof-123&startDate=2026-03-01&endDate=2026-03-31
Authorization: Bearer <token>
```

**Exemplo Response:**
```json
{
  "success": true,
  "data": {
    "total": 50,
    "confirmed": 35,
    "pending": 10,
    "completed": 4,
    "cancelled": 1,
    "no_show": 0
  }
}
```

---

## Error Handling

Todos os endpoints seguem a mesma estrutura de erro:

### 400 Bad Request
```json
{
  "success": false,
  "message": "Descrição do erro de validação"
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Autenticação necessária"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Sem permissão para acessar este recurso"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "Recurso não encontrado"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Erro ao processar requisição"
}
```

---

## Fluxo de Uso Recomendado

### 1. **Admin Configura Horários**
```bash
# Define Segunda-Sexta 09:00-18:00
POST /api/working-hours
{
  "professionalId": "prof-123",
  "dayOfWeek": 1,
  "startTime": "09:00",
  "endTime": "18:00"
}
```

### 2. **Sistema Gera Slots Automaticamente**
Slots em intervalos de 15 minutos são gerados automaticamente baseado na duração do serviço (padrão 30min).

### 3. **Cliente Consulta Disponibilidade**
```bash
GET /api/availability/slots?professionalId=prof-123&startDate=2026-03-01&endDate=2026-03-31&serviceId=service-1
```

### 4. **Cliente Agenda**
```bash
POST /api/appointments
{
  "slotId": "slot-1",
  "serviceId": "service-1",
  "professionalId": "prof-123"
}
```

### 5. **Admin Confirma/Cancela**
```bash
POST /api/appointments/appt-1/confirm
```

### 6. **Admin Marca como Concluído**
```bash
POST /api/appointments/appt-1/complete
```

---

## Status de Agendamento

| Status | Descrição |
|--------|-----------|
| `pending` | Agendado mas não confirmado |
| `confirmed` | Confirmado pelo profissional/admin |
| `completed` | Serviço foi realizado |
| `cancelled` | Cliente ou admin cancelou |
| `no_show` | Cliente não compareceu |

---

## Permissions Summary

| Endpoint | Admin | Professional | Client |
|----------|-------|--------------|--------|
| POST /working-hours | ✅ | ✅ | ❌ |
| PATCH /working-hours/:id/toggle | ✅ | ✅ | ❌ |
| DELETE /working-hours/:professionalId/:dayOfWeek | ✅ | ✅ | ❌ |
| POST /availability/slots/:slotId/block | ✅ | ✅ | ❌ |
| POST /appointments | ❌ | ❌ | ✅ |
| POST /appointments/:id/confirm | ✅ | ✅ | ❌ |
| POST /appointments/:id/cancel | ✅ | ✅ | ✅* |
| POST /appointments/:id/complete | ✅ | ✅ | ❌ |
| POST /appointments/:id/reschedule | ✅ | ✅ | ✅* |

> \* Cliente pode apenas acessar seus próprios agendamentos

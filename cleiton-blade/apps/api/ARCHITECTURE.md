# ═════════════════════════════════════════════════════════════════════════════════
# CLEITON BLADE SYSTEM - ARQUITETURA
# ═════════════════════════════════════════════════════════════════════════════════

## CAMADAS DA APLICAÇÃO

                        ┌─────────────────────────────────────────┐
                        │      Cliente (Mobile/Web/WhatsApp)      │
                        └──────────────────┬──────────────────────┘
                                           │ HTTP/HTTPS
                        ┌──────────────────▼──────────────────────┐
                        │        Express Router & Middleware      │
                        │  (CORS, Auth, Validation, Error Handler)│
                        └──────────────────┬──────────────────────┘
                                           │
        ┌──────────────────────────────────┼──────────────────────────────────┐
        │                                  │                                  │
        ▼                                  ▼                                  ▼
   ┌─────────────┐                  ┌──────────────┐              ┌────────────────┐
   │ Controller  │                  │ Controller   │              │  Controller    │
   │ (HTTP)      │                  │ (HTTP)       │              │  (HTTP)        │
   └──────┬──────┘                  └──────┬───────┘              └────────┬───────┘
          │                                │                              │
          ▼                                ▼                              ▼
   ┌─────────────┐                  ┌──────────────┐              ┌────────────────┐
   │  Service    │◄────────────────►│  Service     │◄────────────►│   Service      │
   │ (Lógica)    │                  │ (Lógica)     │              │  (Lógica)      │
   └──────┬──────┘                  └──────┬───────┘              └────────┬───────┘
          │                                │                              │
          ▼                                ▼                              ▼
   ┌─────────────┐                  ┌──────────────┐              ┌────────────────┐
   │ Repository  │                  │ Repository   │              │  Repository    │
   │ (DB Layer)  │                  │ (DB Layer)   │              │  (DB Layer)    │
   └──────┬──────┘                  └──────┬───────┘              └────────┬───────┘
          │                                │                              │
          └────────────────────┬───────────┴──────────────┬───────────────┘
                               │                         │
                        ┌──────▼──────────────────────────▼──────┐
                        │   PostgreSQL Database                   │
                        │  (Tables, Transactions, Constraints)   │
                        └─────────────────────────────────────────┘


## FLUXO DE UMA REQUISIÇÃO

1. Cliente envia requisição HTTP
   └─ POST /appointments

2. Express Router identifica rota
   └─ router.post('/', validateBody, AppointmentController.create)

3. Middleware de validação executa
   └─ Valida campos obrigatórios

4. Middleware de autenticação executa
   └─ Verifica JWT token

5. Controller processa requisição
   └─ AppointmentController.create()

6. Service executa lógica de negócio
   └─ AppointmentService.create(clientId, ...)
   └─ Valida regras de negócio
   └─ Verifica conflitos de horário
   └─ Emite eventos

7. Repository acessa banco de dados
   └─ AppointmentRepository.create(...)
   └─ SQL INSERT

8. Banco de dados executa query
   └─ CREATE RECORD
   └─ RETORNA RESULTADO

9. Resposta é retornada em cascata
   └─ Repository → Service → Controller → Middleware → Cliente

10. Erro é tratado globalmente
    └─ errorHandler captura e formata resposta


## ESTRUTURA DE MÓDULOS

cada módulo segue padrão:
```
módulo/
├── ModuleController.js    - Controla requisições HTTP
├── ModuleService.js       - Lógica de negócio
├── ModuleRepository.js    - Acesso ao banco de dados
└── routes.js              - Define os endpoints
```

Exemplo: appointments/
├── AppointmentController.js
├── AppointmentService.js
├── AppointmentRepository.js
└── routes.js


## DADOS FLUEM ASSIM

Cliente (Postman/App)
        ↓
[POST] /appointments
        ↓
Router identifica /appointments
        ↓
Middleware (auth, validação)
        ↓
AppointmentController.create()
        ↓
AppointmentService.create()
        ├─ Service chama ClientRepository.findById()
        ├─ Service chama ProfessionalRepository.findById()
        ├─ Service chama ServiceRepository.findById()
        ├─ Service chama ScheduleRepository.findByWeekday()
        ├─ Service calcula horários disponíveis
        ├─ Service verifica conflitos
        └─ Service chama AppointmentRepository.create()
        ↓
AppointmentRepository.create()
        ↓
PostgreSQL INSERT INTO appointments
        ↓
Retorna registro criado
        ↓
Service emite APPOINTMENT_CREATED event
        ↓
Controller formata resposta
        ↓
Middleware (cors, headers)
        ↓
Cliente recebe JSON response


## SEGURANÇA

                    ┌──────────────────────────────────┐
                    │ Cliente faz login                │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │ AuthService.login()              │
                    │ - Valida credenciais             │
                    │ - Hash senha com bcrypt          │
                    │ - Gera JWT token                 │
                    │ - Gera refresh token             │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │ Cliente usa token em requests    │
                    │ Authorization: Bearer {token}    │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │ authMiddleware verifica JWT      │
                    │ - Decodifica token               │
                    │ - Valida assinatura              │
                    │ - Verifica expiração             │
                    │ - Injeta user em req.user        │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │ roleMiddleware verifica role     │
                    │ - Admin pode fazer tudo          │
                    │ - Professional limitado          │
                    │ - Cliente básico                 │
                    └──────────────┬───────────────────┘
                                   │
                    ┌──────────────▼───────────────────┐
                    │ Requisição autorizada            │
                    │ Acessa recurso                   │
                    └──────────────────────────────────┘


## SISTEMA DE EVENTOS

Quando uma ação importante ocorre:
┌─────────────────────────┐
│ Appointment criado      │
│ (AppointmentService)    │
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ eventEmitter.emit()     │
├─────────────────────────┤
│ event_type:             │
│  APPOINTMENT_CREATED    │
│ payload: {appointmentId,│
│           clientId, etc}│
└────────────┬────────────┘
             │
             ▼
┌─────────────────────────┐
│ Registra em events_log  │
│ (banco de dados)        │
└────────────┬────────────┘
             │
    ┌────────┴─────────┐
    │                  │
    ▼                  ▼
[Memória]      [Fila - Futuro]
Processa em   Redis/RabbitMQ
tempo real    para async


## CÁLCULO DE HORÁRIOS DISPONÍVEIS

GET /appointments/available?professional_id=X&date=2024-02-25&service_id=Y

┌──────────────────────────────────────┐
│ 1. Valida parâmetros                 │
│ 2. Obtém profissional                │
│ 3. Obtém serviço (duração)          │
│ 4. Obtém agenda do dia (schedules)   │
│    - Weekday (segunda=1, etc)        │
│    - Start/end time                  │
│    - Break time                      │
│ 5. Busca agendamentos do dia         │
│ 6. Calcula slots disponíveis:        │
│    from startTime to endTime         │
│    every 30 minutes                  │
│    skip breakTime                    │
│    skip occupied times               │
│ 7. Retorna array de horários        │
└──────────────────────────────────────┘

Exemplo de resposta:
{
  "availableSlots": [
    {"time": "2024-02-25T09:00:00Z", "timeDisplay": "09:00"},
    {"time": "2024-02-25T09:30:00Z", "timeDisplay": "09:30"},
    {"time": "2024-02-25T10:00:00Z", "timeDisplay": "10:00"},
    // ... pulando intervalo 12:00-13:00
    {"time": "2024-02-25T13:30:00Z", "timeDisplay": "13:30"},
  ],
  "totalSlots": 15
}


## PREPARAÇÃO PARA WHATSAPP

┌────────────────────────┐
│ WhatsApp Business API  │
└────────────┬───────────┘
             │ Webhook POST
             ▼
┌────────────────────────────────────┐
│ POST /whatsapp/webhook             │
│ (WhatsAppController.handleWebhook) │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ WhatsAppService.processWebhook()   │
│ - Parsed mensagem                  │
│ - Encontra/cria cliente            │
│ - Armazena mensagem                │
│ - Emite evento                     │
└────────────┬───────────────────────┘
             │
             ▼
┌────────────────────────────────────┐
│ WhatsAppRepository.store...()      │
│ INSERT INTO whatsapp_messages      │
└────────────┬───────────────────────┘
             │
    ┌────────┴──────────┐
    │                   │
    ▼                   ▼
[Memória]          [Fila/Processing]
Processa          Caso tenha NLP
intenção          para detectar
via keywords      agendamento

Futuro: NLP → Intent Detection
        "Quero agendar" → SCHEDULE_REQUEST
        → getAvailableSlots() → sendMessage()


## PADRÃO DE RESPOSTA DA API

Sucesso (200):
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Nome",
    ...
  },
  "error": null
}

Erro (4xx/5xx):
{
  "success": false,
  "data": null,
  "error": {
    "message": "Descrição do erro",
    "code": "ERROR_CODE"
  }
}


## DEPLOYMENT & ESCALABILIDADE

Pronto para:
✅ Docker containerization
✅ Kubernetes orchestration
✅ Load balancing (nginx, haproxy)
✅ Database replication
✅ Redis caching
✅ Message queues (RabbitMQ, Kafka)
✅ CI/CD pipelines
✅ Prometheus monitoring
✅ ELK stack logging
✅ Horizontal scaling

═════════════════════════════════════════════════════════════════════════════════

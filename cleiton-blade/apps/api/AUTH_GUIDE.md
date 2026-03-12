# Guia de Autenticação JWT

## Fluxo de Autenticação

### 1. Registro
```bash
POST /auth/register
Content-Type: application/json

{
  "name": "João Silva",
  "email": "joao@example.com",
  "password": "senha123"
}

Resposta:
{
  "success": true,
  "data": {
    "id": "uuid-do-usuario",
    "name": "João Silva",
    "email": "joao@example.com",
    "role": "admin"
  }
}
```

### 2. Login
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "joao@example.com",
  "password": "senha123"
}

Resposta:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "user": {
      "id": "uuid-do-usuario",
      "email": "joao@example.com",
      "name": "João Silva",
      "role": "admin"
    }
  }
}
```

### 3. Usar o Token em Requisições
```bash
GET /auth/me
Authorization: Bearer eyJhbGc...

Resposta:
{
  "success": true,
  "data": {
    "id": "uuid-do-usuario",
    "email": "joao@example.com",
    "name": "João Silva",
    "role": "admin"
  }
}
```

### 4. Renovar Token
```bash
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Resposta:
{
  "success": true,
  "data": {
    "accessToken": "novo-token",
    "refreshToken": "novo-refresh-token"
  }
}
```

## Rotas Protegidas

### Autenticação Obrigatória
Estas rotas **requerem** um JWT válido no header `Authorization: Bearer <token>`:

- **Services**: POST, PUT, PUT /:id/toggle, DELETE
- **Clients**: POST, PUT, DELETE
- **Professionals**: POST, PUT, DELETE, GET (todos)
- **Appointments**: GET, POST, PUT, DELETE (todos)
- **Payments**: GET, POST, PUT (todos)

### Rotas Públicas
Estas rotas **NÃO** requerem autenticação:

- **Services**: GET (listar), GET :id (obter individual)
- **Clients**: GET (listar), GET /phone/:phone
- **Professionals**: (nenhuma - todas requerem auth)
- **Appointments**: (nenhuma - todas requerem auth)
- **Payments**: (nenhuma - todas requerem auth)

## Códigos de Erro

| Código | Significado |
|--------|------------|
| 401    | Não autenticado (token inválido, expirado ou ausente) |
| 403    | Não autorizado (sem permissão para recurso) |
| 400    | Requisição inválida (dados errados no body) |

## Exemplo: Criar Serviço com Autenticação

### Sem Token (vai falhar)
```bash
curl -X POST http://localhost:3000/services \
  -H "Content-Type: application/json" \
  -d '{"name": "Corte", "durationMinutes": 30, "price": 50}'

# Resposta: 401 Unauthorized
```

### Com Token (vai funcionar)
```bash
curl -X POST http://localhost:3000/services \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{"name": "Corte", "durationMinutes": 30, "price": 50}'

# Resposta: 201 Created
```

## Testando Autenticação

Execute o script de teste:
```bash
npm run dev  # em um terminal
node test-auth.js  # em outro terminal
```

Isso fará testes automáticos de:
1. Registro
2. Login
3. Obter perfil do usuário
4. Tentar acessar sem token
5. Criar recurso com auth
6. Tentar criar recurso sem auth

## Configuração (Variáveis de Ambiente)

Em `apps/api/.env`:

```env
JWT_SECRET=seu_secret_muito_seguro_aqui
JWT_EXPIRATION=7d              # Token expira em 7 dias
JWT_REFRESH_SECRET=outro_secret
JWT_REFRESH_EXPIRATION=30d    # Refresh token expira em 30 dias
```

## Boas Práticas

✅ **Sempre use HTTPS em produção** - tokens podem ser interceptados
✅ **Guarde tokens seguros** - nunca coloque em logs ou código
✅ **Use refresh tokens** - access token válido por pouco tempo
✅ **Implemente logout** - remova tokens do cliente
✅ **Valide roles** - nem todo autenticado tem acesso a tudo

❌ **Nunca** coloque tokens na URL: `?token=xxx`
❌ **Nunca** coloque variáveis sensíveis no git
❌ **Nunca** reutilize JWT para múltiplos usuários
❌ **Nunca** ignore erros de token expirado

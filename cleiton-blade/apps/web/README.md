# Cleiton Blade System - Frontend Web

Frontend web profissional para o sistema de agendamento Cleiton Blade. Desenvolvido em **Next.js 14** com **TypeScript** e **Tailwind CSS**.

## 🏗️ Arquitetura

### Stack Tecnológico
- **Framework**: Next.js 14 (App Router)
- **Linguagem**: TypeScript
- **UI/UX**: Tailwind CSS
- **State Management**: Context API + React Hooks
- **HTTP Client**: Axios
- **Date Handling**: date-fns
- **Forms**: React Hook Form

### Estrutura de Pastas
```
src/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Layout raiz com providers
│   ├── page.tsx           # Página inicial (redirect)
│   ├── login/
│   │   └── page.tsx       # Página de login
│   └── dashboard/
│       ├── layout.tsx     # Layout do dashboard
│       ├── page.tsx       # Dashboard principal
│       ├── professionals/ # Gerenciamento de profissionais
│       ├── services/      # Gerenciamento de serviços
│       ├── appointments/  # Gerenciamento de agendamentos
│       └── payments/      # Gerenciamento de pagamentos
├── components/            # Componentes reutilizáveis
│   ├── Button.tsx
│   ├── Input.tsx
│   └── ...
├── context/               # Context API
│   └── AuthContext.tsx    # Contexto de autenticação
├── hooks/                 # Custom React hooks
├── lib/                   # Utilidades e funções
│   └── api.ts            # API client com axios
├── types/                 # TypeScript types
│   └── index.ts          # Tipos comuns
├── utils/                # Funções auxiliares
└── styles/               # Estilos globais
    └── globals.css
```

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 16+
- npm ou yarn

### Instalação

```bash
# Navegar para o diretório
cd cleiton-blade-web

# Instalar dependências
npm install

# Configurar variáveis de ambiente
cp .env.example .env.local
# Editar .env.local com a URL da API
```

### Variáveis de Ambiente
```env
# URL da API backend
NEXT_PUBLIC_API_URL=http://localhost:3000

# Informações da aplicação
NEXT_PUBLIC_APP_NAME=Cleiton Blade System
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Iniciar Desenvolvimento

```bash
npm run dev
```

A aplicação estará disponível em `http://localhost:3000`

## 📋 Funcionalidades

### Core Features
- ✅ Autenticação JWT com Context API
- ✅ Login/Logout
- ✅ Dashboard personalizável por role (admin/professional)
- ✅ Gerenciamento de profissionais
- ✅ Gerenciamento de serviços
- ✅ Visualização de agendamentos
- ✅ Gerenciamento de pagamentos
- ✅ Tokens refresh automático
- ✅ LocalStorage para persistência

### Em Desenvolvimento
- 📝 Agendamento de clientes
- 📅 Visualização interativa de calendário
- 💳 Integração com gateways de pagamento
- 📱 App responsivo mobile
- 🔔 Notificações em tempo real
- 📊 Relatórios e analytics

## 🔐 Autenticação

### Login
```
Email: admin@cleiton-blade.com
Senha: admin123456
```

O sistema usa JWT (JSON Web Tokens):
- **Access Token**: Válido por 7 dias, usado para requisições
- **Refresh Token**: Válido por 30 dias, usado para renovar access token
- Tokens armazenados em `localStorage`

### Fluxo de Autenticação
1. Usuário faz login com email/senha
2. Backend retorna access & refresh tokens
3. Frontend armazena tokens no localStorage
4. Cada requisição adiciona token no header `Authorization: Bearer <token>`
5. Se token expirar (401), frontend tenta renovar automaticamente
6. Se refresh falhar, usuário é redirecionado para login

## 📡 API Integration

### API Client (axios)
```typescript
import { ApiService, authService, appointmentService } from '@/lib/api';

// Usar diretamente
const response = await ApiService.get('/users');

// Ou usar serviços especializados
const appointments = await appointmentService.list();
const slots = await appointmentService.getAvailableSlots(professionalId, date, serviceId);
```

### Interceptores
- **Request**: Adiciona token Bearer no header
- **Response**: Captura erros 401 e tenta renovar token
- **Error Handling**: Retorna objeto padronizado mesmo em caso de erro

## 🎨 Componentes Reutilizáveis

### Button
```tsx
<Button
  variant="primary"      // 'primary' | 'secondary' | 'danger' | 'ghost'
  size="md"             // 'sm' | 'md' | 'lg'
  isLoading={false}
  onClick={...}
>
  Clique aqui
</Button>
```

### Input
```tsx
<Input
  type="email"
  label="Email"
  error={errors.email}
  helperText="Digite um email válido"
  icon={<IconComponent />}
  onChange={handleChange}
/>
```

## 🏠 Roles e Permissões

### Admin
- Dashboard completo
- Gerenciar profissionais
- Gerenciar serviços
- Visualizar todos os agendamentos
- Visualizar pagamentos

### Professional
- Minha agenda
- Meus horários de trabalho
- Meus agendamentos
- Histórico de pagamentos

### Client
- Agendar serviços
- Visualizar horários disponíveis
- Histórico de agendamentos
- Gerenciar perfil

## 🔄 Estado da Aplicação

### Context API (AuthContext)
```typescript
const { user, tokens, isLoading, error, login, logout, register, refreshTokens } = useAuth();
```

- `user`: Dados do usuário logado
- `tokens`: Access & refresh tokens
- `isLoading`: Carregando dados
- `error`: Mensagem de erro
- Métodos: `login()`, `logout()`, `register()`, `refreshTokens()`

## 📝 Development Scripts

```bash
# Desenvolvimento
npm run dev

# Build
npm run build

# Produção
npm run start

# Type check
npm run type-check
```

## 🐛 Troubleshooting

### "API está retornando 401"
- Verifique se o token está sendo enviado
- Verifique se o token não expirou
- Limpe localStorage e faça login novamente

### "Componentes não aparecem"
- Verifique se Tailwind CSS está configurado
- Reinicie o servidor `npm run dev`
- Verifique importações de tipos

### "TypeScript errors"
- Execute `npm run type-check`
- Verifique tipos em `src/types/index.ts`
- Verifique respostas da API

## 📦 Dependências Principais

```json
{
  "next": "^14.0.0",
  "react": "^18.2.0",
  "typescript": "^5.3.0",
  "axios": "^1.6.0",
  "tailwindcss": "^3.3.0",
  "react-hook-form": "^7.48.0",
  "react-query": "^3.39.0",
  "date-fns": "^2.30.0"
}
```

## 🚀 Próximos Passos

1. **Expandir páginas admin**: Profissionais, Serviços, Agendamentos
2. **Interface de agendamento cliente**: Calendar integrado
3. **Integração de pagamentos**: Stripe/Mercado Pago
4. **Notificações**: Toast/Snackbar
5. **Formulário dinâmicos**: React Hook Form + validação
6. **Dark mode**: Tema escuro com Tailwind
7. **Responsividade**: Mobile first design
8. **Performance**: Image optimization, code splitting

## 📄 Licença

Propriedade - Cleiton Blade System

---

**Versão**: 1.0.0  
**Frontend**: Next.js 14 + TypeScript  
**Status**: ✅ Em Desenvolvimento

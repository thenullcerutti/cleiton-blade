#!/usr/bin/env node

/**
 * Script de Configuração de Segurança - Email Verification & Rate Limiting
 * Configure estas variáveis de ambiente no seu .env antes de colocar em produção
 */

const fs = require('fs');
const path = require('path');

const envPath = path.join(__dirname, '../.env');

const securityConfig = `
# ═══════════════════════════════════════════════════════════════════════════
# 🔐 CONFIGURAÇÕES DE SEGURANÇA - EMAIL VERIFICATION
# ═══════════════════════════════════════════════════════════════════════════

# Email Verification Configuration
# Defina as credenciais SMTP para enviar emails de confirmação
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=seu_email@gmail.com
SMTP_PASS=sua_senha_ou_app_password
EMAIL_FROM=noreply@cleitonblade.com
FRONTEND_URL=http://localhost:3002

# Tempo de expiração do token de verificação (em horas)
EMAIL_VERIFICATION_EXPIRY=24

# ═══════════════════════════════════════════════════════════════════════════
# 🛡️ RATE LIMITING - Proteção contra Brute Force & Spam
# ═══════════════════════════════════════════════════════════════════════════

# Limite de registros por IP por hora (padrão: 5)
RATE_LIMIT_REGISTER_PER_IP=5

# Limite de tentativas de login por email por 15 minutos (padrão: 10)
RATE_LIMIT_LOGIN_PER_EMAIL=10

# Limite geral de requisições por IP por hora (padrão: 50)
RATE_LIMIT_PER_IP=50

# Limite de requisições por endpoint por hora (padrão: 100)
RATE_LIMIT_PER_ENDPOINT=100

# ═══════════════════════════════════════════════════════════════════════════
# 🤖 GOOGLE reCAPTCHA v3 - Proteção contra Bots
# ═══════════════════════════════════════════════════════════════════════════

# Obtenha em: https://www.google.com/recaptcha/admin
# Deixe em branco para desabilitar CAPTCHA (apenas desenvolvimento)

RECAPTCHA_SITE_KEY=seu_site_key_aqui
RECAPTCHA_SECRET_KEY=seu_secret_key_aqui

# Score mínimo do reCAPTCHA v3 (0-1, padrão: 0.5)
# 0.9+ = muito provável humano
# 0.3-0.5 = suspeito
# <0.3 = muito provável bot
RECAPTCHA_MIN_SCORE=0.5

# Desabilitar CAPTCHA em desenvolvimento (true/false)
RECAPTCHA_DISABLED=true

# ═══════════════════════════════════════════════════════════════════════════
# 📧 INSTRUÇÕES DE SETUP
# ═══════════════════════════════════════════════════════════════════════════

# 1️⃣ CONFIGURAR EMAIL (SMTP)
# ─────────────────────────────
# Opção A: Gmail (Recomendado para desenvolvimento)
#   1. Vá em: https://myaccount.google.com/apppasswords
#   2. Crie uma senha de app para "Mail"
#   3. Use a senha gerada no SMTP_PASS
#   4. SMTP_HOST=smtp.gmail.com, SMTP_PORT=587
#
# Opção B: SendGrid (Recomendado para produção)
#   1. Crie conta em: https://sendgrid.com
#   2. Gere API Key
#   3. SMTP_HOST=smtp.sendgrid.net, SMTP_PORT=587
#   4. SMTP_USER=apikey, SMTP_PASS=seu_api_key
#
# Opção C: Mailgun, AWS SES, etc. (Consulte documentação própria)

# 2️⃣ CONFIGURAR reCAPTCHA (Opcional)
# ─────────────────────────────────
#   1. Vá em: https://www.google.com/recaptcha/admin
#   2. Crie novo site com tipo "reCAPTCHA v3"
#   3. Copie Site Key e Secret Key para o .env
#   4. Em produção, defina RECAPTCHA_DISABLED=false
#   5. No frontend, instale: npm install react-google-recaptcha-v3

# 3️⃣ TESTAR FLUXO COMPLETO
# ─────────────────────────
# npm run dev
# POST http://localhost:3000/auth/register
# {
#   "name": "João",
#   "email": "joao@example.com",
#   "password": "senha123",
#   "captchaToken": "token_do_frontend"
# }

# ═══════════════════════════════════════════════════════════════════════════
# 🚨 ESTRUTURA DO BANCO DE DADOS
# ═══════════════════════════════════════════════════════════════════════════

# Execute a migration para criar tabelas de email verification:
# npm run migrate

# Tabelas criadas:
# - email_verifications (tokens únicos de verificação)
# - Coluna users.verified_at (timestamp da verificação)

# ═══════════════════════════════════════════════════════════════════════════
# 🔒 POLÍTICA DE SEGURANÇA
# ═══════════════════════════════════════════════════════════════════════════

# CAMADA 1: Validação de Email
#   - Formato válido (RFC 5322 básico)
#   - Rejeita domínios temporários (tempmail.com, etc)
#   - Detecta padrões suspeitos

# CAMADA 2: Email Verification
#   - Token único de 64 caracteres
#   - Expira em 24 horas
#   - Requisito: Usuário não pode fazer login sem confirmar email

# CAMADA 3: Rate Limiting
#   - 5 registros por IP por hora
#   - 10 tentativas de login por email por 15 minutos
#   - Bloqueio automático após múltiplas violações

# CAMADA 4: Trust Score
#   - Calcula confiança da requisição (0-100)
#   - Analisa IP, User-Agent, padrões de email
#   - Rejeita se score < 20

# CAMADA 5: reCAPTCHA v3
#   - Verificação invisível em background
#   - Score >= 0.5 necessário para proceder
#   - IP suspeitos é bloqueado por 24h

# ═══════════════════════════════════════════════════════════════════════════
`;

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║          🔐 CONFIGURAÇÃO DE SEGURANÇA - CLEITON BLADE                     ║
╚════════════════════════════════════════════════════════════════════════════╝

📋 INSTRUÇÕES:
1. Copie as variáveis de ambiente do arquivo abaixo
2. Configure SMTP para enviar emails
3. Configure reCAPTCHA (opcional, recomendado em produção)
4. Execute: npm run migrate
5. Teste o fluxo completo

${securityConfig}
`);

// Tentar salvar exemplos em arquivo
const outputPath = path.join(__dirname, 'SECURITY_CONFIG.env.example');
try {
  fs.writeFileSync(outputPath, securityConfig);
  console.log(`\n✅ Exemplo de configuração salvo em: ${outputPath}`);
} catch (err) {
  console.warn(`\n⚠️  Não foi possível salvar arquivo: ${err.message}`);
}

console.log(`
🚀 PRÓXIMOS PASSOS:
1. Edite seu arquivo .env e adicione as variáveis acima
2. Configure seu serviço SMTP (Gmail, SendGrid, etc)
3. Configure reCAPTCHA v3 em https://www.google.com/recaptcha/admin
4. Execute as migrations: npm run migrate
5. Teste a API: npm run dev

💡 Dúvidas? Leia a documentação em: SECURITY_CONFIG.env.example
`);

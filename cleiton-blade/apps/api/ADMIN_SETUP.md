# 🔐 Setup do Admin - Cleiton Blade

## 📋 Visão Geral

Admin é **criado manualmente no servidor** via script `seed-admin.js`, garantindo máxima segurança. Impossível criar outro admin via interface.

## 🚀 Passos para Configurar

### **PASSO 1: Definir Credenciais no .env**

Abra `apps/api/.env` e configure:

```dotenv
# ==================== ADMIN ====================
ADMIN_EMAIL=seu_email@cleitonblade.com
ADMIN_PASSWORD=SuaSenhaForte@2026!
```

⚠️ **Requisitos de Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 maiúscula
- Pelo menos 1 número
- Pelo menos 1 símbolo

### **PASSO 2: Executar o Seed**

```bash
# Na pasta raiz
cd apps/api

# Criar/atualizar admin
npm run seed:admin
```

**Saída esperada:**
```
🔐 Criando/Atualizando conta admin...
📧 Email: seu_email@cleitonblade.com

✅ Admin criado com sucesso!

📌 ID: [uuid]
📌 Email: seu_email@cleitonblade.com
📌 Role: admin

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 Credenciais de Login:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 Email: seu_email@cleitonblade.com
🔑 Senha: SuaSenhaForte@2026!

⚠️  GUARDE ESSA SENHA EM UM LUGAR SEGURO!

💡 Próximo passo: npm run dev
```

### **PASSO 3: Iniciar Servidor**

```bash
cd ../../
npm run dev
```

### **PASSO 4: Login Admin**

Acesse: **http://localhost:3002/admin/login**

Use as credenciais:
- **Email:** seu_email@cleitonblade.com
- **Senha:** SuaSenhaForte@2026!

## 🔒 Recursos de Segurança

✅ **Admin Único** - Apenas uma conta admin no sistema  
✅ **Sem Interface de Criação** - Impossível criar via `/register`  
✅ **Email Verificado** - Admin é automaticamente verificado  
✅ **Senha Hash** - Bcrypt com 10 rounds  
✅ **Rate Limiting** - Proteção contra brute force no login  
✅ **JWT Auth** - Tokens de acesso e refresh  

## 💡 Operações Comuns

### **Mudar Senha do Admin**

1. Edite `.env`:
```dotenv
ADMIN_PASSWORD=NovaSenha@2026!
```

2. Execute:
```bash
npm run seed:admin
```

3. Faça login com a nova senha

### **Resetar Admin para Padrão**

```bash
# Remove admin existente e recria com credenciais padrão
npm run seed:admin
```

### **Distribuir Acesso a Outro Usuário**

Para dar acesso a outro usuário:

1. **Não compartilhe a conta admin** (contra-intuitivo mas seguro!)
2. **Ao invés disso:** Crie uma conta normal com role `professional` ou `client`
3. Use RLS policies para controlar permissões no banco

## ⚠️ Boas Práticas

❌ **NUNCA:**
- Coloque a senha do admin no código/git (use .env)
- Compartilhe a conta admin entre múltiplas pessoas
- Use a senha padrão em produção

✅ **SEMPRE:**
- Use uma senha forte e única
- Guarde a senha em um gerenciador seguro (1Password, Bitwarden, etc)
- Mude a senha regularmente
- Para acesso de múltiplas pessoas, crie contas separadas

## 🔍 Troubleshooting

### **Erro: "Cannot find module 'helpers'"**
Certifique-se de reexecutar `npm install` após alterações em dependências.

### **Admin não foi criado**
Verifique se o banco de dados está acessível:
```bash
npm run migrate
```

### **Erro ao fazer login**
1. Verifique se o email está correto
2. Verifique se a password foi salva corretamente no .env
3. Reexecute `npm run seed:admin`

## 📚 Referências

- [Seed Script](./seed-admin.js)
- [AuthController](./src/modules/auth/AuthController.js)
- [AuthService](./src/modules/auth/AuthService.js)

---

**Dúvidas?** Consulte `setup-security.js` para informações sobre outras camadas de segurança.

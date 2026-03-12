#!/bin/bash
# ============================================================================
# CLEITON BLADE SYSTEM - PostgreSQL Setup Script
# ============================================================================

echo "🔧 Iniciando setup do PostgreSQL..."

# Check if psql is available
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL não está instalado ou não está no PATH"
    echo "Por favor instale PostgreSQL: https://www.postgresql.org/download/"
    exit 1
fi

echo "✅ PostgreSQL encontrado"

# Create database using the init.sql script
echo "📝 Criando banco de dados..."

psql -U postgres -f init.sql

if [ $? -eq 0 ]; then
    echo "✅ Banco de dados criado com sucesso!"
    echo ""
    echo "Próximos passos:"
    echo "  1. npm install"
    echo "  2. npm run migrate"
    echo "  3. npm run seed"
    echo "  4. npm run dev"
else
    echo "❌ Erro ao criar banco de dados"
    echo "Verifique se PostgreSQL está rodando e se tem permissão"
    exit 1
fi

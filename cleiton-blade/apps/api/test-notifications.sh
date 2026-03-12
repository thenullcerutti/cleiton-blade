#!/bin/bash

# Script de teste para o sistema de notificações de agendamento
# Uso: bash test-notifications-api.sh

BASE_URL="http://localhost:3000"
CLIENT_TOKEN="seu_token_cliente_aqui"
ADMIN_TOKEN="seu_token_admin_aqui"

echo "========================================="
echo "Testes do Sistema de Notificações"
echo "========================================="

YELLOW='\033[1;33m'
GREEN='\033[0;32m'
NC='\033[0m'

# =========================================
# 1. OBTER PREFERÊNCIAS
# =========================================
echo ""
echo -e "${GREEN}=== 1. OBTER PREFERÊNCIAS ===${NC}"
echo -e "${YELLOW}GET /api/notifications/preferences${NC}"
curl -s -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/notifications/preferences" | json_pp

# =========================================
# 2. HABILITAR/DESABILITAR CANAIS
# =========================================
echo ""
echo -e "${GREEN}=== 2. DESABILITAR WhatsApp ===${NC}"
echo -e "${YELLOW}POST /api/notifications/preferences/channel/whatsapp/toggle?enabled=false${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/notifications/preferences/channel/whatsapp/toggle?enabled=false" | json_pp

echo ""
echo -e "${GREEN}=== 3. HABILITAR Email ===${NC}"
echo -e "${YELLOW}POST /api/notifications/preferences/channel/email/toggle?enabled=true${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/notifications/preferences/channel/email/toggle?enabled=true" | json_pp

echo ""
echo -e "${GREEN}=== 4. DESABILITAR SMS ===${NC}"
echo -e "${YELLOW}POST /api/notifications/preferences/channel/sms/toggle?enabled=false${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/notifications/preferences/channel/sms/toggle?enabled=false" | json_pp

# =========================================
# 3. HABILITAR/DESABILITAR LEMBRETES
# =========================================
echo ""
echo -e "${GREEN}=== 5. DESABILITAR LEMBRETE MATINAL ===${NC}"
echo -e "${YELLOW}POST /api/notifications/preferences/reminder/morning/toggle?enabled=false${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/notifications/preferences/reminder/morning/toggle?enabled=false" | json_pp

echo ""
echo -e "${GREEN}=== 6. HABILITAR LEMBRETE 1 HORA ANTES ===${NC}"
echo -e "${YELLOW}POST /api/notifications/preferences/reminder/one_hour_before/toggle?enabled=true${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/notifications/preferences/reminder/one_hour_before/toggle?enabled=true" | json_pp

# =========================================
# 4. DEFINIR HORAS SILENCIOSAS
# =========================================
echo ""
echo -e "${GREEN}=== 7. DEFINIR HORAS SILENCIOSAS ===${NC}"
echo -e "${YELLOW}POST /api/notifications/preferences/quiet-hours${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "quiet_hours_start": "22:00",
    "quiet_hours_end": "07:00"
  }' \
  "${BASE_URL}/api/notifications/preferences/quiet-hours" | json_pp

# =========================================
# 5. ATUALIZAR TODAS AS PREFERÊNCIAS
# =========================================
echo ""
echo -e "${GREEN}=== 8. ATUALIZAR TODAS AS PREFERÊNCIAS ===${NC}"
echo -e "${YELLOW}PUT /api/notifications/preferences${NC}"
curl -s -X PUT \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "whatsapp_enabled": true,
    "email_enabled": true,
    "sms_enabled": false,
    "morning_reminder_enabled": true,
    "one_hour_before_enabled": true
  }' \
  "${BASE_URL}/api/notifications/preferences" | json_pp

# =========================================
# 6. OBTER HISTÓRICO DE NOTIFICAÇÕES
# =========================================
echo ""
echo -e "${GREEN}=== 9. OBTER HISTÓRICO ===${NC}"
echo -e "${YELLOW}GET /api/notifications/history?limit=20${NC}"
curl -s -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/notifications/history?limit=20" | json_pp

# =========================================
# 7. ENVIAR NOTIFICAÇÕES PENDENTES (ADMIN)
# =========================================
echo ""
echo -e "${GREEN}=== 10. ENVIAR NOTIFICAÇÕES PENDENTES (ADMIN) ===${NC}"
echo -e "${YELLOW}POST /api/notifications/send-pending${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  "${BASE_URL}/api/notifications/send-pending" | json_pp

# =========================================
# TESTE COMPLETO DE AGENDAMENTO
# =========================================
echo ""
echo -e "${GREEN}=== 11. CRIAR AGENDAMENTO COM NOTIFICAÇÕES ===${NC}"
echo -e "${YELLOW}POST /api/appointments${NC}"

# Calcular data de amanhã
TOMORROW=$(date -u -d "+1 day" +"%Y-%m-%dT14:30:00.000Z" 2>/dev/null || date -u -v+1d +"%Y-%m-%dT14:30:00.000Z")

curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{
    \"professionalId\": \"prof-123\",
    \"serviceId\": \"service-1\",
    \"appointmentDatetime\": \"${TOMORROW}\",
    \"clientName\": \"João Silva\",
    \"clientPhone\": \"+5511999999999\",
    \"clientEmail\": \"joao@example.com\",
    \"observations\": \"Cliente prefere tesoura americana\",
    \"notificationsEnabled\": true
  }" \
  "${BASE_URL}/api/appointments" | json_pp

echo ""
echo -e "${GREEN}=========================================${NC}"
echo "Testes concluídos!"
echo -e "${GREEN}=========================================${NC}"

echo ""
echo "📝 NOTAS:"
echo "1. Este script assume que você tem os tokens de cliente e admin"
echo "2. Substitua CLIENT_TOKEN e ADMIN_TOKEN com valores reais"
echo "3. Os endpoints esperam que a migrations já tenham sido rodadas"
echo "4. As notificações serão agendadas após criar um agendamento"
echo "5. Use POST /api/notifications/send-pending para dispara notificações pendentes"

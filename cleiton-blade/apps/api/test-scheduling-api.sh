#!/bin/bash

# Script de teste da API de Agendamento
# Uso: bash test-scheduling-api.sh

BASE_URL="http://localhost:3000"
ADMIN_TOKEN="seu_token_admin_aqui"
PROF_TOKEN="seu_token_profissional_aqui"
CLIENT_TOKEN="seu_token_cliente_aqui"

PROF_ID="prof-123"
SERVICE_ID="service-1"
SLOT_ID="slot-1"
APPOINTMENT_ID="appt-1"

echo "========================================="
echo "Testes da API de Agendamento"
echo "========================================="

# Cor de saída
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função auxiliar para fazer requisições
make_request() {
  local method=$1
  local endpoint=$2
  local data=$3
  local token=$4

  echo ""
  echo -e "${YELLOW}${method} ${endpoint}${NC}"
  
  if [ -z "$data" ]; then
    curl -s -X "${method}" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      "${BASE_URL}${endpoint}" | json_pp
  else
    echo -e "${YELLOW}Body: ${data}${NC}"
    curl -s -X "${method}" \
      -H "Authorization: Bearer ${token}" \
      -H "Content-Type: application/json" \
      -d "${data}" \
      "${BASE_URL}${endpoint}" | json_pp
  fi
}

# =========================================
# 1. TESTES DE WORKING HOURS
# =========================================
echo ""
echo -e "${GREEN}=== 1. WORKING HOURS ===${NC}"

# 1.1 - Obter horários de trabalho
echo -e "\n${YELLOW}Test 1.1: Obter horários de trabalho${NC}"
curl -s "${BASE_URL}/api/working-hours/${PROF_ID}" | json_pp

# 1.2 - Criar horário de trabalho (Segunda)
echo -e "\n${YELLOW}Test 1.2: Criar horário (Segunda 09:00-18:00)${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${PROF_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "'${PROF_ID}'",
    "dayOfWeek": 1,
    "startTime": "09:00",
    "endTime": "18:00"
  }' \
  "${BASE_URL}/api/working-hours" | json_pp

# 1.3 - Criar horário (Terça)
echo -e "\n${YELLOW}Test 1.3: Criar horário (Terça 09:00-18:00)${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${PROF_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "professionalId": "'${PROF_ID}'",
    "dayOfWeek": 2,
    "startTime": "09:00",
    "endTime": "18:00"
  }' \
  "${BASE_URL}/api/working-hours" | json_pp

# 1.4 - Desabilitar um dia (Segunda)
echo -e "\n${YELLOW}Test 1.4: Desabilitar Segunda${NC}"
curl -s -X PATCH \
  -H "Authorization: Bearer ${PROF_TOKEN}" \
  "${BASE_URL}/api/working-hours/work-1/toggle?enabled=false" | json_pp

# =========================================
# 2. TESTES DE AVAILABILITY
# =========================================
echo ""
echo -e "${GREEN}=== 2. AVAILABILITY ===${NC}"

# 2.1 - Obter slots disponíveis
echo -e "\n${YELLOW}Test 2.1: Obter slots disponíveis${NC}"
curl -s "${BASE_URL}/api/availability/slots?professionalId=${PROF_ID}&startDate=2026-03-01&endDate=2026-03-31" | json_pp

# 2.2 - Obter slots com filtro de serviço
echo -e "\n${YELLOW}Test 2.2: Obter slots filtrando por serviço${NC}"
curl -s "${BASE_URL}/api/availability/slots?professionalId=${PROF_ID}&startDate=2026-03-01&endDate=2026-03-31&serviceId=${SERVICE_ID}" | json_pp

# 2.3 - Próximo slot disponível
echo -e "\n${YELLOW}Test 2.3: Próximo slot disponível${NC}"
curl -s "${BASE_URL}/api/availability/slots/next?professionalId=${PROF_ID}" | json_pp

# 2.4 - Bloquear slot
echo -e "\n${YELLOW}Test 2.4: Bloquear um slot${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${PROF_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Almoço"
  }' \
  "${BASE_URL}/api/availability/slots/${SLOT_ID}/block" | json_pp

# 2.5 - Desbloquear slot
echo -e "\n${YELLOW}Test 2.5: Desbloquear slot${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${PROF_TOKEN}" \
  "${BASE_URL}/api/availability/slots/${SLOT_ID}/unblock" | json_pp

# 2.6 - Bloquear múltiplos slots
echo -e "\n${YELLOW}Test 2.6: Bloquear múltiplos slots${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "slotIds": ["slot-1", "slot-2", "slot-3"],
    "reason": "Feriado nacional"
  }' \
  "${BASE_URL}/api/availability/slots/block-multiple" | json_pp

# 2.7 - Slots bloqueados
echo -e "\n${YELLOW}Test 2.7: Obter slots bloqueados${NC}"
curl -s "${BASE_URL}/api/availability/blocked-slots?professionalId=${PROF_ID}&startDate=2026-03-01&endDate=2026-03-31" | json_pp

# 2.8 - Estatísticas de disponibilidade
echo -e "\n${YELLOW}Test 2.8: Estatísticas de disponibilidade${NC}"
curl -s "${BASE_URL}/api/availability/stats?professionalId=${PROF_ID}&startDate=2026-03-01&endDate=2026-03-31" | json_pp

# =========================================
# 3. TESTES DE APPOINTMENTS
# =========================================
echo ""
echo -e "${GREEN}=== 3. APPOINTMENTS ===${NC}"

# 3.1 - Listar todos (admin)
echo -e "\n${YELLOW}Test 3.1: Listar todos os agendamentos (Admin)${NC}"
curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  "${BASE_URL}/api/appointments" | json_pp

# 3.2 - Criar novo agendamento (cliente)
echo -e "\n${YELLOW}Test 3.2: Criar novo agendamento${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "slotId": "'${SLOT_ID}'",
    "serviceId": "'${SERVICE_ID}'",
    "professionalId": "'${PROF_ID}'",
    "notes": "Preferência: tesoura americana"
  }' \
  "${BASE_URL}/api/appointments" | json_pp

# 3.3 - Meus agendamentos (cliente)
echo -e "\n${YELLOW}Test 3.3: Meus agendamentos${NC}"
curl -s -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/appointments/my" | json_pp

# 3.4 - Agendamentos do profissional
echo -e "\n${YELLOW}Test 3.4: Agendamentos do profissional${NC}"
curl -s -H "Authorization: Bearer ${PROF_TOKEN}" \
  "${BASE_URL}/api/appointments/professional?startDate=2026-03-01&endDate=2026-03-31" | json_pp

# 3.5 - Obter agendamento específico
echo -e "\n${YELLOW}Test 3.5: Obter agendamento específico${NC}"
curl -s -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  "${BASE_URL}/api/appointments/${APPOINTMENT_ID}" | json_pp

# 3.6 - Confirmar agendamento
echo -e "\n${YELLOW}Test 3.6: Confirmar agendamento${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${PROF_TOKEN}" \
  "${BASE_URL}/api/appointments/${APPOINTMENT_ID}/confirm" | json_pp

# 3.7 - Reagendar
echo -e "\n${YELLOW}Test 3.7: Reagendar agendamento${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "newSlotId": "slot-2"
  }' \
  "${BASE_URL}/api/appointments/${APPOINTMENT_ID}/reschedule" | json_pp

# 3.8 - Não compareceu
echo -e "\n${YELLOW}Test 3.8: Marcar como não comparecido${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${PROF_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Cliente não compareceu"
  }' \
  "${BASE_URL}/api/appointments/${APPOINTMENT_ID}/no-show" | json_pp

# 3.9 - Concluir agendamento
echo -e "\n${YELLOW}Test 3.9: Marcar como concluído${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${PROF_TOKEN}" \
  "${BASE_URL}/api/appointments/${APPOINTMENT_ID}/complete" | json_pp

# 3.10 - Cancelar agendamento
echo -e "\n${YELLOW}Test 3.10: Cancelar agendamento${NC}"
curl -s -X POST \
  -H "Authorization: Bearer ${CLIENT_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{
    "reason": "Imprevistos pessoais"
  }' \
  "${BASE_URL}/api/appointments/${APPOINTMENT_ID}/cancel" | json_pp

# 3.11 - Estatísticas de agendamentos
echo -e "\n${YELLOW}Test 3.11: Estatísticas de agendamentos${NC}"
curl -s -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  "${BASE_URL}/api/appointments/stats?professionalId=${PROF_ID}&startDate=2026-03-01&endDate=2026-03-31" | json_pp

echo ""
echo -e "${GREEN}=========================================${NC}"
echo "Testes concluídos!"
echo -e "${GREEN}=========================================${NC}"

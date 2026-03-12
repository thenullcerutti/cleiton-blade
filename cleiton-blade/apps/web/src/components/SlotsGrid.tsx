/**
 * Componente de Slots de Horários Disponíveis
 * Exibe os horários disponíveis em intervalos de 15 minutos
 */

'use client';

import api from '@/lib/api';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

interface AvailabilitySlot {
  id: string;
  slot_time: string;
  is_available: boolean;
  professional_id: string;
}

interface SlotsGridProps {
  date: Date | null;
  professionalId?: string;
  serviceId?: string;
  onSlotSelect?: (slotId: string, time: string) => void;
}

export const SlotsGrid = ({ 
  date, 
  professionalId = '1',
  serviceId = '1',
  onSlotSelect 
}: SlotsGridProps) => {
  const router = useRouter();
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!date) {
      setSlots([]);
      return;
    }

    const fetchSlots = async () => {
      try {
        setLoading(true);
        setError(null);

        const startDate = new Date(date);
        startDate.setHours(0, 0, 0, 0);

        const endDate = new Date(date);
        endDate.setHours(23, 59, 59, 999);

        const params = new URLSearchParams({
          professionalId: professionalId,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          serviceId: serviceId,
        });

        const response = await api.get(`/api/availability/slots?${params}`);
        setSlots(response.data || []);
      } catch (err) {
        console.error('Erro ao buscar horários:', err);
        setError('Não foi possível carregar os horários disponíveis');
        setSlots([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSlots();
  }, [date, professionalId, serviceId]);

  const handleSlotClick = (slot: AvailabilitySlot) => {
    if (!slot.is_available) return;

    if (onSlotSelect) {
      onSlotSelect(slot.id, slot.slot_time);
    } else {
      // Redirect para página de agendamento com o slot selecionado
      router.push(`/agendar?slotId=${slot.id}&time=${encodeURIComponent(slot.slot_time)}`);
    }
  };

  if (!date) {
    return (
      <div className="text-gray-400 text-center py-8">
        Selecione uma data para ver os horários disponíveis
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-gray-400 text-center py-8">
        Carregando horários...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-center py-8">
        {error}
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="text-gray-400 text-center py-8">
        Nenhum horário disponível para esta data
      </div>
    );
  }

  // Agrupar horários por hora
  const groupedByHour = slots.reduce((acc, slot) => {
    const hour = slot.slot_time.split(':')[0];
    if (!acc[hour]) {
      acc[hour] = [];
    }
    acc[hour].push(slot);
    return acc;
  }, {} as Record<string, AvailabilitySlot[]>);

  const sortedHours = Object.keys(groupedByHour).sort();

  return (
    <div className="space-y-4">
      {/* Legenda */}
      <div className="flex gap-4 text-sm text-gray-400">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-600 rounded"></div>
          <span>Agendado</span>
        </div>
      </div>

      {/* Grid de horários */}
      <div className="space-y-3">
        {sortedHours.map((hour) => (
          <div key={hour}>
            <h3 className="text-gray-500 text-sm font-medium mb-2">{hour}:00</h3>
            <div className="grid grid-cols-3 gap-2">
              {groupedByHour[hour].map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => handleSlotClick(slot)}
                  disabled={!slot.is_available}
                  className={`
                    py-2 px-3 rounded text-sm font-medium transition
                    ${slot.is_available 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600 cursor-pointer' 
                      : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                    }
                  `}
                >
                  {slot.slot_time}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Data formatada */}
      <div className="text-gray-500 text-sm mt-4 pt-4 border-t border-gray-700">
        {date.toLocaleDateString('pt-BR', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}
      </div>
    </div>
  );
};

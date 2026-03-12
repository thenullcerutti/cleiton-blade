/**
 * Página de Agendamento
 * Exibe calendário de datas + horários disponíveis + formulário de agendamento
 */

'use client';

import { BookingForm } from '@/components/BookingForm';
import { Calendar } from '@/components/Calendar';
import { SlotsGrid } from '@/components/SlotsGrid';
import { useSearchParams } from 'next/navigation';
import { Suspense, useState } from 'react';

function BookingPageContent() {
  const searchParams = useSearchParams();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(
    searchParams.get('slotId')
  );
  const [selectedSlotTime, setSelectedSlotTime] = useState<string | null>(
    searchParams.get('time')
  );

  const handleSlotSelect = (slotId: string, time: string) => {
    setSelectedSlotId(slotId);
    setSelectedSlotTime(time);
  };

  const handleSubmitSuccess = () => {
    // Limpar seleção e voltar ao calendário
    setSelectedSlotId(null);
    setSelectedSlotTime(null);
    setSelectedDate(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-white text-4xl font-bold mb-2">Agendamento de Serviços</h1>
          <p className="text-gray-400">Selecione uma data e um horário disponível</p>
        </div>

        {/* Container principal - 3 colunas em desktop */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Coluna 1: Calendário */}
          <div>
            <Calendar 
              selectedDate={selectedDate}
              onSelectDate={setSelectedDate}
            />
          </div>

          {/* Coluna 2: Horários disponíveis */}
          <div className="bg-slate-900 rounded-lg p-6">
            <h2 className="text-white text-lg font-bold mb-4">Horários Disponíveis</h2>
            <SlotsGrid 
              date={selectedDate}
              professionalId="1"
              serviceId="1"
              onSlotSelect={handleSlotSelect}
            />
          </div>

          {/* Coluna 3: Formulário de agendamento */}
          <div>
            <BookingForm 
              slotId={selectedSlotId || undefined}
              slotTime={selectedSlotTime || undefined}
              onSubmitSuccess={handleSubmitSuccess}
            />
          </div>
        </div>

        {/* Info adicional em mobile */}
        <div className="lg:hidden mt-8 bg-slate-800 rounded-lg p-4 border border-slate-700">
          <h3 className="text-white font-semibold mb-2">Como funciona:</h3>
          <ol className="text-gray-400 text-sm space-y-1 list-decimal list-inside">
            <li>Selecione uma data no calendário</li>
            <li>Escolha um horário disponível</li>
            <li>Preencha seus dados</li>
            <li>Confirme o agendamento</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center">
        <div className="text-gray-400">Carregando...</div>
      </div>
    }>
      <BookingPageContent />
    </Suspense>
  );
}

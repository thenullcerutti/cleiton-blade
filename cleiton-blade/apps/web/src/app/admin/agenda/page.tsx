'use client';

import { useEffect, useState } from 'react';

interface Agendamento {
  id: string;
  datetime: string;
  status: string;
  notes: string;
  client_id: string;
  professional_id: string;
  service_id: string;
}

export default function AgendaPage() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Horários disponíveis (07:00 até 18:00 em intervalos de 15 minutos)
  const gerarHorarios = () => {
    const horarios = [];
    for (let h = 7; h < 18; h++) {
      for (let m = 0; m < 60; m += 15) {
        horarios.push(
          `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        );
      }
    }
    return horarios;
  };

  const horarios = gerarHorarios();

  // Buscar agendamentos do dia selecionado
  const fetchAgendamentos = async (date: Date) => {
    setLoading(true);
    setError('');
    try {
      const dateStr = date.toISOString().split('T')[0];
      const response = await fetch(`/api/appointments?date=${dateStr}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setAgendamentos(data.data?.appointments || []);
      } else {
        setError(data.error?.message || 'Erro ao carregar agendamentos');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgendamentos(selectedDate);
  }, [selectedDate]);

  // Gerar dias do calendário
  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentMonth);
  const firstDay = getFirstDayOfMonth(currentMonth);
  const daysArray = [];

  // Preencher com dias vazios do mês anterior
  for (let i = 0; i < (firstDay === 0 ? 6 : firstDay - 1); i++) {
    daysArray.push(null);
  }

  // Preencher com dias do mês atual
  for (let i = 1; i <= daysInMonth; i++) {
    daysArray.push(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), i));
  }

  const isToday = (date: Date | null) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const isSelected = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  // Verificar se há agendamento em um horário específico
  const getAgendamentoAtHorario = (horario: string) => {
    return agendamentos.find(a => {
      const hora = new Date(a.datetime).toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
      });
      return hora === horario;
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Agenda</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Calendário - Lado Direito */}
          <div className="lg:col-span-1 bg-slate-800 rounded-lg p-4 h-fit border border-slate-700">
            <div className="flex justify-between items-center mb-4">
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                className="text-white hover:bg-slate-700 p-1 rounded"
              >
                {'<'}
              </button>
              <h3 className="text-white font-semibold text-center">
                {currentMonth.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
              </h3>
              <button
                onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                className="text-white hover:bg-slate-700 p-1 rounded"
              >
                {'>'}
              </button>
            </div>

            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'].map(day => (
                <div key={day} className="text-center text-xs text-slate-400 font-semibold py-1">
                  {day}
                </div>
              ))}
            </div>

            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1">
              {daysArray.map((date, idx) => (
                <button
                  key={idx}
                  onClick={() => date && setSelectedDate(date)}
                  className={`
                    aspect-square rounded text-xs font-semibold transition-colors
                    ${!date
                      ? 'bg-transparent text-slate-600'
                      : isSelected(date)
                        ? 'bg-blue-600 text-white'
                        : isToday(date)
                          ? 'bg-slate-700 text-white border border-blue-500'
                          : 'bg-slate-700 text-white hover:bg-slate-600'
                    }
                  `}
                >
                  {date?.getDate()}
                </button>
              ))}
            </div>
          </div>

          {/* Horários - Lado Esquerdo */}
          <div className="lg:col-span-3">
            <div className="bg-slate-800 rounded-lg border border-slate-700">
              {/* Header */}
              <div className="bg-slate-700 px-6 py-4 border-b border-slate-600">
                <h2 className="text-white font-bold text-lg">
                  {selectedDate.toLocaleString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
                </h2>
                {loading && <p className="text-slate-400 text-sm mt-2">Carregando agendamentos...</p>}
                {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
              </div>

              {/* Horários */}
              <div className="overflow-y-auto max-h-96">
                {horarios.map((horario) => {
                  const agendamento = getAgendamentoAtHorario(horario);
                  return (
                    <div key={horario} className="border-b border-slate-700 last:border-b-0">
                      <div className="flex gap-4">
                        {/* Horário */}
                        <div className="w-16 px-4 py-3 bg-slate-700 text-white text-sm font-mono flex-shrink-0 flex items-center justify-center">
                          {horario}
                        </div>

                        {/* Slot */}
                        <div className="flex-1 px-4 py-3">
                          {agendamento ? (
                            <div className="bg-blue-600 rounded p-3 text-white text-sm">
                              <p className="font-semibold">Agendado</p>
                              <p className="text-xs text-blue-100 mt-1">{agendamento.notes || 'Sem observações'}</p>
                              <p className="text-xs text-blue-100">Status: {agendamento.status}</p>
                            </div>
                          ) : (
                            <div className="bg-slate-700 rounded p-3 text-slate-400 text-sm hover:bg-slate-600 cursor-pointer transition-colors">
                              Disponível
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Legenda */}
            <div className="mt-4 bg-slate-800 rounded-lg p-4 border border-slate-700">
              <h3 className="text-white font-semibold mb-3">Legenda</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-slate-300">Agendado</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-slate-700 rounded"></div>
                  <span className="text-slate-300">Disponível</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

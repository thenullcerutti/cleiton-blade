/**
 * Componente de Calendário
 * Exibe um calendário mensal com navegação entre meses
 */

'use client';

import { useState } from 'react';

interface CalendarProps {
  selectedDate: Date | null;
  onSelectDate: (date: Date) => void;
  disabledDates?: Date[];
}

export const Calendar = ({ selectedDate, onSelectDate, disabledDates = [] }: CalendarProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthNames = [
    'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
    'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab'];

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const isDisabled = (date: Date) => {
    return disabledDates.some(
      d => d.getFullYear() === date.getFullYear() &&
           d.getMonth() === date.getMonth() &&
           d.getDate() === date.getDate()
    );
  };

  const isSelected = (date: Date) => {
    return selectedDate &&
           date.getFullYear() === selectedDate.getFullYear() &&
           date.getMonth() === selectedDate.getMonth() &&
           date.getDate() === selectedDate.getDate();
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  const days: (number | null)[] = [];
  const firstDay = getFirstDayOfMonth(currentDate);

  // Preencher com null os dias do mês anterior
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Adicionar os dias do mês
  const daysInMonth = getDaysInMonth(currentDate);
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  return (
    <div className="bg-slate-900 rounded-lg p-4 w-full max-w-sm">
      {/* Header com navegação */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={previousMonth}
          className="text-gray-400 hover:text-white transition text-xl"
        >
          &lt;
        </button>
        
        <h2 className="text-white capitalize font-semibold">
          {monthNames[currentDate.getMonth()]} de {currentDate.getFullYear()}
        </h2>
        
        <button
          onClick={nextMonth}
          className="text-gray-400 hover:text-white transition text-xl"
        >
          &gt;
        </button>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {dayNames.map((day) => (
          <div key={day} className="text-center text-gray-400 text-sm font-medium">
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} className="text-center" />;
          }

          const dateObj = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
          const disabled = isDisabled(dateObj) || dateObj < new Date();
          const selected = isSelected(dateObj);
          const today = isToday(dateObj);

          return (
            <button
              key={`day-${day}`}
              onClick={() => !disabled && onSelectDate(dateObj)}
              disabled={disabled}
              className={`
                p-2 rounded text-center font-medium transition
                ${selected ? 'bg-blue-600 text-white' : ''}
                ${today && !selected ? 'bg-gray-700 text-white' : ''}
                ${!selected && !today && !disabled ? 'bg-gray-800 text-gray-300 hover:bg-gray-700' : ''}
                ${disabled ? 'text-gray-600 bg-gray-900 cursor-not-allowed' : 'cursor-pointer'}
              `}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

/**
 * Componente de Gerenciamento de Horários de Funcionamento
 * Permite configurar os horários de funcionamento
 */

'use client';

import api from '@/lib/api';
import { useEffect, useState } from 'react';

interface WorkingHours {
  professional_id: string;
  day_of_week: number; // 0 = domingo, 6 = sábado
  start_time: string;
  end_time: string;
  is_available: boolean;
}

const dayNames = [
  'domingo',
  'segunda-feira',
  'terça-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado'
];

interface WorkingHoursEditorProps {
  professionalId?: string;
  onSaveSuccess?: () => void;
}

export const WorkingHoursEditor = ({ 
  professionalId = '1',
  onSaveSuccess 
}: WorkingHoursEditorProps) => {
  const [workingHours, setWorkingHours] = useState<WorkingHours[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    fetchWorkingHours();
  }, [professionalId]);

  const fetchWorkingHours = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await api.get(`/api/working-hours/${professionalId}`);
      setWorkingHours(response.data || initializeDefaultHours());
    } catch (err) {
      console.error('Erro ao buscar horários:', err);
      setWorkingHours(initializeDefaultHours());
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultHours = (): WorkingHours[] => {
    const defaultHours: WorkingHours[] = [];
    for (let day = 0; day < 7; day++) {
      defaultHours.push({
        professional_id: professionalId,
        day_of_week: day,
        start_time: day === 0 || day === 6 ? '00:00' : '07:00',
        end_time: day === 0 || day === 6 ? '00:00' : '18:00',
        is_available: day !== 0 && day !== 6,
      });
    }
    return defaultHours;
  };

  const handleTimeChange = (dayOfWeek: number, field: 'start_time' | 'end_time', value: string) => {
    setWorkingHours(prev => 
      prev.map(h => 
        h.day_of_week === dayOfWeek 
          ? { ...h, [field]: value }
          : h
      )
    );
  };

  const handleToggleDay = (dayOfWeek: number) => {
    setWorkingHours(prev => 
      prev.map(h => 
        h.day_of_week === dayOfWeek 
          ? { ...h, is_available: !h.is_available }
          : h
      )
    );
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError(null);
      setSuccess(false);

      await api.post(`/api/working-hours/${professionalId}`, workingHours);
      
      setSuccess(true);
      if (onSaveSuccess) {
        onSaveSuccess();
      }

      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao salvar horários:', err);
      setError('Não foi possível salvar os horários');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="text-gray-400 text-center py-8">Carregando...</div>;
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded px-4 py-3 text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-900/30 border border-green-700 rounded px-4 py-3 text-green-400">
          Horários salvos com sucesso!
        </div>
      )}

      {/* Tabela de horários */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-700">
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Dia da Semana</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Ativo</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Início</th>
              <th className="text-left py-3 px-4 text-gray-400 font-medium">Fim</th>
            </tr>
          </thead>
          <tbody>
            {workingHours.map((hours) => (
              <tr key={hours.day_of_week} className="border-b border-gray-700 hover:bg-gray-800/50">
                <td className="py-3 px-4 text-white capitalize">
                  {dayNames[hours.day_of_week]}
                </td>
                <td className="py-3 px-4">
                  <input
                    type="checkbox"
                    checked={hours.is_available}
                    onChange={() => handleToggleDay(hours.day_of_week)}
                    className="rounded cursor-pointer"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="time"
                    value={hours.start_time}
                    onChange={(e) => handleTimeChange(hours.day_of_week, 'start_time', e.target.value)}
                    disabled={!hours.is_available}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white disabled:opacity-50"
                  />
                </td>
                <td className="py-3 px-4">
                  <input
                    type="time"
                    value={hours.end_time}
                    onChange={(e) => handleTimeChange(hours.day_of_week, 'end_time', e.target.value)}
                    disabled={!hours.is_available}
                    className="bg-gray-800 border border-gray-700 rounded px-2 py-1 text-white disabled:opacity-50"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Botão de salvar */}
      <div className="pt-4 border-t border-gray-700">
        <button
          onClick={handleSave}
          disabled={saving}
          className={`
            w-full py-2 px-4 rounded font-semibold transition
            ${saving 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            }
          `}
        >
          {saving ? 'Salvando...' : 'Salvar Horários'}
        </button>
      </div>

      {/* Info */}
      <p className="text-gray-500 text-sm text-center">
        Esses horários serão utilizados para gerar os slots de agendamento
      </p>
    </div>
  );
};

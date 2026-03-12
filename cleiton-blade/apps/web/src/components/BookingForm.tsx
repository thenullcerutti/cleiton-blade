/**
 * Componente de Formulário de Agendamento
 * Formulário para o cliente preencher os dados do agendamento
 */

'use client';

import api from '@/lib/api';
import { useState } from 'react';

interface BookingFormProps {
  slotId?: string;
  slotTime?: string;
  onSubmitSuccess?: () => void;
}

interface FormData {
  client_name: string;
  client_phone: string;
  client_email: string;
  service_id: string;
  professional_id: string;
  observations: string;
}

export const BookingForm = ({ 
  slotId, 
  slotTime, 
  onSubmitSuccess 
}: BookingFormProps) => {
  const [formData, setFormData] = useState<FormData>({
    client_name: '',
    client_phone: '',
    client_email: '',
    service_id: '1',
    professional_id: '1',
    observations: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validação básica
    if (!formData.client_name.trim()) {
      setError('Nome é obrigatório');
      return;
    }

    if (!formData.client_phone.trim()) {
      setError('Telefone é obrigatório');
      return;
    }

    if (!formData.client_email.trim()) {
      setError('Email é obrigatório');
      return;
    }

    try {
      setLoading(true);

      const appointmentData = {
        ...formData,
        slot_id: slotId,
      };

      const response = await api.post('/api/appointments', appointmentData);

      setSuccess(true);
      setFormData({
        client_name: '',
        client_phone: '',
        client_email: '',
        service_id: '1',
        professional_id: '1',
        observations: '',
      });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }

      // Mostrar mensagem de sucesso por 3 segundos
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('Erro ao criar agendamento:', err);
      setError('Não foi possível confirmar o agendamento. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-900 rounded-lg p-6 w-full max-w-md">
      <h2 className="text-white text-2xl font-bold mb-6">Agendamento</h2>

      {/* Informações do slot selecionado */}
      {slotTime && (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 mb-6">
          <p className="text-gray-400 text-sm">Horário selecionado</p>
          <p className="text-white text-lg font-semibold">{slotTime}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Nome do Cliente */}
        <div>
          <label htmlFor="client_name" className="block text-gray-300 text-sm font-medium mb-2">
            Nome *
          </label>
          <input
            type="text"
            id="client_name"
            name="client_name"
            value={formData.client_name}
            onChange={handleChange}
            placeholder="Seu nome completo"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Telefone */}
        <div>
          <label htmlFor="client_phone" className="block text-gray-300 text-sm font-medium mb-2">
            Telefone / WhatsApp *
          </label>
          <input
            type="tel"
            id="client_phone"
            name="client_phone"
            value={formData.client_phone}
            onChange={handleChange}
            placeholder="(11) 9999-9999"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="client_email" className="block text-gray-300 text-sm font-medium mb-2">
            Email *
          </label>
          <input
            type="email"
            id="client_email"
            name="client_email"
            value={formData.client_email}
            onChange={handleChange}
            placeholder="seu@email.com"
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition"
          />
        </div>

        {/* Serviço */}
        <div>
          <label htmlFor="service_id" className="block text-gray-300 text-sm font-medium mb-2">
            Serviço
          </label>
          <select
            id="service_id"
            name="service_id"
            value={formData.service_id}
            onChange={handleChange}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500 transition"
          >
            <option value="1">Corte de Cabelo</option>
            <option value="2">Barba</option>
            <option value="3">Corte + Barba</option>
          </select>
        </div>

        {/* Observações */}
        <div>
          <label htmlFor="observations" className="block text-gray-300 text-sm font-medium mb-2">
            Observações
          </label>
          <textarea
            id="observations"
            name="observations"
            value={formData.observations}
            onChange={handleChange}
            placeholder="Alguma observação especial?"
            rows={3}
            className="w-full bg-gray-800 border border-gray-700 rounded px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition resize-none"
          />
        </div>

        {/* Mensagens de erro e sucesso */}
        {error && (
          <div className="bg-red-900/30 border border-red-700 rounded px-3 py-2 text-red-400 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-900/30 border border-green-700 rounded px-3 py-2 text-green-400 text-sm">
            Agendamento confirmado com sucesso! Você receberá uma confirmação no email e WhatsApp.
          </div>
        )}

        {/* Botão de envio */}
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full py-2 px-4 rounded font-semibold transition mt-6
            ${loading 
              ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
              : 'bg-blue-600 hover:bg-blue-700 text-white cursor-pointer'
            }
          `}
        >
          {loading ? 'Confirmando...' : 'Confirmar Agendamento'}
        </button>
      </form>

      <p className="text-gray-500 text-xs mt-4 text-center">
        * Campos obrigatórios
      </p>
    </div>
  );
};

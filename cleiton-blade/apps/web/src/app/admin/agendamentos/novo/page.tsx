'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NovoAgendamentoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    client_id: '',
    professional_id: '',
    service_id: '',
    datetime: '',
    status: 'pending',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao criar agendamento');
      }

      router.push('/admin/agendamentos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo Agendamento</h1>
        <p className="text-gray-400 mt-2">Preencha os dados do novo agendamento</p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 max-w-2xl">
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">ID do Cliente</label>
          <input
            type="text"
            name="client_id"
            value={formData.client_id}
            onChange={handleChange}
            placeholder="UUID do cliente"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">ID do Profissional</label>
          <input
            type="text"
            name="professional_id"
            value={formData.professional_id}
            onChange={handleChange}
            placeholder="UUID do profissional"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">ID do Serviço</label>
          <input
            type="text"
            name="service_id"
            value={formData.service_id}
            onChange={handleChange}
            placeholder="UUID do serviço"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Data e Hora</label>
          <input
            type="datetime-local"
            name="datetime"
            value={formData.datetime}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          >
            <option value="pending">Pendente</option>
            <option value="confirmed">Confirmado</option>
            <option value="completed">Completado</option>
            <option value="cancelled">Cancelado</option>
          </select>
        </div>

        <div className="mb-6">
          <label className="block text-white font-semibold mb-2">Observações</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Notas adicionais sobre o agendamento..."
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-pink-600 hover:bg-pink-700 disabled:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
          >
            {loading ? 'Criando...' : 'Criar Agendamento'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded font-semibold"
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}

'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NovoServicoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration_minutes: '',
    active: true,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validação no frontend
    if (!formData.name.trim()) {
      setError('Nome do serviço é obrigatório');
      setLoading(false);
      return;
    }

    if (formData.name.trim().length < 3) {
      setError('Nome deve ter pelo menos 3 caracteres');
      setLoading(false);
      return;
    }

    const price = parseFloat(formData.price);
    if (!formData.price || isNaN(price) || price <= 0) {
      setError('Preço deve ser maior que 0');
      setLoading(false);
      return;
    }

    const duration = parseInt(formData.duration_minutes);
    if (!formData.duration_minutes || isNaN(duration) || duration <= 0) {
      setError('Duração deve ser maior que 0');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          price: price,
          durationMinutes: duration,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao criar serviço');
      }

      router.push('/admin/servicos');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo Serviço</h1>
        <p className="text-gray-400 mt-2">Preencha os dados do novo serviço</p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 max-w-2xl">
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Nome do Serviço</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Ex: Corte de Cabelo"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Descrição</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Descrição detalhada do serviço..."
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 resize-none"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-white font-semibold mb-2">Preço (R$)</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="50.00"
              step="0.01"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
              required
            />
          </div>

          <div>
            <label className="block text-white font-semibold mb-2">Duração (minutos)</label>
            <input
              type="number"
              name="duration_minutes"
              value={formData.duration_minutes}
              onChange={handleChange}
              placeholder="30"
              className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
              required
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="active"
              checked={formData.active}
              onChange={handleChange}
              className="w-4 h-4 rounded"
            />
            <span className="text-white font-semibold">Ativo</span>
          </label>
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
          >
            {loading ? 'Criando...' : 'Criar Serviço'}
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

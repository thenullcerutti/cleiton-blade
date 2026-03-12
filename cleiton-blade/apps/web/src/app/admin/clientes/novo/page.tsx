'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function NovoClientePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    user_id: '',
    phone: '',
    birth_date: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || 'Erro ao criar cliente');
      }

      router.push('/admin/clientes');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Novo Cliente</h1>
        <p className="text-gray-400 mt-2">Preencha os dados do novo cliente</p>
      </div>

      {error && (
        <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-slate-800 rounded-lg p-6 max-w-2xl">
        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">ID do Usuário</label>
          <input
            type="text"
            name="user_id"
            value={formData.user_id}
            onChange={handleChange}
            placeholder="UUID do usuário"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Telefone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="(11) 99999-9999"
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-white font-semibold mb-2">Data de Nascimento</label>
          <input
            type="date"
            name="birth_date"
            value={formData.birth_date}
            onChange={handleChange}
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white"
          />
        </div>

        <div className="mb-6">
          <label className="block text-white font-semibold mb-2">Endereço</label>
          <textarea
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Rua, número, bairro, cidade..."
            className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded text-white placeholder-gray-400 resize-none"
            rows={3}
          />
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white px-6 py-2 rounded font-semibold"
          >
            {loading ? 'Criando...' : 'Criar Cliente'}
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

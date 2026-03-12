'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Servico {
  id: string;
  professional_id: string;
  name: string;
  description: string;
  price: number;
  duration_minutes: number;
  active: boolean;
  created_at: string;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchServicos();
  }, []);

  const fetchServicos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setServicos(data.data?.services || []);
      } else {
        setError(data.error?.message || 'Erro ao carregar serviços');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Serviços</h1>
        <Link
          href="/admin/servicos/novo"
          className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded font-semibold"
        >
          + Novo Serviço
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-800 border-b-2 border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-white font-semibold">Nome</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Descrição</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Preço</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Duração (min)</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
              <th className="px-6 py-4 text-center text-white font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {servicos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-slate-400 text-lg">
                  Nenhum serviço cadastrado
                </td>
              </tr>
            ) : (
              servicos.map((servico, idx) => (
                <tr 
                  key={servico.id} 
                  className={`border-b border-slate-700 transition-colors ${
                    idx % 2 === 0 ? 'bg-slate-800/60 hover:bg-slate-700/80' : 'bg-slate-800/40 hover:bg-slate-700/80'
                  }`}
                >
                  <td className="px-6 py-4 text-white font-medium">{servico.name}</td>
                  <td className="px-6 py-4 text-slate-300 truncate max-w-xs">{servico.description || '-'}</td>
                  <td className="px-6 py-4 text-white font-semibold">R$ {servico.price.toFixed(2)}</td>
                  <td className="px-6 py-4 text-white">{servico.duration_minutes}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      servico.active 
                        ? 'bg-green-900 text-green-300' 
                        : 'bg-red-900 text-red-300'
                    }`}>
                      {servico.active ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/servicos/${servico.id}`}
                      className="text-blue-400 hover:text-blue-300 mr-3 font-semibold transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Deseja deletar este serviço?')) {
                          // TODO: Implementar delete
                        }
                      }}
                      className="text-red-400 hover:text-red-300 font-semibold transition-colors"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

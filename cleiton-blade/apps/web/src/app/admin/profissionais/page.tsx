'use client';

import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Profissional {
  id: string;
  user_id: string;
  category: string;
  bio: string;
  active: boolean;
  created_at: string;
}

export default function ProfissionaisPage() {
  const [profissionais, setProfissionais] = useState<Profissional[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProfissionais();
  }, []);

  const fetchProfissionais = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/professionals', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setProfissionais(data.data?.professionals || []);
      } else {
        setError(data.error?.message || 'Erro ao carregar profissionais');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="CLEITON BLADE" subtitle="Gerenciamento de Profissionais" />
        <div className="p-6">Carregando...</div>
      </>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Profissionais</h1>
        <Link
          href="/admin/profissionais/novo"
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-semibold"
        >
          + Novo Profissional
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-800 border-b-2 border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-white font-semibold">Categoria</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Biografia</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Cadastrado em</th>
              <th className="px-6 py-4 text-center text-white font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {profissionais.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-lg">
                  Nenhum profissional cadastrado
                </td>
              </tr>
            ) : (
              profissionais.map((prof, idx) => (
                <tr key={prof.id} className={`border-b border-slate-700 transition-colors ${
                  idx % 2 === 0 ? 'bg-slate-800/60 hover:bg-slate-700/80' : 'bg-slate-800/40 hover:bg-slate-700/80'
                }`}>
                  <td className="px-6 py-4 text-white font-medium">{prof.category}</td>
                  <td className="px-6 py-4 text-slate-300 truncate max-w-xs">{prof.bio}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      prof.active ? 'bg-green-900 text-green-300' : 'bg-red-900 text-red-300'
                    }`}>
                      {prof.active ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-white">{new Date(prof.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/profissionais/${prof.id}`}
                      className="text-blue-400 hover:text-blue-300 mr-3 font-semibold transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Deseja deletar este profissional?')) {
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

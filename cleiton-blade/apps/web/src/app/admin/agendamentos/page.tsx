'use client';

import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Agendamento {
  id: string;
  client_id: string;
  professional_id: string;
  service_id: string;
  datetime: string;
  status: string;
  notes: string;
  created_at: string;
}

export default function AgendamentosPage() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAgendamentos();
  }, []);

  const fetchAgendamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments', {
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

  if (loading) {
    return (
      <>
        <Navbar title="CLEITON BLADE" subtitle="Gerenciamento de Agendamentos" />
        <div className="p-6">Carregando...</div>
      </>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Agendamentos</h1>
        <Link
          href="/admin/agendamentos/novo"
          className="bg-pink-600 hover:bg-pink-700 text-white px-4 py-2 rounded font-semibold"
        >
          + Novo Agendamento
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-800 border-b-2 border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-white font-semibold">Data/Hora</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Status</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Notas</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Criado em</th>
              <th className="px-6 py-4 text-center text-white font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {agendamentos.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-lg">
                  Nenhum agendamento cadastrado
                </td>
              </tr>
            ) : (
              agendamentos.map((agendamento, idx) => (
                <tr key={agendamento.id} className={`border-b border-slate-700 transition-colors ${
                  idx % 2 === 0 ? 'bg-slate-800/60 hover:bg-slate-700/80' : 'bg-slate-800/40 hover:bg-slate-700/80'
                }`}>
                  <td className="px-6 py-4 text-white font-medium">{new Date(agendamento.datetime).toLocaleString()}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      agendamento.status === 'completed' ? 'bg-green-900 text-green-300' :
                      agendamento.status === 'cancelled' ? 'bg-red-900 text-red-300' :
                      'bg-blue-900 text-blue-300'
                    }`}>
                      {agendamento.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-300 truncate max-w-xs">{agendamento.notes}</td>
                  <td className="px-6 py-4 text-white">{new Date(agendamento.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/agendamentos/${agendamento.id}`}
                      className="text-blue-400 hover:text-blue-300 mr-3 font-semibold transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Deseja deletar este agendamento?')) {
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

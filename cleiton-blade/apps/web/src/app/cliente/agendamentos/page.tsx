'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AgendamentosPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
    } else if (user.role === 'admin') {
      router.push('/admin/dashboard');
    } else {
      setLoading(false);
    }
  }, [user, router]);

  if (loading || !user) {
    return <div className="text-white">Carregando...</div>;
  }

  // Agendamentos de exemplo (depois virão da API)
  const agendamentos = [
    {
      id: 1,
      estabelecimento: 'Barbearia do João',
      servico: 'Corte + Barba',
      data: '24/01/2026',
      hora: '14:30',
      profissional: 'João Silva',
      preco: 'R$ 120',
      status: 'confirmado',
      imagem: '💇',
    },
    {
      id: 2,
      estabelecimento: 'Salão da Maria',
      servico: 'Escova + Hidratação',
      data: '22/01/2026',
      hora: '10:00',
      profissional: 'Maria Santos',
      preco: 'R$ 180',
      status: 'concluido',
      imagem: '💄',
    },
  ];

  const statusColors = {
    confirmado: 'bg-blue-900 text-blue-200 border border-blue-700',
    concluido: 'bg-slate-700 text-slate-300 border border-slate-600',
    cancelado: 'bg-red-900 text-red-200 border border-red-700',
  };

  const statusTexto = {
    confirmado: 'Confirmado',
    concluido: 'Concluído',
    cancelado: 'Cancelado',
  };

  return (
    <div className="bg-slate-900 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 px-4 py-4">
        <Link href="/cliente" className="text-blue-400 mb-2 block text-sm">
          ← Voltar
        </Link>
        <h1 className="text-white text-2xl font-bold">Meus Agendamentos</h1>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-700 bg-slate-800">
        <button className="flex-1 px-4 py-3 text-white border-b-2 border-blue-500 text-sm font-medium">
          Próximos
        </button>
        <button className="flex-1 px-4 py-3 text-slate-400 hover:text-white text-sm font-medium">
          Histórico
        </button>
      </div>

      {/* Agendamentos */}
      <div className="px-4 py-4">
        <div className="space-y-3">
          {agendamentos
            .filter((a) => a.status === 'confirmado')
            .map((agendamento) => (
              <div
                key={agendamento.id}
                className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 hover:border-slate-600 transition"
              >
                {/* Cabeçalho com info rápida */}
                <div className="flex items-start gap-3 p-4">
                  <div className="text-4xl">{agendamento.imagem}</div>

                  <div className="flex-1">
                    <h3 className="text-white font-semibold mb-1">
                      {agendamento.estabelecimento}
                    </h3>
                    <p className="text-slate-400 text-sm mb-2">
                      {agendamento.servico}
                    </p>

                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-blue-400 font-medium">
                        📅 {agendamento.data}
                      </span>
                      <span className="text-blue-400 font-medium">
                        🕐 {agendamento.hora}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className={`text-xs px-2 py-1 rounded-full ${statusColors[agendamento.status]}`}>
                        {statusTexto[agendamento.status]}
                      </span>
                      <span className="text-white font-semibold">{agendamento.preco}</span>
                    </div>
                  </div>

                  <span className="text-slate-400 text-xl">→</span>
                </div>

                {/* Ações */}
                <div className="flex border-t border-slate-700">
                  <button className="flex-1 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 text-sm border-r border-slate-700">
                    Detalhes
                  </button>
                  <button className="flex-1 px-4 py-2 text-slate-300 hover:text-white hover:bg-slate-700 text-sm">
                    Chamar
                  </button>
                </div>
              </div>
            ))}
        </div>

        {agendamentos.filter((a) => a.status === 'confirmado').length === 0 && (
          <div className="text-center py-8">
            <p className="text-slate-400 text-lg">Nenhum agendamento próximo</p>
            <Link href="/cliente/agendar">
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg mt-4">
                Agendar Agora
              </button>
            </Link>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <div className="flex justify-around items-center h-20">
          <Link href="/cliente" className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-slate-400">
            <span className="text-2xl">🏠</span>
            <p className="text-xs">Início</p>
          </Link>
          <Link href="/cliente/buscar" className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-slate-400">
            <span className="text-2xl">🔍</span>
            <p className="text-xs">Buscar</p>
          </Link>
          <Link href="/cliente/agendamentos" className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-blue-400">
            <span className="text-2xl">📅</span>
            <p className="text-xs">Agendamentos</p>
          </Link>
          <Link href="/cliente/menu" className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-slate-400">
            <span className="text-2xl">👤</span>
            <p className="text-xs">Menu</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

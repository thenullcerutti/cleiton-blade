'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function AgendarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1); // 1: categoria, 2: profissional, 3: serviço, 4: data/hora, 5: confirmação

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

  // Dados de exemplo
  const categorias = [
    { id: 1, nome: 'Barbearia', icon: '💇', color: 'from-blue-600 to-blue-800' },
    { id: 2, nome: 'Salão', icon: '💄', color: 'from-pink-600 to-pink-800' },
    { id: 3, nome: 'Manicure', icon: '💅', color: 'from-purple-600 to-purple-800' },
  ];

  const profissionais = [
    { id: 1, nome: 'João Silva', categoria: 1, rating: 4.8, reviews: 128 },
    { id: 2, nome: 'Pedro Costa', categoria: 1, rating: 4.9, reviews: 256 },
  ];

  const servicos = [
    { id: 1, nome: 'Corte', preco: 50, duracao: '30 min' },
    { id: 2, nome: 'Barba', preco: 40, duracao: '20 min' },
    { id: 3, nome: 'Corte + Barba', preco: 80, duracao: '50 min' },
  ];

  const horarios = ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'];

  return (
    <div className="bg-slate-900 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10 px-4 py-4">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => setStep(step === 1 ? 1 : step - 1)} className="text-white text-2xl">
            ←
          </button>
          <h1 className="text-white text-xl font-bold flex-1">Agendar Consulta</h1>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-1 h-1 bg-slate-700 rounded-full overflow-hidden">
          {[1, 2, 3, 4, 5].map((s) => (
            <div
              key={s}
              className={`flex-1 transition-all ${s <= step ? 'bg-blue-500' : 'bg-slate-700'}`}
            />
          ))}
        </div>
      </div>

      {/* Conteúdo por Step */}
      <div className="px-4 py-6">
        {/* Step 1: Categoria */}
        {step === 1 && (
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Escolha a categoria</h2>
            <div className="grid grid-cols-2 gap-3">
              {categorias.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setStep(2)}
                  className={`bg-gradient-to-br ${cat.color} rounded-lg p-6 text-white hover:opacity-90 transition flex flex-col items-center justify-center gap-2 h-32`}
                >
                  <span className="text-4xl">{cat.icon}</span>
                  <span className="font-semibold">{cat.nome}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Profissional */}
        {step === 2 && (
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Escolha o profissional</h2>
            <div className="space-y-3">
              {profissionais.map((prof) => (
                <button
                  key={prof.id}
                  onClick={() => setStep(3)}
                  className="w-full bg-slate-800 hover:bg-slate-700 transition rounded-lg p-4 border border-slate-700 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white text-xl">
                      👤
                    </div>
                    <div className="text-left">
                      <p className="text-white font-semibold">{prof.nome}</p>
                      <p className="text-slate-400 text-sm">
                        ⭐ {prof.rating} ({prof.reviews} avaliações)
                      </p>
                    </div>
                  </div>
                  <span className="text-slate-500">→</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Serviço */}
        {step === 3 && (
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Escolha o serviço</h2>
            <div className="space-y-3">
              {servicos.map((serv) => (
                <button
                  key={serv.id}
                  onClick={() => setStep(4)}
                  className="w-full bg-slate-800 hover:bg-slate-700 transition rounded-lg p-4 border border-slate-700 flex items-center justify-between"
                >
                  <div className="text-left">
                    <p className="text-white font-semibold">{serv.nome}</p>
                    <p className="text-slate-400 text-sm">⏱️ {serv.duracao}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-white font-bold">R$ {serv.preco}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Data e Hora */}
        {step === 4 && (
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Selecione data e hora</h2>

            {/* Calendário simples */}
            <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
              <input
                type="date"
                className="w-full bg-slate-700 text-white rounded px-3 py-2 outline-none focus:border-blue-500 border border-slate-600"
              />
            </div>

            {/* Horários */}
            <h3 className="text-white font-semibold mb-3">Horários disponíveis</h3>
            <div className="grid grid-cols-3 gap-2">
              {horarios.map((hora) => (
                <button
                  key={hora}
                  onClick={() => setStep(5)}
                  className="bg-slate-800 hover:bg-blue-600 transition text-white rounded-lg p-3 border border-slate-700 hover:border-blue-500 font-medium"
                >
                  {hora}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 5: Confirmação */}
        {step === 5 && (
          <div>
            <h2 className="text-white text-lg font-semibold mb-4">Confirme seu agendamento</h2>

            <div className="bg-gradient-to-br from-blue-900 to-blue-800 rounded-lg p-4 mb-6 border border-blue-700">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-blue-100">Estabelecimento</span>
                  <span className="text-white font-semibold">Barbearia do João</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Profissional</span>
                  <span className="text-white font-semibold">João Silva</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-blue-100">Serviço</span>
                  <span className="text-white font-semibold">Corte + Barba</span>
                </div>
                <div className="border-t border-blue-700 pt-3 flex justify-between">
                  <span className="text-blue-100">Data e Hora</span>
                  <span className="text-white font-semibold">24/01/2026 às 14:30</span>
                </div>
                <div className="border-t border-blue-700 pt-3 flex justify-between">
                  <span className="text-blue-100 font-semibold">Valor</span>
                  <span className="text-white font-bold text-lg">R$ 120</span>
                </div>
              </div>
            </div>

            {/* Aviso */}
            <div className="bg-slate-800 rounded-lg p-4 mb-6 border border-slate-700">
              <p className="text-slate-300 text-sm">
                ℹ️ Você receberá uma confirmação no seu email. O profissional também será notificado.
              </p>
            </div>

            {/* Botões */}
            <div className="space-y-3">
              <button
                onClick={() => {
                  alert('Agendamento confirmado!');
                  router.push('/cliente/agendamentos');
                }}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
              >
                Confirmar Agendamento
              </button>
              <button
                onClick={() => setStep(4)}
                className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-3 rounded-lg transition border border-slate-700"
              >
                Voltar e Editar
              </button>
            </div>
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
          <Link href="/cliente/agendamentos" className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-slate-400">
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

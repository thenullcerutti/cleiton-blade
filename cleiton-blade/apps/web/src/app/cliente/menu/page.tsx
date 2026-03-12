'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function MenuPage() {
  const { user, logout } = useAuth();
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

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading || !user) {
    return <div className="text-white">Carregando...</div>;
  }

  return (
    <div className="bg-slate-900 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 px-4 py-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-blue-400 rounded-full flex items-center justify-center text-white text-4xl">
            👤
          </div>
          <div>
            <h1 className="text-white text-xl font-bold">{user?.email || 'Usuário'}</h1>
            <p className="text-blue-100 text-sm">Cliente Cleiton Blade</p>
          </div>
        </div>
      </div>

      {/* Informações Pessoais */}
      <div className="px-4 py-6">
        <h2 className="text-white font-semibold mb-4">Informações Pessoais</h2>
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 divide-y divide-slate-700">
          <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 cursor-pointer transition">
            <span className="text-slate-300 flex items-center gap-3">
              <span className="text-xl">📧</span>
              Email
            </span>
            <span className="text-right">
              <p className="text-slate-400 text-sm">{user?.email}</p>
            </span>
          </div>
          <Link href="/cliente/editar-perfil">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">✏️</span>
                Editar Perfil
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
          <Link href="/cliente/alterar-senha">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">🔐</span>
                Alterar Senha
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Minhas Compras */}
      <div className="px-4 py-6">
        <h2 className="text-white font-semibold mb-4">Minhas Transações</h2>
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 divide-y divide-slate-700">
          <Link href="/cliente/formas-pagamento">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">💳</span>
                Formas de Pagamento
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
          <Link href="/cliente/historico-pagamentos">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">📋</span>
                Histórico de Pagamentos
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Favoritos */}
      <div className="px-4 py-6">
        <h2 className="text-white font-semibold mb-4">Favoritos</h2>
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700">
          <Link href="/cliente/favoritos">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">⭐</span>
                Profissionais Favoritos
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Configurações */}
      <div className="px-4 py-6">
        <h2 className="text-white font-semibold mb-4">Configurações</h2>
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 divide-y divide-slate-700">
          <Link href="/cliente/notificacoes">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">🔔</span>
                Notificações
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
          <Link href="/cliente/privacidade">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">🔒</span>
                Privacidade e Segurança
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Suporte */}
      <div className="px-4 py-6">
        <h2 className="text-white font-semibold mb-4">Suporte</h2>
        <div className="bg-slate-800 rounded-lg overflow-hidden border border-slate-700 divide-y divide-slate-700">
          <Link href="/cliente/faq">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">❓</span>
                FAQ
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
          <Link href="/cliente/contato">
            <div className="px-4 py-3 flex justify-between items-center hover:bg-slate-700 transition cursor-pointer">
              <span className="text-slate-300 flex items-center gap-3">
                <span className="text-xl">📞</span>
                Contato
              </span>
              <span className="text-slate-500">→</span>
            </div>
          </Link>
        </div>
      </div>

      {/* Logout Button */}
      <div className="px-4 py-6">
        <button
          onClick={handleLogout}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
        >
          Sair da Conta
        </button>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 text-center text-slate-400 text-xs space-y-2">
        <p>Cleiton Blade v1.0</p>
        <p>© 2026 Todos os direitos reservados</p>
        <div className="flex gap-4 justify-center">
          <Link href="#" className="hover:text-white">
            Termos
          </Link>
          <Link href="#" className="hover:text-white">
            Privacidade
          </Link>
        </div>
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
          <Link href="/cliente/menu" className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-blue-400">
            <span className="text-2xl">👤</span>
            <p className="text-xs">Menu</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

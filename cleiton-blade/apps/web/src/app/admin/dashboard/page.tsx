'use client';

import { Button } from '@/components/Button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Verificar se é admin
    if (user && user.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Acesso negado</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 transition-colors">
      {/* Navigation */}
      <nav className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CLEITON BLADE</h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">Painel de Administrador</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <div className="text-right">
              <p className="text-gray-900 dark:text-white font-semibold">{user.name}</p>
              <p className="text-gray-600 dark:text-slate-400 text-sm">Administrador</p>
            </div>
            <Button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
            >
              Sair
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Bem-vindo, {user.name}! 👋
          </h2>
          <p className="text-gray-600 dark:text-slate-400">
            Gerencie todos os aspectos do sistema CLEITON BLADE
          </p>
        </div>

        {/* Menu de Funcionalidades */}
        <div className="bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-8 shadow-lg transition-colors">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Gerenciamento</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Usuários */}
            <Link href="/admin/usuarios" className="group">
              <div className="bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg p-6 transition-all cursor-pointer border border-gray-200 dark:border-slate-600 dark:hover:border-blue-500">
                <div className="text-4xl mb-3">👥</div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Usuários</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Gerenciar contas de usuários</p>
                <p className="text-blue-600 dark:text-blue-400 text-sm mt-3 group-hover:underline">Acessar →</p>
              </div>
            </Link>

            {/* Clientes */}
            <Link href="/admin/clientes" className="group">
              <div className="bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg p-6 transition-all cursor-pointer border border-gray-200 dark:border-slate-600 dark:hover:border-green-500">
                <div className="text-4xl mb-3">👨‍💼</div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Clientes</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Visualizar e gerenciar clientes</p>
                <p className="text-green-600 dark:text-green-400 text-sm mt-3 group-hover:underline">Acessar →</p>
              </div>
            </Link>

            {/* Profissionais */}
            <Link href="/admin/profissionais" className="group">
              <div className="bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg p-6 transition-all cursor-pointer border border-gray-200 dark:border-slate-600 dark:hover:border-purple-500">
                <div className="text-4xl mb-3">🏢</div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Profissionais</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Gerenciar profissionais</p>
                <p className="text-purple-600 dark:text-purple-400 text-sm mt-3 group-hover:underline">Acessar →</p>
              </div>
            </Link>

            {/* Serviços */}
            <Link href="/admin/servicos" className="group">
              <div className="bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg p-6 transition-all cursor-pointer border border-gray-200 dark:border-slate-600 dark:hover:border-yellow-500">
                <div className="text-4xl mb-3">🛍️</div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Serviços</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Gerenciar serviços disponíveis</p>
                <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-3 group-hover:underline">Acessar →</p>
              </div>
            </Link>

            {/* Agendamentos */}
            <Link href="/admin/agendamentos" className="group">
              <div className="bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg p-6 transition-all cursor-pointer border border-gray-200 dark:border-slate-600 dark:hover:border-blue-500">
                <div className="text-4xl mb-3">📅</div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Agendamentos</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Gerenciar agendamentos</p>
                <p className="text-blue-600 dark:text-blue-400 text-sm mt-3 group-hover:underline">Acessar →</p>
              </div>
            </Link>

            {/* Agenda */}
            <Link href="/admin/agenda" className="group">
              <div className="bg-white dark:bg-slate-700 hover:bg-gray-100 dark:hover:bg-slate-600 rounded-lg p-6 transition-all cursor-pointer border border-gray-200 dark:border-slate-600 dark:hover:border-cyan-500">
                <div className="text-4xl mb-3">⏰</div>
                <h4 className="text-gray-900 dark:text-white font-semibold mb-2">Agenda</h4>
                <p className="text-gray-600 dark:text-slate-400 text-sm">Visualizar agenda diária</p>
                <p className="text-cyan-600 dark:text-cyan-400 text-sm mt-3 group-hover:underline">Acessar →</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Rodapé */}
        <div className="mt-8 text-center text-gray-600 dark:text-slate-400 text-sm">
          <p>CLEITON BLADE © 2026 - Todos os direitos reservados</p>
        </div>
      </div>
    </div>
  );
}

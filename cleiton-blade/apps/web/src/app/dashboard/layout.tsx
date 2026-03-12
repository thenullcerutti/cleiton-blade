'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-secondary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isProfessional = user?.role === 'professional';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="flex">
        <div className="w-64 bg-primary text-white shadow-lg">
          <div className="p-6 border-b border-gray-700">
            <h1 className="text-2xl font-bold">Cleiton Blade</h1>
            <p className="text-gray-400 text-sm mt-1">{user.name}</p>
            <p className="text-gray-500 text-xs mt-1 capitalize">{user.role}</p>
          </div>

          <nav className="p-4 space-y-2">
            {isAdmin && (
              <>
                <a href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-700 transition">
                  Dashboard
                </a>
                <a href="/dashboard/clientes" className="block px-4 py-2 rounded hover:bg-gray-700 transition">
                  Clientes
                </a>
                <a href="/dashboard/profissionais" className="block px-4 py-2 rounded hover:bg-gray-700 transition">
                  Profissionais
                </a>
                <a href="/dashboard/servicos" className="block px-4 py-2 rounded hover:bg-gray-700 transition">
                  Serviços
                </a>
                <a href="/dashboard/agendamentos" className="block px-4 py-2 rounded hover:bg-gray-700 transition">
                  Agendamentos
                </a>
              </>
            )}

            {isProfessional && (
              <>
                <a href="/dashboard" className="block px-4 py-2 rounded hover:bg-gray-700 transition">
                  Minha Agenda
                </a>
                <a href="/dashboard/schedule" className="block px-4 py-2 rounded hover:bg-gray-700 transition">
                  Horários
                </a>
              </>
            )}

            <hr className="my-2 border-gray-700" />

            <button
              onClick={handleLogout}
              className="w-full text-left px-4 py-2 rounded hover:bg-red-600 transition text-sm"
            >
              Sair
            </button>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          <div className="bg-white shadow p-4">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">Dashboard</h2>
              <div className="text-sm text-gray-600">
                {new Date().toLocaleDateString('pt-BR')}
              </div>
            </div>
          </div>

          <div className="p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

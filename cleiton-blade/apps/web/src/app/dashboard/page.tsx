'use client';

import { Button } from '@/components/Button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function DashboardPage() {
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
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 transition-colors">
      <nav className="bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-slate-700">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">CLEITON BLADE</h1>
            <p className="text-gray-600 dark:text-slate-400 text-sm">Cliente</p>
          </div>
          <div className="flex items-center gap-4">
            <ThemeSwitcher />
            <p className="text-gray-900 dark:text-white">{user.name}</p>
            <Button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded">Sair</Button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Bem-vindo, {user.name}!</h2>
        <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg p-6 transition-colors">
          <p className="text-gray-700 dark:text-slate-300">Dashboard de Cliente em desenvolvimento...</p>
        </div>
      </div>
    </div>
  );
}

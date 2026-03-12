'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminLogin() {
  const router = useRouter();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.email || !formData.password) {
        setError('Email e senha são obrigatórios');
        return;
      }

      const success = await login(formData.email, formData.password);
      
      if (success) {
        // Redirecionar para admin dashboard
        router.push('/admin/dashboard');
      } else {
        setError('Email ou senha inválidos');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 transition-colors">
      <div className="absolute top-4 right-4">
        <ThemeSwitcher />
      </div>
      <div className="w-full max-w-md p-8 bg-white dark:bg-slate-800 rounded-lg shadow-2xl border border-gray-200 dark:border-slate-700 transition-colors">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">CLEITON BLADE</h1>
          <p className="text-gray-600 dark:text-slate-400">Painel de Administrador</p>
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-600 dark:text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-gray-700 dark:text-slate-300 text-sm font-medium mb-2">
              Email
            </label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="seu@email.com"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Senha
            </label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full"
            />
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Autenticando...' : 'Entrar como Admin'}
          </Button>
        </form>

        {/* Links */}
        <div className="border-t border-gray-200 dark:border-slate-700 pt-4">
          <p className="text-gray-600 dark:text-slate-400 text-sm text-center mb-4">
            Não é admin? <Link href="/login" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Login de Cliente</Link>
          </p>
          <p className="text-gray-600 dark:text-slate-400 text-sm text-center">
            Novo admin? <Link href="/admin/register" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300">Criar Conta</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

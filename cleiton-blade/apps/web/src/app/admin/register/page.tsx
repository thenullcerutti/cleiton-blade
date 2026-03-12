'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export default function AdminRegister() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    adminKey: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name || formData.name.length < 3) {
      setError('Nome é obrigatório e deve ter pelo menos 3 caracteres');
      return false;
    }
    if (!formData.email || !formData.email.includes('@')) {
      setError('Email é obrigatório e deve ser válido');
      return false;
    }
    if (!formData.password || formData.password.length < 8) {
      setError('Senha é obrigatória e deve ter pelo menos 8 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Senhas não conferem');
      return false;
    }
    if (!formData.adminKey) {
      setError('Chave de Admin é obrigatória');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      const success = await register(
        formData.name,
        formData.email,
        formData.password,
        'admin',
        formData.adminKey
      );

      if (success) {
        router.push('/admin/login');
      } else {
        setError('Erro ao criar conta de admin');
      }
    } catch (err: any) {
      setError(err.message || 'Erro ao registrar');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md p-8 bg-slate-800 rounded-lg shadow-2xl border border-slate-700">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">CLEITON BLADE</h1>
          <p className="text-slate-400">Criar Conta de Administrador</p>
        </div>

        {/* Aviso */}
        <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded text-yellow-400 text-sm">
          ⚠️ Esta é uma conta privilegiada. Você precisará de uma chave de admin para se registrar.
        </div>

        {/* Erro */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded text-red-400 text-sm">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mb-6">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Nome
            </label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Seu nome"
              minLength={3}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
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
              minLength={8}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Confirmar Senha
            </label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              minLength={8}
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">
              Chave de Admin
            </label>
            <Input
              type="password"
              name="adminKey"
              value={formData.adminKey}
              onChange={handleChange}
              placeholder="Chave secreta"
              className="w-full"
            />
            <p className="text-slate-500 text-xs mt-1">
              Solicite a chave ao proprietário do sistema
            </p>
          </div>

          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {loading ? 'Criando Conta...' : 'Criar Conta de Admin'}
          </Button>
        </form>

        {/* Links */}
        <div className="border-t border-slate-700 pt-4">
          <p className="text-slate-400 text-sm text-center">
            Já é admin? <Link href="/admin/login" className="text-blue-400 hover:text-blue-300">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

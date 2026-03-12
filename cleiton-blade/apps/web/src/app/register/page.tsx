'use client';

import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function RegisterPage() {
  const router = useRouter();
  const { register, user, isLoading, error, pendingVerification } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Auto-redirect se já está autenticado
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        router.push('/admin/dashboard');
      } else {
        router.push('/cliente');
      }
    }
  }, [user, router]);

  // Redirecionar para verificação de email se necessário
  useEffect(() => {
    if (pendingVerification) {
      router.push(`/verify-email?email=${encodeURIComponent(pendingVerification.email)}`);
    }
  }, [pendingVerification, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.name) newErrors.name = 'Nome é obrigatório';
    if (formData.name.length < 3) newErrors.name = 'Nome deve ter pelo menos 3 caracteres';

    if (!formData.email) newErrors.email = 'Email é obrigatório';
    if (!formData.email.includes('@')) newErrors.email = 'Email inválido';

    if (!formData.password) newErrors.password = 'Senha é obrigatória';
    if (formData.password.length < 8) newErrors.password = 'Senha deve ter pelo menos 8 caracteres';

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não conferem';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      const success = await register(formData.name, formData.email, formData.password, 'client');
      if (success) {
        // Redirect será feito pelo useEffect acima
      }
    } catch (err) {
      console.error('Erro ao registrar:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800">
      <div className="w-full max-w-md bg-slate-800 shadow-lg rounded-lg p-8 border border-slate-700">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-center text-white">CLEITON BLADE</h1>
          <p className="text-center text-slate-400 text-sm mt-2">Criar Conta de Cliente</p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <p className="text-red-400 text-sm">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Nome Completo</label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              error={errors.name}
              placeholder="Seu nome"
              minLength={3}
              className="w-full"
            />
            {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Email</label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="seu@email.com"
              className="w-full"
            />
            {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Senha</label>
            <Input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              error={errors.password}
              placeholder="••••••••"
              minLength={8}
              className="w-full"
            />
            {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-slate-300 text-sm font-medium mb-2">Confirmar Senha</label>
            <Input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={errors.confirmPassword}
              placeholder="••••••••"
              minLength={8}
              className="w-full"
            />
            {errors.confirmPassword && <p className="text-red-400 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition-colors"
          >
            {isLoading ? 'Criando conta...' : 'Criar Conta'}
          </Button>
        </form>

        <div className="mt-6 pt-6 border-t border-slate-700 text-center text-sm">
          <p className="text-slate-400 mb-2">Já tem uma conta?</p>
          <Link 
            href="/login" 
            className="text-blue-400 hover:text-blue-300 font-medium"
          >
            Entre com sua conta
          </Link>
          <p className="text-slate-500 text-xs mt-4">É admin?</p>
          <Link 
            href="/admin/register" 
            className="text-red-400 hover:text-red-300 font-medium"
          >
            Registro Administrativo
          </Link>
        </div>
      </div>
    </div>
  );
}

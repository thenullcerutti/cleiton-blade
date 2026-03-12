'use client';

import { Button } from '@/components/Button';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const token = searchParams.get('token');

  const [step, setStep] = useState<'waiting' | 'verifying' | 'verified' | 'error'>('waiting');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Se veio do link de verificação direta (com token)
  useEffect(() => {
    if (token) {
      verifyEmail(token);
    }
  }, [token]);

  const verifyEmail = async (verificationToken: string) => {
    setStep('verifying');
    try {
      const response = await fetch('http://localhost:3000/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: verificationToken })
      });

      const data = await response.json();

      if (data.success) {
        setStep('verified');
        setMessage('✅ Email verificado com sucesso!');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setStep('error');
        setError(data.error?.message || 'Erro ao verificar email');
      }
    } catch (err) {
      setStep('error');
      setError('Erro ao conectar com o servidor');
    }
  };

  const resendEmail = async () => {
    try {
      const response = await fetch('http://localhost:3000/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (data.success) {
        setMessage('✅ Email reenviado! Verifique sua caixa de entrada.');
      } else {
        setError(data.error?.message || 'Erro ao reenviar email');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="w-full max-w-md bg-slate-800 shadow-lg rounded-lg p-8 border border-slate-700">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white">CLEITON BLADE</h1>
          <p className="text-slate-400 text-sm mt-2">Verificar Email</p>
        </div>

        {/* Waiting State */}
        {step === 'waiting' && (
          <>
            <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-6 mb-6 text-center">
              <p className="text-blue-300 text-lg font-semibold mb-2">📧 Verifique seu Email</p>
              <p className="text-blue-100 text-sm mb-4">
                Enviamos um link de confirmação para:
              </p>
              <p className="text-white font-semibold">{email}</p>
            </div>

            <div className="space-y-4 mb-6">
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-lg">✓</span>
                <p className="text-slate-300 text-sm">Clique no link no seu email</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-lg">✓</span>
                <p className="text-slate-300 text-sm">Link válido por 24 horas</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-green-400 text-lg">✓</span>
                <p className="text-slate-300 text-sm">Após verificar, você poderá fazer login</p>
              </div>
            </div>

            <div className="bg-yellow-500/20 border border-yellow-500 rounded-lg p-4 mb-6">
              <p className="text-yellow-300 text-xs">
                💡 Não recebeu o email? Verifique a pasta de spam ou solicite um novo.
              </p>
            </div>

            <Button onClick={resendEmail} className="w-full mb-4">
              Reenviar Email
            </Button>

            <Link href="/login">
              <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition">
                Voltar ao Login
              </button>
            </Link>
          </>
        )}

        {/* Verifying State */}
        {step === 'verifying' && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin mb-4">
              <div className="text-4xl">⏳</div>
            </div>
            <p className="text-slate-300">Verificando seu email...</p>
          </div>
        )}

        {/* Verified State */}
        {step === 'verified' && (
          <div className="text-center py-8">
            <div className="text-6xl mb-4">✅</div>
            <p className="text-green-400 text-lg font-semibold mb-2">{message}</p>
            <p className="text-slate-400 text-sm">Você será redirecionado para o login...</p>
          </div>
        )}

        {/* Error State */}
        {step === 'error' && (
          <>
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 mb-6 text-center">
              <p className="text-red-400 text-lg font-semibold mb-2">❌ Erro</p>
              <p className="text-red-200 text-sm">{error}</p>
            </div>

            <div className="space-y-3">
              <Button onClick={resendEmail} className="w-full">
                Reenviar Email
              </Button>

              <Link href="/login">
                <button className="w-full bg-slate-700 hover:bg-slate-600 text-white font-semibold py-3 rounded-lg transition">
                  Voltar ao Login
                </button>
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function ClientHome() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [currentSlide, setCurrentSlide] = useState(0);
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

  const slides = [
    {
      title: 'Agende compromissos rapidamente pelo app',
      subtitle: 'sem filas ou ligações',
      image: '💇',
      color: 'from-amber-900 to-amber-800',
    },
    {
      title: 'Profissionais verificados',
      subtitle: 'com avaliações reais',
      image: '⭐',
      color: 'from-blue-900 to-blue-800',
    },
    {
      title: 'Confirmação instantânea',
      subtitle: 'no seu celular',
      image: '✅',
      color: 'from-green-900 to-green-800',
    },
  ];

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-900">
        <p className="text-white">Carregando...</p>
      </div>
    );
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  const getDay = () => {
    const days = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
    const months = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
    const date = new Date();
    return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
  };

  return (
    <div className="bg-slate-900 min-h-screen flex flex-col pb-20">
      {/* Header */}
      <div className="bg-gradient-to-b from-slate-900 to-slate-800 px-4 pt-4 pb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-slate-400 text-sm">{getGreeting()}</span>
              <h1 className="text-2xl font-bold text-white">{user.name}</h1>
            </div>
            <p className="text-slate-400 text-xs mt-1">{getDay()}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-white text-2xl"
          >
            🔔
          </button>
        </div>

        {/* Search Box */}
        <Link href="/cliente/buscar">
          <div className="bg-slate-800 rounded-full px-4 py-3 flex items-center gap-2 cursor-pointer hover:bg-slate-700 transition">
            <span className="text-slate-400">🔍</span>
            <input
              type="text"
              placeholder="Encontre um estabelecimento"
              className="bg-transparent text-slate-300 placeholder-slate-500 outline-none w-full text-sm"
              disabled
            />
          </div>
        </Link>
      </div>

      {/* Carousel */}
      <div className="px-4 py-6 flex-1">
        <div className="relative">
          {/* Slides */}
          <div className="relative overflow-hidden rounded-2xl h-64 bg-gradient-to-br">
            <div
              className={`absolute inset-0 bg-gradient-to-br ${slides[currentSlide].color} transition-opacity duration-500`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <div className="text-6xl mb-4 animate-bounce">{slides[currentSlide].image}</div>
                <h2 className="text-white font-bold text-2xl mb-2 px-4">
                  {slides[currentSlide].title}
                </h2>
                <p className="text-slate-200 text-sm px-4">
                  {slides[currentSlide].subtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
          >
            ←
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/30 text-white w-10 h-10 rounded-full flex items-center justify-center transition"
          >
            →
          </button>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-4">
            {slides.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentSlide(idx)}
                className={`w-2 h-2 rounded-full transition ${
                  idx === currentSlide ? 'bg-blue-500' : 'bg-slate-600'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Ações Rápidas</p>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/cliente/agendar">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition">
                <div className="text-3xl mb-2">📅</div>
                <p className="text-sm font-semibold">Agendar Agora</p>
              </div>
            </Link>
            <Link href="/cliente/agendamentos">
              <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-4 text-white cursor-pointer hover:shadow-lg transition">
                <div className="text-3xl mb-2">📋</div>
                <p className="text-sm font-semibold">Meus Agendamentos</p>
              </div>
            </Link>
          </div>
        </div>

        {/* Categories */}
        <div className="mt-8">
          <p className="text-slate-400 text-xs uppercase tracking-wider mb-3">Categorias</p>
          <div className="grid grid-cols-3 gap-2">
            <Link href="/cliente/buscar?categoria=barbearia">
              <div className="bg-slate-800 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-700 transition">
                <div className="text-2xl mb-1">💇</div>
                <p className="text-xs text-slate-300">Barbearia</p>
              </div>
            </Link>
            <Link href="/cliente/buscar?categoria=salao">
              <div className="bg-slate-800 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-700 transition">
                <div className="text-2xl mb-1">💄</div>
                <p className="text-xs text-slate-300">Salão</p>
              </div>
            </Link>
            <Link href="/cliente/buscar?categoria=manicure">
              <div className="bg-slate-800 rounded-lg p-3 text-center cursor-pointer hover:bg-slate-700 transition">
                <div className="text-2xl mb-1">💅</div>
                <p className="text-xs text-slate-300">Manicure</p>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <div className="flex justify-around items-center h-20">
          <Link
            href="/cliente"
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full hover:bg-slate-700/50 transition text-blue-400"
          >
            <span className="text-2xl">🏠</span>
            <p className="text-xs font-medium">Início</p>
          </Link>
          <Link
            href="/cliente/buscar"
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full hover:bg-slate-700/50 transition text-slate-400"
          >
            <span className="text-2xl">🔍</span>
            <p className="text-xs font-medium">Buscar</p>
          </Link>
          <Link
            href="/cliente/agendamentos"
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full hover:bg-slate-700/50 transition text-slate-400"
          >
            <span className="text-2xl">📅</span>
            <p className="text-xs font-medium">Agendamentos</p>
          </Link>
          <Link
            href="/cliente/menu"
            className="flex flex-col items-center justify-center gap-1 flex-1 h-full hover:bg-slate-700/50 transition text-slate-400"
          >
            <span className="text-2xl">👤</span>
            <p className="text-xs font-medium">Menu</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

export default function BuscarPage() {
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  // Profissionais de exemplo (depois virão da API)
  const profissionais = [
    {
      id: 1,
      nome: 'Barbearia do João',
      categoria: 'Barbearia',
      rating: 4.8,
      reviews: 128,
      distancia: '2.5 km',
      tempo: '10 min',
      preco: 'R$ 50 - R$ 150',
      imagem: '💇',
    },
    {
      id: 2,
      nome: 'Salão da Maria',
      categoria: 'Salão',
      rating: 4.9,
      reviews: 256,
      distancia: '1.2 km',
      tempo: '5 min',
      preco: 'R$ 80 - R$ 200',
      imagem: '💄',
    },
    {
      id: 3,
      nome: 'Unhas Perfeitas',
      categoria: 'Manicure',
      rating: 4.7,
      reviews: 89,
      distancia: '3.1 km',
      tempo: '15 min',
      preco: 'R$ 40 - R$ 100',
      imagem: '💅',
    },
  ];

  return (
    <div className="bg-slate-900 min-h-screen pb-24">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="flex items-center gap-3 p-4">
          <Link href="/cliente" className="text-white text-2xl">
            ←
          </Link>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar estabelecimento..."
            className="flex-1 bg-slate-700 text-white placeholder-slate-400 rounded-full px-4 py-2 outline-none text-sm"
          />
        </div>
      </div>

      {/* Results */}
      <div className="px-4 py-4">
        <p className="text-slate-400 text-sm mb-4">
          {profissionais.length} estabelecimentos encontrados
        </p>

        <div className="space-y-3">
          {profissionais
            .filter((p) =>
              p.nome.toLowerCase().includes(search.toLowerCase()) ||
              p.categoria.toLowerCase().includes(search.toLowerCase())
            )
            .map((prof) => (
              <Link href={`/cliente/profissional/${prof.id}`} key={prof.id}>
                <div className="bg-slate-800 rounded-lg overflow-hidden hover:bg-slate-700 transition cursor-pointer border border-slate-700">
                  {/* Imagem */}
                  <div className="bg-gradient-to-br from-blue-600 to-blue-800 h-32 flex items-center justify-center text-6xl">
                    {prof.imagem}
                  </div>

                  {/* Conteúdo */}
                  <div className="p-4">
                    <h3 className="text-white font-semibold mb-1">{prof.nome}</h3>
                    <p className="text-slate-400 text-xs mb-3">{prof.categoria}</p>

                    {/* Rating e Distance */}
                    <div className="flex gap-4 text-sm mb-3">
                      <div className="flex items-center gap-1">
                        <span className="text-yellow-400">⭐</span>
                        <span className="text-slate-300">
                          {prof.rating} ({prof.reviews})
                        </span>
                      </div>
                      <div className="text-slate-400">{prof.distancia}</div>
                      <div className="text-slate-400">{prof.tempo}</div>
                    </div>

                    {/* Preço */}
                    <div className="flex justify-between items-center">
                      <span className="text-slate-300 font-medium">{prof.preco}</span>
                      <span className="text-blue-400 text-sm">→</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700">
        <div className="flex justify-around items-center h-20">
          <Link href="/cliente" className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-slate-400">
            <span className="text-2xl">🏠</span>
            <p className="text-xs">Início</p>
          </Link>
          <Link href="/cliente/buscar" className="flex flex-col items-center justify-center gap-1 flex-1 h-full text-blue-400">
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

'use client';

import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Usuario {
  id: string;
  name: string;
  email: string;
  role: string;
  active: boolean;
  created_at: string;
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUsuarios(data.data?.users || []);
      } else {
        setError(data.error?.message || 'Erro ao carregar usuários');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar title="CLEITON BLADE" subtitle="Gerenciamento de Usuários" />
        <div className="p-6">Carregando...</div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gradient-to-br dark:from-slate-900 dark:to-slate-800 transition-colors">
      <Navbar title="CLEITON BLADE" subtitle="Gerenciamento de Usuários" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Gerenciamento de Usuários</h1>
          <Link
            href="/admin/usuarios/novo"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded font-semibold transition-colors"
          >
            + Novo Usuário
          </Link>
        </div>

        {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-4 mb-4 rounded transition-colors">{error}</div>}

        <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700 shadow-lg transition-colors">
          <table className="w-full">
            <thead className="bg-gray-100 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
              <tr>
                <th className="px-6 py-4 text-left text-gray-900 dark:text-white font-semibold">Nome</th>
                <th className="px-6 py-4 text-left text-gray-900 dark:text-white font-semibold">Email</th>
                <th className="px-6 py-4 text-left text-gray-900 dark:text-white font-semibold">Role</th>
                <th className="px-6 py-4 text-left text-gray-900 dark:text-white font-semibold">Status</th>
                <th className="px-6 py-4 text-center text-gray-900 dark:text-white font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500 dark:text-slate-400 text-lg">
                    Nenhum usuário cadastrado
                  </td>
              </tr>
            ) : (
              usuarios.map((user, idx) => (
                <tr key={user.id} className={`border-b border-gray-200 dark:border-slate-700 transition-colors ${
                  idx % 2 === 0 ? 'bg-gray-50 dark:bg-slate-800/60 hover:bg-gray-100 dark:hover:bg-slate-700/80' : 'bg-white dark:bg-slate-800/40 hover:bg-gray-100 dark:hover:bg-slate-700/80'
                }`}>
                  <td className="px-6 py-4 text-gray-900 dark:text-white font-medium">{user.name}</td>
                  <td className="px-6 py-4 text-gray-600 dark:text-slate-300">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.role === 'admin' ? 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300' : 
                      user.role === 'professional' ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300' : 
                      'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                      user.active ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300' : 'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300'
                    }`}>
                      {user.active ? '✓ Ativo' : '✗ Inativo'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/usuarios/${user.id}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mr-3 font-semibold transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Deseja deletar este usuário?')) {
                          // TODO: Implementar delete
                        }
                      }}
                      className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 font-semibold transition-colors"
                    >
                      Deletar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  );
}

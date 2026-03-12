'use client';

import { Navbar } from '@/components/Navbar';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Cliente {
  id: string;
  user_id: string;
  phone: string;
  birth_date: string;
  address: string;
  created_at: string;
}

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchClientes();
  }, []);

  const fetchClientes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/clients', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setClientes(data.data?.clients || []);
      } else {
        setError(data.error?.message || 'Erro ao carregar clientes');
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
        <Navbar title="CLEITON BLADE" subtitle="Gerenciamento de Clientes" />
        <div className="p-6">Carregando...</div>
      </>
    );
  }

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 to-slate-900 min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-white">Gerenciamento de Clientes</h1>
        <Link
          href="/admin/clientes/novo"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-semibold"
        >
          + Novo Cliente
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      <div className="bg-slate-900 rounded-lg overflow-hidden border border-slate-700 shadow-lg">
        <table className="w-full">
          <thead className="bg-slate-800 border-b-2 border-slate-700">
            <tr>
              <th className="px-6 py-4 text-left text-white font-semibold">Telefone</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Data Nascimento</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Endereço</th>
              <th className="px-6 py-4 text-left text-white font-semibold">Cadastrado em</th>
              <th className="px-6 py-4 text-center text-white font-semibold">Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-8 text-center text-slate-400 text-lg">
                  Nenhum cliente cadastrado
                </td>
              </tr>
            ) : (
              clientes.map((cliente, idx) => (
                <tr key={cliente.id} className={`border-b border-slate-700 transition-colors ${
                  idx % 2 === 0 ? 'bg-slate-800/60 hover:bg-slate-700/80' : 'bg-slate-800/40 hover:bg-slate-700/80'
                }`}>
                  <td className="px-6 py-4 text-white font-medium">{cliente.phone}</td>
                  <td className="px-6 py-4 text-slate-300">{cliente.birth_date}</td>
                  <td className="px-6 py-4 text-slate-300 truncate max-w-xs">{cliente.address}</td>
                  <td className="px-6 py-4 text-white">{new Date(cliente.created_at).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/clientes/${cliente.id}`}
                      className="text-blue-400 hover:text-blue-300 mr-3 font-semibold transition-colors"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Deseja deletar este cliente?')) {
                          // TODO: Implementar delete
                        }
                      }}
                      className="text-red-400 hover:text-red-300 font-semibold transition-colors"
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
  );
}

'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

interface Pagamento {
  id: string;
  appointment_id: string;
  amount: number;
  method: string;
  status: string;
  transaction_id: string;
  paid_at: string;
  created_at: string;
}

export default function PagamentosPage() {
  const [pagamentos, setPagamentos] = useState<Pagamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPagamentos();
  }, []);

  const fetchPagamentos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/payments', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setPagamentos(data.data?.payments || []);
      } else {
        setError(data.error?.message || 'Erro ao carregar pagamentos');
      }
    } catch (err) {
      setError('Erro ao conectar com o servidor');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-6">Carregando...</div>;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Pagamentos</h1>
        <Link
          href="/admin/pagamentos/novo"
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          + Novo Pagamento
        </Link>
      </div>

      {error && <div className="bg-red-100 text-red-700 p-4 mb-4 rounded">{error}</div>}

      <div className="bg-slate-800 rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700">
            <tr>
              <th className="px-6 py-3 text-left">Valor</th>
              <th className="px-6 py-3 text-left">Método</th>
              <th className="px-6 py-3 text-left">Status</th>
              <th className="px-6 py-3 text-left">ID Transação</th>
              <th className="px-6 py-3 text-left">Pago em</th>
              <th className="px-6 py-3 text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {pagamentos.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-400">
                  Nenhum pagamento cadastrado
                </td>
              </tr>
            ) : (
              pagamentos.map((pagamento) => (
                <tr key={pagamento.id} className="border-t border-slate-700 hover:bg-slate-700">
                  <td className="px-6 py-4">R$ {pagamento.amount.toFixed(2)}</td>
                  <td className="px-6 py-4">{pagamento.method}</td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded text-sm ${
                      pagamento.status === 'completed' ? 'bg-green-600' : 
                      pagamento.status === 'failed' ? 'bg-red-600' : 
                      'bg-yellow-600'
                    }`}>
                      {pagamento.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">{pagamento.transaction_id}</td>
                  <td className="px-6 py-4">{pagamento.paid_at ? new Date(pagamento.paid_at).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      href={`/admin/pagamentos/${pagamento.id}`}
                      className="text-blue-400 hover:text-blue-300 mr-4"
                    >
                      Editar
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm('Deseja deletar este pagamento?')) {
                          // TODO: Implementar delete
                        }
                      }}
                      className="text-red-400 hover:text-red-300"
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

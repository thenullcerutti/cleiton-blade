'use client';

import { clientService } from '@/lib/api';
import { Client } from '@/types';
import { useEffect, useState } from 'react';

interface PaginationState {
  page: number;
  pageSize: number;
  total: number;
  pages: number;
}

export default function ClientesPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [pagination, setPagination] = useState<PaginationState>({ 
    page: 1, 
    pageSize: 20, 
    total: 0, 
    pages: 0 
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletingClientId, setDeletingClientId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    birthDate: '',
  });

  // Carregar clientes
  const loadClients = async (page: number = 1) => {
    setLoading(true);
    setError(null);
    try {
      const response = await clientService.list(page, 20);
      if (response.success && response.data && typeof response.data === 'object') {
        const { clients: clientsData = [], pagination: paginationData } = response.data as any;
        setClients(Array.isArray(clientsData) ? clientsData : []);
        if (paginationData) {
          setPagination(paginationData);
        }
      } else {
        setClients([]);
        setError(response.error?.message || 'Erro ao carregar clientes');
      }
    } catch (err: any) {
      setClients([]);
      setError(err?.message || 'Erro ao carregar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  // Resetar formulário
  const resetForm = () => {
    setFormData({ name: '', phone: '', email: '', birthDate: '' });
    setEditingClient(null);
  };

  // Abrir modal de adição
  const handleAddClick = () => {
    resetForm();
    setShowAddModal(true);
  };

  // Abrir modal de edição
  const handleEditClick = (client: Client) => {
    setEditingClient(client);
    setFormData({
      name: client.name,
      phone: client.phone,
      email: client.email || '',
      birthDate: client.birth_date || '',
    });
    setShowEditModal(true);
  };

  // Adicionar cliente
  const handleAddClient = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      setError('Nome e telefone são obrigatórios');
      return;
    }

    try {
      const response = await clientService.create(
        formData.name,
        formData.phone,
        formData.email || undefined,
        formData.birthDate || undefined
      );
      if (response.success) {
        setShowAddModal(false);
        resetForm();
        await loadClients(pagination.page);
      } else {
        setError(response.error?.message || 'Erro ao adicionar cliente');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao adicionar cliente');
    }
  };

  // Atualizar cliente
  const handleUpdateClient = async () => {
    if (!editingClient) return;

    try {
      const response = await clientService.update(editingClient.id, {
        name: formData.name,
        email: formData.email || undefined,
        birthDate: formData.birthDate || undefined,
      });
      if (response.success) {
        setShowEditModal(false);
        resetForm();
        await loadClients(pagination.page);
      } else {
        setError(response.error?.message || 'Erro ao atualizar cliente');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Erro ao atualizar cliente');
    }
  };

  // Abrir modal de confirmação de remoção
  const handleDeleteClick = (client: Client) => {
    setDeletingClientId(client.id);
    setShowDeleteModal(true);
  };

  // Remover cliente
  const handleDeleteClient = async () => {
    if (!deletingClientId) return;

    try {
      const response = await clientService.delete(deletingClientId);
      if (response.success) {
        setShowDeleteModal(false);
        setDeletingClientId(null);
        await loadClients(pagination.page);
      } else {
        setError(response.error?.message || 'Erro ao remover cliente');
      }
    } catch (err: any) {
      setError(err?.message || 'Erro ao remover cliente');
    }
  };

  // Formatar data para exibição
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Clientes</h1>
        <button
          onClick={handleAddClick}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
        >
          + Novo Cliente
        </button>
      </div>

      {/* Mensagem de erro */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800">
          {error}
        </div>
      )}

      {/* Tabela */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Nome</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Telefone</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Email</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Data Nascimento</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Carregando...
                  </td>
                </tr>
              ) : !clients || clients.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                    Nenhum cliente cadastrado
                  </td>
                </tr>
              ) : (
                clients.map((client) => (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">{client.name}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.phone}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{client.email || '-'}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{formatDate(client.birth_date)}</td>
                    <td className="px-6 py-4 text-sm space-x-2">
                      <button
                        onClick={() => handleEditClick(client)}
                        className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded font-medium transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDeleteClick(client)}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded font-medium transition"
                      >
                        Remover
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Paginação */}
      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2">
          {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => loadClients(page)}
              className={`px-4 py-2 rounded font-medium transition ${
                pagination.page === page
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
              }`}
            >
              {page}
            </button>
          ))}
        </div>
      )}

      {/* Modal Adicionar Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Novo Cliente</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="(11) 99999-9999"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="exemplo@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowAddModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddClient}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Adicionar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {showEditModal && editingClient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Editar Cliente</h2>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="exemplo@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data de Nascimento</label>
              <input
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowEditModal(false);
                  resetForm();
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateClient}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Atualizar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Remover Cliente */}
      {showDeleteModal && deletingClientId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 space-y-4">
            <h2 className="text-2xl font-bold text-gray-900">Remover Cliente</h2>
            
            <p className="text-gray-600">
              Tem certeza que deseja remover este cliente? Esta ação não pode ser desfeita.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeletingClientId(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg font-medium transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteClient}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition"
              >
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

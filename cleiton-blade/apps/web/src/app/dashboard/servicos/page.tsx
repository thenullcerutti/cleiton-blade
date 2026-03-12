"use client";

import { serviceService } from '@/lib/api';
import { Service } from '@/types';
import { useEffect, useState } from 'react';

interface ServiceForm {
  name: string;
  durationMinutes: number;
  price: number;
}

export default function ServicosPage() {
  const [servicos, setServicos] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<ServiceForm>({ name: '', durationMinutes: 30, price: 0 });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchServicos() {
      setLoading(true);
      setError(null);
      try {
        console.log('Iniciando requisição de serviços para:', process.env.NEXT_PUBLIC_API_URL);
        const response = await serviceService.list();
        console.log('Resposta de serviços:', response);
        
        // Corrige para pegar array de services do backend
        if (response.success && response.data && Array.isArray(response.data.services)) {
          console.log('Serviços mapeados:', response.data.services.length);
          setServicos(response.data.services.map(s => ({
            ...s,
            durationMinutes: s.duration_minutes,
            price: typeof s.price === 'number' ? s.price : parseFloat(s.price),
            createdAt: s.created_at,
            updatedAt: s.updated_at,
          })));
        } else if (response.success && response.data && response.data.services && typeof response.data.services === 'object') {
          const s = response.data.services;
          console.log('Serviço único:', s);
          setServicos([{ ...s, durationMinutes: s.duration_minutes, createdAt: s.created_at, updatedAt: s.updated_at }]);
        } else {
          console.log('Erro na resposta:', response);
          setServicos([]);
          setError(response.error?.message || 'Erro ao carregar serviços');
        }
      } catch (err: any) {
        console.error('Erro ao carregar serviços:', err);
        setError(err.message || 'Erro ao carregar serviços');
      } finally {
        setLoading(false);
      }
    }
    fetchServicos();
  }, []);

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Serviços</h1>
        <button
          className="bg-secondary text-white px-4 py-2 rounded shadow hover:bg-green-700 transition"
          onClick={() => {
            setForm({ name: '', durationMinutes: 30, price: 0 });
            setFormError(null);
            setEditId(null);
            setShowModal(true);
          }}
        >
          Adicionar Serviço
        </button>
      </div>

      {/* Modal de cadastro/edição */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
            <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setShowModal(false)}>&times;</button>
            <h2 className="text-xl font-bold mb-4">{editId ? 'Editar Serviço' : 'Novo Serviço'}</h2>
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setSaving(true);
                setFormError(null);
                try {
                  if (!form.name || form.durationMinutes <= 0 || isNaN(form.price) || form.price <= 0) {
                    setFormError('Preencha todos os campos corretamente. O preço deve ser maior que zero e usar vírgula ou ponto.');
                    setSaving(false);
                    return;
                  }
                  const payload = {
                    ...form,
                    price: typeof form.price === 'string' ? parseFloat(form.price.replace(',', '.')) : form.price,
                  };
                  let resp;
                  if (editId) {
                    resp = await serviceService.update(editId, payload);
                  } else {
                    resp = await serviceService.create(payload);
                  }
                  if (resp.success && resp.data) {
                    if (editId) {
                      setServicos((prev) => prev.map(s => s.id === editId ? {
                        ...resp.data,
                        durationMinutes: resp.data.duration_minutes,
                        price: typeof resp.data.price === 'number' ? resp.data.price : parseFloat(resp.data.price),
                        createdAt: resp.data.created_at,
                        updatedAt: resp.data.updated_at,
                      } : s));
                    } else {
                      setServicos((prev) => [...prev, {
                        ...resp.data,
                        durationMinutes: resp.data.duration_minutes,
                        price: typeof resp.data.price === 'number' ? resp.data.price : parseFloat(resp.data.price),
                        createdAt: resp.data.created_at,
                        updatedAt: resp.data.updated_at,
                      }]);
                    }
                    setShowModal(false);
                  } else {
                    setFormError(resp.error?.message || 'Erro ao salvar serviço');
                  }
                } catch (err: any) {
                  setFormError(err.message || 'Erro ao salvar serviço');
                } finally {
                  setSaving(false);
                }
              }}
            >
              <div className="mb-4">
                <label className="block mb-1 font-medium">Nome</label>
                <input
                  className="w-full border rounded px-3 py-2"
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Duração (minutos)</label>
                <input
                  type="number"
                  className="w-full border rounded px-3 py-2"
                  value={form.durationMinutes}
                  min={1}
                  onChange={e => setForm(f => ({ ...f, durationMinutes: Number(e.target.value) }))}
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block mb-1 font-medium">Preço (R$)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]+([\.,][0-9]{0,2})?"
                  className="w-full border rounded px-3 py-2"
                  value={form.price === 0 ? '' : form.price.toString().replace('.', ',')}
                  min={0}
                  onChange={e => {
                    // Aceita ponto ou vírgula, converte para float
                    let val = e.target.value.replace(',', '.');
                    // Remove letras e múltiplos pontos
                    val = val.replace(/[^0-9.]/g, '').replace(/(\..*)\./g, '$1');
                    setForm(f => ({ ...f, price: val === '' ? 0 : parseFloat(val) }));
                  }}
                  required
                  placeholder="Ex: 25,50"
                />
              </div>
              {formError && <div className="text-red-500 mb-2">{formError}</div>}
              <button
                type="submit"
                className="bg-primary text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition w-full"
                disabled={saving}
              >
                {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="bg-white rounded shadow p-6">
        {loading ? (
          <div className="text-center text-gray-500">Carregando...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : (
          <table className="min-w-full text-left">
            <thead>
              <tr>
                <th className="py-2 px-4">Nome</th>
                <th className="py-2 px-4">Duração</th>
                <th className="py-2 px-4">Preço</th>
                <th className="py-2 px-4">Status</th>
                <th className="py-2 px-4">Ações</th>
              </tr>
            </thead>
            <tbody>
              {servicos.map((servico, idx) => (
                <tr className="border-b" key={servico.id || idx}>
                  <td className="py-2 px-4 font-semibold">{servico.name}</td>
                  <td className="py-2 px-4">{servico.durationMinutes} min</td>
                  <td className="py-2 px-4">R$ {typeof servico.price === 'number' ? servico.price.toFixed(2) : '-'}</td>
                  <td className="py-2 px-4">
                    <span className={servico.active ? 'bg-green-100 text-green-700 px-2 py-1 rounded' : 'bg-gray-200 text-gray-500 px-2 py-1 rounded'}>
                      {servico.active ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className="py-2 px-4">
                    <button
                      className="bg-primary text-white px-3 py-1 rounded mr-2"
                      onClick={() => {
                        setForm({
                          name: servico.name,
                          durationMinutes: servico.durationMinutes,
                          price: servico.price,
                        });
                        setFormError(null);
                        setEditId(servico.id);
                        setShowModal(true);
                      }}
                    >Editar</button>
                    <button
                      className="bg-red-500 text-white px-3 py-1 rounded"
                      onClick={() => setRemovingId(servico.id)}
                    >Remover</button>
                        {/* Modal de confirmação de remoção */}
                        {removingId && (
                          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
                            <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md relative">
                              <button className="absolute top-2 right-2 text-gray-400 hover:text-gray-700" onClick={() => setRemovingId(null)}>&times;</button>
                              <h2 className="text-xl font-bold mb-4">Remover Serviço</h2>
                              <p className="mb-4">Tem certeza que deseja remover este serviço?</p>
                              <div className="flex gap-4">
                                <button
                                  className="bg-red-500 text-white px-4 py-2 rounded shadow hover:bg-red-700 transition w-full"
                                  onClick={async () => {
                                    try {
                                      const resp = await serviceService.remove(removingId);
                                      if (resp.success) {
                                        setServicos(prev => prev.filter(s => s.id !== removingId));
                                        setRemovingId(null);
                                      } else {
                                        alert(resp.error?.message || 'Erro ao remover serviço');
                                      }
                                    } catch (err: any) {
                                      alert(err.message || 'Erro ao remover serviço');
                                    }
                                  }}
                                >Remover</button>
                                <button
                                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded shadow hover:bg-gray-400 transition w-full"
                                  onClick={() => setRemovingId(null)}
                                >Cancelar</button>
                              </div>
                            </div>
                          </div>
                        )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

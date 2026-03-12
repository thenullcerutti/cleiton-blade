
export default function ProfissionaisPage() {
  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Profissionais</h1>
        <button className="bg-secondary text-white px-4 py-2 rounded shadow hover:bg-green-700 transition">Adicionar Profissional</button>
      </div>
      <div className="bg-white rounded shadow p-6">
        <table className="min-w-full text-left">
          <thead>
            <tr>
              <th className="py-2 px-4">Nome</th>
              <th className="py-2 px-4">Comissão</th>
              <th className="py-2 px-4">Status</th>
              <th className="py-2 px-4">Ações</th>
            </tr>
          </thead>
          <tbody>
            {/* Exemplo de linha */}
            <tr className="border-b">
              <td className="py-2 px-4 font-semibold">João da Silva</td>
              <td className="py-2 px-4">50%</td>
              <td className="py-2 px-4"><span className="bg-green-100 text-green-700 px-2 py-1 rounded">Ativo</span></td>
              <td className="py-2 px-4">
                <button className="bg-primary text-white px-3 py-1 rounded mr-2">Editar</button>
                <button className="bg-red-500 text-white px-3 py-1 rounded">Remover</button>
              </td>
            </tr>
            {/* ... */}
          </tbody>
        </table>
      </div>
    </div>
  );
}

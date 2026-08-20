import React from 'react';
import { useOrdemCompra } from './useOrdemCompra';

export function OrdemCompra() {
  const {
    fornecedorId, setFornecedorId,
    dataVencimento, setDataVencimento,
    itens, adicionarItem, atualizarItem, removerItem,
    valorTotalGeral,
    loading,
    status,
    enviarOrdemCompra
  } = useOrdemCompra();

  return (
    <div className="p-6 max-w-3xl mx-auto bg-white border border-gray-200 shadow-sm rounded-xl">
      <div className="border-b pb-4 mb-6">
        <h2 className="text-2xl font-bold text-gray-900">⚙️ PCP — Emitir Ordem de Compra</h2>
        <p className="text-sm text-gray-500">Geração de pedidos de matéria-prima e insumos com análise de impacto em conta bancária.</p>
      </div>
      
      <form onSubmit={enviarOrdemCompra} className="space-y-6">
        {/* Cabeçalho da OC */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">ID ou Código do Fornecedor</label>
            <input 
              type="text" 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" 
              value={fornecedorId} 
              onChange={e => setFornecedorId(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Data de Vencimento do Boleto</label>
            <input 
              type="date" 
              className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:outline-none" 
              value={dataVencimento} 
              onChange={e => setDataVencimento(e.target.value)} 
              required 
            />
          </div>
        </div>

        {/* Listagem Dinâmica de Itens/Insumos */}
        <div className="space-y-3">
          <div className="flex justify-between items-center border-t pt-4">
            <h3 className="font-bold text-gray-800 text-lg">Insumos Solicitados</h3>
            <button 
              type="button" 
              onClick={adicionarItem} 
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg transition"
            >
              + Adicionar Item
            </button>
          </div>

          {itens.map((item, index) => (
            <div key={index} className="flex flex-col sm:flex-row gap-3 items-end bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="flex-1 w-full">
                <label className="block text-xs font-medium text-gray-500 mb-1">ID Insumo (Ex: Aço 1020)</label>
                <input 
                  type="text" 
                  placeholder="Código do item" 
                  className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm"
                  value={item.insumo_id}
                  onChange={e => atualizarItem(index, 'insumo_id', e.target.value)} 
                  required 
                />
              </div>
              <div className="w-full sm:w-32">
                <label className="block text-xs font-medium text-gray-500 mb-1">Quantidade</label>
                <input 
                  type="number" 
                  placeholder="0.00" 
                  className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm"
                  value={item.quantidade || ''}
                  onChange={e => atualizarItem(index, 'quantidade', Number(e.target.value))} 
                  required 
                />
              </div>
              <div className="w-full sm:w-40">
                <label className="block text-xs font-medium text-gray-500 mb-1">R$ Unitário</label>
                <input 
                  type="number" 
                  step="0.01" 
                  placeholder="0,00" 
                  className="w-full p-2 bg-white border border-gray-300 rounded-md text-sm"
                  value={item.valor_unitario || ''}
                  onChange={e => atualizarItem(index, 'valor_unitario', Number(e.target.value))} 
                  required 
                />
              </div>
              
              {itens.length > 1 && (
                <button 
                  type="button" 
                  onClick={() => removerItem(index)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-md transition mb-0.5"
                  title="Remover item"
                >
                  🗑️
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Resumo Financeiro */}
        <div className="flex justify-between items-center bg-gray-900 p-4 rounded-xl text-white">
          <span className="text-sm font-medium tracking-wide uppercase text-gray-400">Total Previsto da OC:</span>
          <span className="text-2xl font-black">R$ {valorTotalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
        </div>

        {/* Painel Dinâmico de Resposta/Bloqueio */}
        {status && (
          <div className={`p-4 rounded-xl border-l-4 shadow-sm ${
            status.tipo === 'erro' 
              ? 'bg-red-50 text-red-900 border-red-600' 
              : 'bg-green-50 text-green-900 border-green-600'
          }`}>
            <h4 className="font-bold flex items-center gap-2">
              {status.tipo === 'erro' ? '🛑 Compra Recusada pelo ERP' : '🎉 Tudo Certo!'}
            </h4>
            <p className="text-sm font-medium mt-1">{status.titulo}</p>
            {status.detalhe && (
              <p className="text-xs font-mono mt-3 bg-white p-3 rounded-lg border border-red-200 text-red-700 leading-relaxed">
                {status.detalhe}
              </p>
            )}
          </div>
        )}

        {/* Botão de Submissão */}
        <button 
          type="submit" 
          disabled={loading} 
          className="w-full p-3.5 bg-gray-950 text-white font-bold rounded-xl hover:bg-gray-800 active:scale-[0.99] transition disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? 'Consultando saúde de caixa futura...' : 'Validar e Emitir Ordem de Compra'}
        </button>
      </form>
    </div>
  );
}

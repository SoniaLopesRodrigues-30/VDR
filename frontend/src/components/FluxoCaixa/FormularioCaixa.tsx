// src/components/FluxoCaixa/FormularioCaixa.tsx
import React from 'react';

const CATEGORIAS = [
  'Venda de Produtos', 
  'Prestação de Serviços', 
  'Salários e Encargos', 
  'Aluguel e Infraestrutura', 
  'Fornecedores', 
  'Marketing e Vendas', 
  'Software e Ferramentas', 
  'Impostos e Taxas', 
  'Outros'
];

const FORMAS = [
  'Pix', 
  'Dinheiro', 
  'Cartão de Crédito', 
  'Cartão de Débito', 
  'Boleto', 
  'Transferência'
];

// Contrato de tipagem do TypeScript
interface FormularioCaixaProps {
  idEditando: string | null;
  form: any;
  setForm: React.Dispatch<React.SetStateAction<any>>;
  salvar: (e: React.FormEvent) => Promise<void> | void;
  cancelarAcao: () => void;
  inp: React.CSSProperties;
}

export function FormularioCaixa({
  idEditando,
  form = {}, // Evita erros de "undefined" ao abrir formulário em branco
  setForm,
  salvar,
  cancelarAcao,
  inp
}: FormularioCaixaProps) {
  return (
    <form onSubmit={salvar} style={{ background: '#f8fafc', padding: '15px', borderRadius: '8px', border: '1px solid #e2e8f0', marginBottom: '20px' }}>
      <h3 style={{ margin: '0 0 15px 0', fontSize: '16px', color: '#334155' }}>
        {idEditando ? '✏️ Editando Lançamento' : '✨ Novo Lançamento'}
      </h3>
      
      <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
        <input 
          type="text" 
          placeholder="Descrição" 
          value={form.descricao || ''} 
          onChange={e => setForm({ ...form, descricao: e.target.value })} 
          style={{ ...inp, flex: 2 }} 
        />
        <input 
          type="text" 
          placeholder="Cliente / Fornecedor" 
          value={form.cliente_fornecedor || ''} 
          onChange={e => setForm({ ...form, cliente_fornecedor: e.target.value })} 
          style={{ ...inp, flex: 2 }} 
        />
      </div>
      
      <div style={{ display: 'flex', gap: '10px' }}>
        <input 
          type="number" 
          step="0.01" 
          placeholder="Valor (R$)" 
          value={form.valor || ''} 
          onChange={e => setForm({ ...form, valor: e.target.value })} 
          style={inp} 
        />
        <input 
          type="date" 
          value={form.data || ''} 
          onChange={e => setForm({ ...form, data: e.target.value })} 
          style={inp} 
        />
        
        <select 
          value={form.conta_contabil || ''} 
          onChange={e => setForm({ ...form, conta_contabil: e.target.value })} 
          style={inp}
        >
          <option value="">Selecione uma Categoria...</option>
          {CATEGORIAS.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
        
        <select 
          value={form.forma_pagamento || ''} 
          onChange={e => setForm({ ...form, forma_pagamento: e.target.value })} 
          style={inp}
        >
          <option value="">Forma de Pagamento...</option>
          {FORMAS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        
        <select 
          value={form.tipo || 'receita'} 
          onChange={e => setForm({ ...form, tipo: e.target.value })} 
          style={inp}
        >
          <option value="receita">Receita</option>
          <option value="despesa">Despesa</option>
        </select>
      </div>
      
      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        <button type="submit" style={{ flex: 1, padding: '10px', background: '#10b981', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          {idEditando ? 'Atualizar Dados' : 'Salvar Lançamento'}
        </button>
        <button type="button" onClick={cancelarAcao} style={{ padding: '10px 20px', background: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>
          Cancelar
        </button>
      </div>
    </form>
  );
}

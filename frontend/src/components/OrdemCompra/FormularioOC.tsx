// FormularioOC.tsx
import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import * as S from './OrdemCompra.styles';
import { type Clientes, type ItemOC } from './OrdemCompra';

interface FormularioOCProps {
  fornecedorId: string;
  setFornecedorId: (id: string) => void;
  dataVencimento: string;
  setDataVencimento: (data: string) => void;
  itens: ItemOC[];
  setItens: React.Dispatch<React.SetStateAction<ItemOC[]>>;
  insumoId: string;
  setInsumoId: (val: string) => void;
  qtd: number;
  setQtd: (val: number) => void;
  valUnit: number;
  setValUnit: (val: number) => void;
  incluirItemNaGrid: () => void;
  handleSalvarOC: (e: React.FormEvent) => void;
  totalGeralCalculado: number;
  termoPesquisa: string;
  setTermoPesquisa: (val: string) => void;
  listaFornecedores: Clientes[];
  buscandoBanco: boolean;
}

export function FormularioOC({
  fornecedorId, setFornecedorId, dataVencimento, setDataVencimento, itens, setItens,
  insumoId, setInsumoId, qtd, setQtd, valUnit, setValUnit, incluirItemNaGrid, handleSalvarOC,
  totalGeralCalculado, termoPesquisa, setTermoPesquisa, listaFornecedores, buscandoBanco
}: FormularioOCProps) {
  
  const [mostrarSugestoes, setMostrarSugestoes] = useState(false);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const removerItemDaGrid = (indexParaRemover: number) => {
    setItens(itens.filter((_, idx) => idx !== indexParaRemover));
  };

  return (
    <form onSubmit={handleSalvarOC} style={S.formStyle}>
      <div style={S.gridFormStyle}>
        <div>
          <label style={S.labelStyle}>Fornecedor (Origem: Cadastro Clientes)</label>
          <div style={S.selectContainerStyle}>
            <input 
              type="text" 
              placeholder="Digite o nome para buscar..." 
              style={S.inputStyle}
              value={termoPesquisa}
              onChange={e => {
                setTermoPesquisa(e.target.value);
                setMostrarSugestoes(true);
                if (e.target.value === "") setFornecedorId("");
              }}
              onFocus={() => setMostrarSugestoes(true)}
              onBlur={() => setTimeout(() => setMostrarSugestoes(false), 250)}
              required
            />
            {mostrarSugestoes && termoPesquisa.trim().length >= 2 && (
              <ul style={S.dropdownSugestoesStyle}>
                {buscandoBanco ? (
                  <li style={S.itemSugestaoStyle}>🔄 Consultando banco...</li>
                ) : listaFornecedores.length > 0 ? (
                  listaFornecedores.map((f, idx) => (
                    <li 
                      key={f.id}
                      style={{ ...S.itemSugestaoStyle, ...(hoverIndex === idx ? S.itemSugestaoHoverStyle : {}) }}
                      onMouseEnter={() => setHoverIndex(idx)}
                      onMouseLeave={() => setHoverIndex(null)}
                      onClick={() => {
                        setFornecedorId(f.id);
                        setTermoPesquisa(f.nome);
                        setMostrarSugestoes(false);
                      }}
                    >
                      <strong>[{f.id}]</strong> {f.nome}
                    </li>
                  ))
                ) : (
                  <li style={S.itemSugestaoStyle}>❌ Nenhum registro encontrado.</li>
                )}
              </ul>
            )}
          </div>
        </div>

        <div>
          <label style={S.labelStyle}>Data de Vencimento do Boleto</label>
          <input type="date" style={S.inputStyle} value={dataVencimento} onChange={e => setDataVencimento(e.target.value)} required />
        </div>
      </div>

      <div style={S.gridDigitacaoStyle}>
        <div style={S.gridCamposItemStyle}>
          <div>
            <label style={S.labelStyle}>Insumo / Matéria-prima</label>
            <input type="text" placeholder="Ex: Aço 1020" style={S.inputItemStyle} value={insumoId} onChange={e => setInsumoId(e.target.value)} />
          </div>
          <div>
            <label style={S.labelStyle}>Quantidade</label>
            <input type="number" style={S.inputItemStyle} value={qtd} onChange={e => setQtd(Number(e.target.value))} />
          </div>
          <div>
            <label style={S.labelStyle}>R$ Unitário</label>
            <input type="number" step="0.01" style={S.inputItemStyle} value={valUnit} onChange={e => setValUnit(Number(e.target.value))} />
          </div>
          <button type="button" onClick={incluirItemNaGrid} style={S.botaoAdicionarStyle}>
            <Plus size={18} />
          </button>
        </div>
      </div>

      {itens.length > 0 && (
        <div style={S.tabelaContainerStyle}>
          <table style={S.tabelaStyle}>
            <thead>
              <tr>
                <th style={S.thStyle}>Insumo</th>
                <th style={S.thStyle}>Qtd</th>
                <th style={S.thStyle}>Valor Unitário</th>
                <th style={S.thStyle}>Subtotal</th>
                <th style={S.thStyle}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itens.map((item, index) => (
                <tr key={index}>
                  <td style={S.tdStyle}>{item.insumo_id}</td>
                  <td style={S.tdStyle}>{item.quantidade}</td>
                  <td style={S.tdStyle}>R$ {item.valor_unitario.toFixed(2)}</td>
                  <td style={S.tdStyle}>R$ {(item.quantidade * item.valor_unitario).toFixed(2)}</td>
                  <td style={S.tdStyle}>
                    <button type="button" onClick={() => removerItemDaGrid(index)} style={S.botaoLixeiraStyle}>🗑️</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div style={S.rodapeFormStyle}>
        <h3 style={S.totalVerdeStyle}>Total Geral: R$ {totalGeralCalculado.toFixed(2)}</h3>
        <button type="submit" style={S.botaoSalvarStyle}>Salvar Ordem de Compra</button>
      </div>
    </form>
  );
}

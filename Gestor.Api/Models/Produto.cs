namespace Gestor.Api.Models;

public class Produto
{
    public int Id { get; set; }
    public string Nome { get; set; } = string.Empty;
    public decimal Preco { get; set; }
    
    // Campos cruciais para a emissão de Nota Fiscal (NF-e)
    public string NCM { get; set; } = string.Empty; // Classificação Fiscal
    public string CFOP { get; set; } = string.Empty; // Código de Operação
    public string CodigoBarras { get; set; } = string.Empty;
}

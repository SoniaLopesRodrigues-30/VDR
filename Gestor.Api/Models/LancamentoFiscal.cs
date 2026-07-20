namespace Gestor.Api.Models;

public class LancamentoFiscal
{
    public int Id { get; set; }
    public string TipoOperacao { get; set; } = string.Empty; // Entrada ou Saída
    public string CFOP { get; set; } = string.Empty;
    public decimal ValorContabil { get; set; }
    public decimal BaseCalculoICMS { get; set; }
    public decimal ValorICMS { get; set; }
    public int? NfeId { get; set; } // Vinculado à nota fiscal gerada
    public Nfe? Nfe { get; set; }
    public DateTime DataLancamento { get; set; } = DateTime.Now;
}

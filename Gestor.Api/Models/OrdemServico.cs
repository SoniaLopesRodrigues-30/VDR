namespace Gestor.Api.Models;

public class OrdemServico
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public Cliente? Cliente { get; set; }
    public int? OrcamentoId { get; set; } // Pode vir de um orçamento
    public string DescricaoServico { get; set; } = string.Empty;
    public decimal ValorTotal { get; set; }
    public string Status { get; set; } = "Aberta"; // Aberta, Em Execução, Concluída
    public DateTime DataAbertura { get; set; } = DateTime.Now;
    public DateTime? DataConclusao { get; set; }
}

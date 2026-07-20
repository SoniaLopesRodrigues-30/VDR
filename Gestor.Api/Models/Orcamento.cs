namespace Gestor.Api.Models;

public class Orcamento
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public Cliente? Cliente { get; set; }
    public DateTime DataCriacao { get; set; } = DateTime.Now;
    public decimal ValorTotal { get; set; }
    public string Status { get; set; } = "Pendente"; // Pendente, Aprovado, Recusado
}

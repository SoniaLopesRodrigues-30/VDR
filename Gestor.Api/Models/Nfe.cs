namespace Gestor.Api.Models;

public class Nfe
{
    public int Id { get; set; }
    public int ClienteId { get; set; }
    public Cliente? Cliente { get; set; }
    public int NumeroNota { get; set; }
    public int Serie { get; set; }
    public string ChaveAcesso { get; set; } = string.Empty; // 44 dígitos da SEFAZ
    public string XmlConteudo { get; set; } = string.Empty; // Guardar o XML autorizado
    public string StatusEmissao { get; set; } = "Pendente"; // Autorizada, Rejeitada, Cancelada
    public DateTime DataEmissao { get; set; } = DateTime.Now;
}

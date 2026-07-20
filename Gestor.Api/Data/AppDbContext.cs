using Microsoft.EntityFrameworkCore;
using Gestor.Api.Models;

namespace Gestor.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<Cliente> Clientes { get; set; }
    public DbSet<Orcamento> Orcamentos { get; set; }
    public DbSet<OrdemServico> OrdensServico { get; set; }
    public DbSet<Nfe> Nfes { get; set; }
    public DbSet<LancamentoFiscal> LancamentosFiscais { get; set; }
}


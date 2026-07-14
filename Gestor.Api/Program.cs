using Microsoft.EntityFrameworkCore;
using Gestor.Api.Data;

var builder = WebApplication.CreateBuilder(args);

// --- SEÇÃO DE CONFIGURAÇÃO DE SERVIÇOS (Fica ANTES do builder.Build) ---

// 1. Configura o Banco de Dados SQLite no sistema
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlite("Data Source=gestor.db"));

// 2. Adiciona o suporte aos Controllers da API
builder.Services.AddControllers();

// 3. Adiciona o suporte ao OpenAPI / Swagger (Documentação)
builder.Services.AddOpenApi();

var app = builder.Build();

// --- SEÇÃO DE EXECUÇÃO DA APLICAÇÃO (Fica DEPOIS do builder.Build) ---

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

// Mapeia as rotas dos controllers automaticamente
app.MapControllers();

app.Run();

using Microsoft.EntityFrameworkCore;
using AIProfilerAPI.Models;
using AIProfilerAPI.Repositories;
using AIProfilerAPI.Services;

var builder = WebApplication.CreateBuilder(args);

// --- 1. CONFIGURATION ---
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// --- 2. SERVICES ---

// Add Controllers and OpenAPI (standard .NET 9 way)
builder.Services.AddControllers();
builder.Services.AddOpenApi(); // .NET 9 native support

// Database configuration (MySQL)
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Dependency Injection (Repositories)
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IReportRepository, ReportRepository>();
builder.Services.AddHttpClient<OpenRouterService>();

// CORS configuration (Essential for Angular integration)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowLocalhost", policy =>
    {
        policy.WithOrigins("http://localhost:4200") // URL of the Angular frontend
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// --- 3. MIDDLEWARE ---

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi(); // .NET 9 native support
}

// Enable CORS
app.UseCors("AllowLocalhost");

// Map Controllers
app.MapControllers();

app.Run();

using Microsoft.EntityFrameworkCore;
using AIProfilerAPI.Models;
using AIProfilerAPI.Repositories;

var builder = WebApplication.CreateBuilder(args);

// Get connection string from appsettings
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

// Add DbContext with MySQL
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

// Register Repository
builder.Services.AddScoped<IUserRepository, UserRepository>();

// Add services to the container.
builder.Services.AddOpenApi();
builder.Services.AddControllers();


var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseAuthorization();

app.MapControllers();

app.Run();

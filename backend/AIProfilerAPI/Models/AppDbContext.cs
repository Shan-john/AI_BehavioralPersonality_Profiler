using Microsoft.EntityFrameworkCore;

namespace AIProfilerAPI.Models
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; } = null!;

        public DbSet<Report> Reports { get; set; } = null!;
    }
}

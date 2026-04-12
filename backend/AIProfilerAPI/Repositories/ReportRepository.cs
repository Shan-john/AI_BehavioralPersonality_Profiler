using AIProfilerAPI.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AIProfilerAPI.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly AppDbContext _context;

        public ReportRepository(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Report> GetReportById(int id)
        {
            // Note: int is a value type, it cannot be null. 
            // If the user meant checking for a valid ID (0 is often default for int), we can check id == 0.
            if (id <= 0)
            {
                throw new System.Exception("Invalid Id");
            }

            return await _context.Reports.Where(r => r.UserId == id).FirstOrDefaultAsync() 
                   ?? throw new System.Exception("Report not found");
        }

        public async Task<Report> AddReport(Report report)
        {
            await _context.Reports.AddAsync(report);
            await _context.SaveChangesAsync();
            return report;
        }
    }
}
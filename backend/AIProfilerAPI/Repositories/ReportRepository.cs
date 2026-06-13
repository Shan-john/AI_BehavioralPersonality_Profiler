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

        public async Task<Report?> GetReportByUserId(int userId)
        {
            return await _context.Reports.FirstOrDefaultAsync(r => r.UserId == userId);
        }

        public async Task<Report> GetReportById(int id)
        {
            if (id <= 0)
            {
                throw new System.Exception("Invalid Id");
            }

            return await _context.Reports.Where(r => r.UserId == id).FirstOrDefaultAsync() 
                   ?? throw new System.Exception("Report not found");
        }

        public async Task<Report> AddReport(Report report)
        {
            // Upsert: if a report already exists for this user, update it
            var existing = await _context.Reports.FirstOrDefaultAsync(r => r.UserId == report.UserId);
            if (existing != null)
            {
                existing.Data = report.Data;
                _context.Reports.Update(existing);
                await _context.SaveChangesAsync();
                return existing;
            }

            await _context.Reports.AddAsync(report);
            await _context.SaveChangesAsync();
            return report;
        }

        public async Task<Report> UpdateReport(Report report)
        {
            _context.Reports.Update(report);
            await _context.SaveChangesAsync();
            return report;
        }
    }
}
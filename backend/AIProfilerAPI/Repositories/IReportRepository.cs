using AIProfilerAPI.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AIProfilerAPI.Repositories
{
    public interface IReportRepository
    {
        Task<Report?> GetReportByUserId(int userId);
        Task<Report> GetReportById(int id);
        Task<Report> AddReport(Report report);
        Task<Report> UpdateReport(Report report);
    }
}
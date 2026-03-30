using AIProfilerAPI.Models;

namespace AIProfilerAPI.Repositories{
    public interface IReportRepository{
        Task<List<Report>>getReportbyid(int id);
        Task<Report> addReport(Report report);
    }
}
using AIProfilerAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AIProfilerAPI.Repositories{

public class ReportRepository :IReportRepository{
     private readonly AppDbContext _context;

        public ReportRepository(AppDbContext context)
        {
            _context = context;
        }
  public async  Task<List<Report>> getReportbyid(int id){

         if(id.Equals(null)){
            throw new Exception("Invalid Id");
         }
          
          var report = await _context.Reports.Where(r => r.userId ==id).ToListAsync();

          if(report.Count == 0){
            return [];
          }
        
        return report;
    }
  public async  Task<Report> addReport(Report report){
        await _context.Reports.AddAsync(report);
        await _context.SaveChangesAsync();
        return report; 
    }
}
}
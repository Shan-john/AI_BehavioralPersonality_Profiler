using AIProfilerAPI.Models;
using AIProfilerAPI.Repositories;
using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace AIProfilerAPI.Controllers
{
    [ApiController]
    [Route("api/report")]
    public class ReportController : ControllerBase
    {
        private readonly IReportRepository _reportRepository;

        public ReportController(IReportRepository reportRepository)
        {
            _reportRepository = reportRepository;
        }

        [HttpGet("{userId}")]
        public async Task<IActionResult> GetReports(int userId)
        {
            var reports = await _reportRepository.GetReportById(userId);
            return Ok(reports);
        }

        
    }
}

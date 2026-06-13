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

        // Get report by report ID
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReportById(int id)
        {
            var report = await _reportRepository.GetReportById(id);
            return Ok(report);
        }

        // Get report by userId
        [HttpGet("user/{userId}")]
        public async Task<IActionResult> GetReportByUserId(int userId)
        {
            var report = await _reportRepository.GetReportByUserId(userId);

            if (report == null)
            {
                return Ok(new { hasReport = false, data = (string?)null });
            }

            return Ok(new
            {
                hasReport = true,
                reportId = report.Id,
                userId = report.UserId,
                data = report.Data
            });
        }
    }
}

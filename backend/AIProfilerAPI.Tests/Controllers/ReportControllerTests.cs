using AIProfilerAPI.Controllers;
using AIProfilerAPI.Models;
using AIProfilerAPI.Repositories;
using Microsoft.AspNetCore.Mvc;
using Moq;
using Xunit;

namespace AIProfilerAPI.Tests.Controllers
{
    public class ReportControllerTests
    {
        private readonly Mock<IReportRepository> _mockReportRepo;
        private readonly ReportController _controller;

        public ReportControllerTests()
        {
            _mockReportRepo = new Mock<IReportRepository>();
            _controller = new ReportController(_mockReportRepo.Object);
        }

        // ────────────────────────────────────────────
        // GET REPORT BY ID
        // ────────────────────────────────────────────

        [Fact]
        public async Task GetReportById_ReturnsOkWithReport()
        {
            // Arrange
            var report = new Report { Id = 1, UserId = 10, Data = "Sample personality report data" };

            _mockReportRepo
                .Setup(r => r.GetReportById(1))
                .ReturnsAsync(report);

            // Act
            var result = await _controller.GetReportById(1);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var returned = Assert.IsType<Report>(okResult.Value);
            Assert.Equal(1, returned.Id);
            Assert.Equal("Sample personality report data", returned.Data);
        }

        // ────────────────────────────────────────────
        // GET REPORT BY USER ID
        // ────────────────────────────────────────────

        [Fact]
        public async Task GetReportByUserId_ReportExists_ReturnsHasReportTrue()
        {
            // Arrange
            var report = new Report { Id = 5, UserId = 42, Data = "Personality analysis results" };

            _mockReportRepo
                .Setup(r => r.GetReportByUserId(42))
                .ReturnsAsync(report);

            // Act
            var result = await _controller.GetReportByUserId(42);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value!;

            Assert.Equal(true, (bool?)value.GetType().GetProperty("hasReport")?.GetValue(value));
            Assert.Equal(5, (int?)value.GetType().GetProperty("reportId")?.GetValue(value));
            Assert.Equal(42, (int?)value.GetType().GetProperty("userId")?.GetValue(value));
            Assert.Equal("Personality analysis results", value.GetType().GetProperty("data")?.GetValue(value)?.ToString());
        }

        [Fact]
        public async Task GetReportByUserId_NoReport_ReturnsHasReportFalse()
        {
            // Arrange
            _mockReportRepo
                .Setup(r => r.GetReportByUserId(999))
                .ReturnsAsync((Report?)null);

            // Act
            var result = await _controller.GetReportByUserId(999);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value!;

            Assert.Equal(false, (bool?)value.GetType().GetProperty("hasReport")?.GetValue(value));
            Assert.Null(value.GetType().GetProperty("data")?.GetValue(value));
        }
    }
}

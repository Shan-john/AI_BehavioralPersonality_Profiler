using AIProfilerAPI.Controllers;
using AIProfilerAPI.Models;
using AIProfilerAPI.Repositories;
using AIProfilerAPI.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using Moq.Protected;
using System.Net;
using System.Text;
using System.Text.Json;
using static AIProfilerAPI.Controllers.AIController;

namespace AIProfilerAPI.Tests.Controllers
{
    public class AIControllerTests : IDisposable
    {
        private readonly Mock<IReportRepository> _mockReportRepo;
        private readonly AIController _controller;
        private readonly OpenRouterService _aiService;

        public AIControllerTests()
        {
            _mockReportRepo = new Mock<IReportRepository>();

            // Create a mock HttpMessageHandler that returns a valid AI question response
            var mockHandler = new Mock<HttpMessageHandler>();
            mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(
                        JsonSerializer.Serialize(new
                        {
                            choices = new[]
                            {
                                new
                                {
                                    message = new { content = "What would you do if a colleague took credit for your work?" }
                                }
                            }
                        }),
                        Encoding.UTF8,
                        "application/json")
                });

            var httpClient = new HttpClient(mockHandler.Object);

            // Create a minimal IConfiguration with dummy keys
            var config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "OpenRouter:ApiKey", "test-key-123" }
                })
                .Build();

            _aiService = new OpenRouterService(httpClient, config);
            _controller = new AIController(_aiService, _mockReportRepo.Object);
        }

        public void Dispose()
        {
            // Clear static session dictionaries between tests to avoid cross-test contamination
            var sessionsField = typeof(AIController).GetField("sessions",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);
            var questionCountField = typeof(AIController).GetField("questionCount",
                System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Static);

            if (sessionsField?.GetValue(null) is Dictionary<string, List<string>> sessions)
                sessions.Clear();

            if (questionCountField?.GetValue(null) is Dictionary<string, int> questionCount)
                questionCount.Clear();
        }

        // ────────────────────────────────────────────
        // CHAT — FIRST REQUEST (generates question)
        // ────────────────────────────────────────────

        [Fact]
        public async Task Chat_FirstRequest_ReturnsQuestion()
        {
            // Arrange
            var request = new ChatRequest { QuestionCount = 0, Answer = null, UserId = 100 };

            // Act
            var result = await _controller.Chat(request, userId: 100);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value!;

            Assert.Equal("question", value.GetType().GetProperty("type")?.GetValue(value)?.ToString());
            Assert.NotNull(value.GetType().GetProperty("data")?.GetValue(value));
            Assert.Equal(1, (int?)value.GetType().GetProperty("questionNumber")?.GetValue(value));
        }

        // ────────────────────────────────────────────
        // CHAT — SUBSEQUENT REQUEST (with answer, generates next question)
        // ────────────────────────────────────────────

        [Fact]
        public async Task Chat_WithAnswer_ReturnsNextQuestion()
        {
            // Arrange — first send initial request to establish session
            var firstRequest = new ChatRequest { QuestionCount = 0, Answer = null, UserId = 200 };
            await _controller.Chat(firstRequest, userId: 200);

            // Now send answer
            var secondRequest = new ChatRequest { QuestionCount = 1, Answer = "I would talk to them directly.", UserId = 200 };

            // Act
            var result = await _controller.Chat(secondRequest, userId: 200);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value!;

            Assert.Equal("question", value.GetType().GetProperty("type")?.GetValue(value)?.ToString());
            Assert.Equal(2, (int?)value.GetType().GetProperty("questionNumber")?.GetValue(value));
        }

        // ────────────────────────────────────────────
        // CHAT — MAX QUESTIONS REACHED (triggers analysis)
        // ────────────────────────────────────────────

        [Fact]
        public async Task Chat_MaxQuestionsReached_ReturnsResultAndSavesReport()
        {
            // Arrange — build up a session with answers
            int userId = 300;
            for (int i = 0; i < 15; i++)
            {
                var req = new ChatRequest
                {
                    QuestionCount = i,
                    Answer = i > 0 ? $"Answer to question {i}" : null,
                    UserId = userId
                };
                await _controller.Chat(req, userId: userId);
            }

            // The mock handler returns a personality analysis response too
            _mockReportRepo
                .Setup(r => r.AddReport(It.IsAny<Report>()))
                .ReturnsAsync(new Report { Id = 1, UserId = userId, Data = "analysis" });

            // Act — send the 15th answer which triggers analysis
            var finalRequest = new ChatRequest
            {
                QuestionCount = 15,
                Answer = "Final answer",
                UserId = userId
            };
            var result = await _controller.Chat(finalRequest, userId: userId);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            var value = okResult.Value!;

            Assert.Equal("result", value.GetType().GetProperty("type")?.GetValue(value)?.ToString());
            Assert.NotNull(value.GetType().GetProperty("data")?.GetValue(value));

            // Verify report was saved
            _mockReportRepo.Verify(r => r.AddReport(It.Is<Report>(
                rpt => rpt.UserId == userId)), Times.Once);
        }
    }
}

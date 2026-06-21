using AIProfilerAPI.Services;
using Microsoft.Extensions.Configuration;
using Moq;
using Xunit;
using Moq.Protected;
using System.Net;
using System.Text;
using System.Text.Json;

namespace AIProfilerAPI.Tests.Services
{
    public class OpenRouterServiceTests
    {
        private readonly IConfiguration _config;

        public OpenRouterServiceTests()
        {
            _config = new ConfigurationBuilder()
                .AddInMemoryCollection(new Dictionary<string, string?>
                {
                    { "OpenRouter:ApiKey", "test-api-key" }
                })
                .Build();
        }

        private OpenRouterService CreateServiceWithMockHandler(HttpResponseMessage response)
        {
            var mockHandler = new Mock<HttpMessageHandler>();
            mockHandler.Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>())
                .ReturnsAsync(response);

            var httpClient = new HttpClient(mockHandler.Object);
            return new OpenRouterService(httpClient, _config);
        }

        private static HttpResponseMessage CreateSuccessResponse(string contentText)
        {
            return new HttpResponseMessage
            {
                StatusCode = HttpStatusCode.OK,
                Content = new StringContent(
                    JsonSerializer.Serialize(new
                    {
                        choices = new[]
                        {
                            new { message = new { content = contentText } }
                        }
                    }),
                    Encoding.UTF8,
                    "application/json")
            };
        }

        private static HttpResponseMessage CreateErrorResponse(HttpStatusCode statusCode, string errorBody)
        {
            return new HttpResponseMessage
            {
                StatusCode = statusCode,
                Content = new StringContent(errorBody, Encoding.UTF8, "application/json")
            };
        }

        // ────────────────────────────────────────────
        // GENERATE SCENARIO QUESTION
        // ────────────────────────────────────────────

        [Fact]
        public async Task GenerateScenarioQuestion_Success_ReturnsQuestionText()
        {
            // Arrange
            var expectedQuestion = "You discover a wallet with $500 on the street. What do you do?";
            var service = CreateServiceWithMockHandler(CreateSuccessResponse(expectedQuestion));

            // Act
            var result = await service.GenerateScenarioQuestion();

            // Assert
            Assert.Equal(expectedQuestion, result);
        }

        [Fact]
        public async Task GenerateScenarioQuestion_ApiError_ReturnsErrorMessage()
        {
            // Arrange
            var service = CreateServiceWithMockHandler(
                CreateErrorResponse(HttpStatusCode.InternalServerError, "{ \"error\": \"Internal Server Error\" }"));

            // Act
            var result = await service.GenerateScenarioQuestion();

            // Assert
            Assert.Equal("Error: AI service is currently unavailable.", result);
        }

        [Fact]
        public async Task GenerateScenarioQuestion_WithPreviousQuestions_SendsRequest()
        {
            // Arrange
            var expectedQuestion = "How do you handle unexpected changes at work?";
            var service = CreateServiceWithMockHandler(CreateSuccessResponse(expectedQuestion));

            var previousQuestions = new List<string>
            {
                "Tell me about a time you disagreed with your manager.",
                "How do you prioritize tasks when everything is urgent?"
            };

            // Act
            var result = await service.GenerateScenarioQuestion(previousQuestions);

            // Assert
            Assert.Equal(expectedQuestion, result);
        }

        // ────────────────────────────────────────────
        // ANALYZE PERSONALITY
        // ────────────────────────────────────────────

        [Fact]
        public async Task AnalyzePersonality_Success_ReturnsAnalysisText()
        {
            // Arrange
            var analysisResult = @"CORE TRAITS:
- Empathetic and values fairness in all interactions.
- Methodical thinker who weighs options carefully.

BEHAVIORAL PATTERNS:
- Prefers collaborative approaches over solo decisions.
- Takes time to reflect before responding to conflict.

STRENGTHS & BLIND SPOTS:
- Strength: Strong emotional intelligence.
- Blind spot: May overthink simple decisions.

SCORES_START
Empathy & Collaboration: 85
Resilience & Adaptability: 72
Analytical Depth: 78
Creativity & Innovation: 65
Leadership & Influence: 70
Decision Speed: 55
Stress Tolerance: 68
Focus Depth: 74
Risk Appetite: 45
SCORES_END";

            var service = CreateServiceWithMockHandler(CreateSuccessResponse(analysisResult));

            var responses = new List<string>
            {
                "Q: How do you handle conflict at work?",
                "A: I try to understand both sides first.",
                "Q: What motivates you most?",
                "A: Making a meaningful impact on people's lives."
            };

            // Act
            var result = await service.AnalyzePersonality(responses);

            // Assert
            Assert.Contains("CORE TRAITS:", result);
            Assert.Contains("SCORES_START", result);
            Assert.Contains("Empathy & Collaboration: 85", result);
        }

        [Fact]
        public async Task AnalyzePersonality_ApiError_ReturnsErrorMessage()
        {
            // Arrange
            var service = CreateServiceWithMockHandler(
                CreateErrorResponse(HttpStatusCode.TooManyRequests, "{ \"error\": \"Rate limited\" }"));

            var responses = new List<string> { "A: Some answer" };

            // Act
            var result = await service.AnalyzePersonality(responses);

            // Assert
            Assert.Equal("Analysis Error: AI service is currently unavailable.", result);
        }
    }
}

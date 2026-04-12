using Microsoft.AspNetCore.Mvc;
using AIProfilerAPI.Services;
using AIProfilerAPI.Repositories;
using AIProfilerAPI.Models;

namespace AIProfilerAPI.Controllers
{
    [ApiController]
    [Route("api/ai")]
    public class AIController : ControllerBase
    {
        private readonly OpenRouterService _aiService;
          private readonly IReportRepository _reportRepository;
          private readonly IUserRepository _userRepository;
         int count = 0;
        // session storage
        private static Dictionary<string, List<string>> sessions = new();
        private static Dictionary<string, int> questionCount = new();

        private const int MAX_QUESTIONS = 15;

        public AIController(OpenRouterService aiService, IReportRepository reportRepository, IUserRepository userRepository)
        {
            _aiService = aiService;
            _reportRepository = reportRepository;
            _userRepository = userRepository;
        }

        // 🚀 MAIN CHAT FLOW
        [HttpPost("chat")]
       
public async Task<IActionResult> Chat([FromBody] ChatRequest request, [FromQuery] int userId)
{
    
    // Initialize session list for this user
    if (!sessions.ContainsKey(userId.ToString()))
        sessions[userId.ToString()] = new List<string>();

    // Save answer if provided
    if (!string.IsNullOrEmpty(request.Answer))
    {
        sessions[userId.ToString()].Add(request.Answer);
    }

    // If client sends QuestionCount = 15 → analyze
    if (request.QuestionCount >= MAX_QUESTIONS)
    {
        var responses = sessions[userId.ToString()];

        // Analyze answers
        var result = await _aiService.AnalyzePersonality(responses);
        // Save report
        Report report = new Report
        {
            Data = result,
            UserId = userId
        };
        await _reportRepository.AddReport(report);

        User? user = await _userRepository.GetUserByIdAsync(userId);
        if (user != null)
        {
            user.Report = result;
            await _userRepository.UpdateUserAsync(user);
        }

        // Clear user session after completion
        sessions.Remove(userId.ToString());

        return Ok(new
        {
            type = "result",
            data = result
        });
    }

    // Otherwise → generate next question
    var question = await _aiService.GenerateScenarioQuestion();

    return Ok(new
    {
        type = "question",
        data = question,
        questionNumber = request.QuestionCount + 1 // next question number
    });
}
    // 📦 DTO
    public class ChatRequest
    {
        public int QuestionCount { get; set; }
        public string? Answer { get; set; } // null for first request
        public int UserId { get; set; }
    }
    }
} 
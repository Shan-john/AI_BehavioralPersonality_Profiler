using System.Text;
using System.Text.Json;

namespace AIProfilerAPI.Services
{
    public class OpenRouterService
    {
        private readonly HttpClient _httpClient;
        private readonly string _model = "google/gemini-2.0-flash-001";
        private readonly string? _apiKey;

        public OpenRouterService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["OpenRouter:ApiKey"];
        }

        // 🔹 Generate a new, intelligent, non-repetitive scenario question
        public async Task<string> GenerateScenarioQuestion(List<string>? previousQuestions = null)
        {
            var previous = previousQuestions != null && previousQuestions.Count > 0
                ? string.Join("\n- ", previousQuestions)
                : "None";

            var prompt = $@"
You are a creative AI interviewer. Your goal is to ask ONE short, engaging real-life scenario question to understand someone's behavior.

Rules:
- Do NOT repeat previous questions.
- Previous questions asked: 
- {previous}
- Avoid yes/no questions; make it descriptive.
- Make it imaginative, concise, and natural.
- OUTPUT ONLY THE QUESTION. Do not include any instructions, explanations, or extra text.
- Keep it to one line.

Now generate the question:
";

            try 
            {
                var result = await CallOpenRouter(prompt);
                if (result.StartsWith("OpenRouter API Error")) return "Error: AI service is currently unavailable.";
                return result;
            }
            catch { return "Error: AI service is currently unavailable."; }
        }

        // 🔹 Analyze personality from list of answers
        public async Task<string> AnalyzePersonality(List<string> responses)
        {
            var combined = string.Join("\n", responses);

            var prompt = $@"
You are a highly skilled psychological profiler and story teller. 

Based on the responses below, create a captivating, insightful, and professional personality profile.
Instead of a boring list, present your findings as a narrative character study.

Structure your analysis into these areas:
1. The Core Essence (Who they are at heart)
2. Behavioral Masterclass (How they navigate the world)
3. The Power & The Pivot (Distinctive strengths and potential blind spots)

Rules:
- DO NOT use any markdown bolding (avoid double asterisks like **).
- Use a professional yet deeply engaging and human tone.
- Be specific and clever in your insights.
- Keep the overall length concise but power-packed.

Responses:
{combined}
";

            try 
            {
                var result = await CallOpenRouter(prompt);
                if (result.StartsWith("OpenRouter API Error")) return "Analysis Error: AI service is currently unavailable.";
                return result;
            }
            catch { return "Analysis Error: AI service is currently unavailable."; }
        }

        // ⚙️ OpenRouter API Call
        private async Task<string> CallOpenRouter(string prompt)
        {
            var requestBody = new
            {
                model = _model,
                messages = new[]
                {
                    new
                    {
                        role = "user",
                        content = prompt
                    }
                }
            };

            var json = JsonSerializer.Serialize(requestBody);

            using var requestMessage = new HttpRequestMessage(HttpMethod.Post, "https://openrouter.ai/api/v1/chat/completions");
            requestMessage.Headers.Add("Authorization", $"Bearer {_apiKey}");
            requestMessage.Headers.Add("HTTP-Referer", "http://localhost:4200"); // Optional
            requestMessage.Headers.Add("X-Title", "AIProfiler"); // Optional
            requestMessage.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(requestMessage);

            var result = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                Console.WriteLine($"OpenRouter API Error: Status={response.StatusCode}, Body={result}");
                return $"OpenRouter API Error: {result}";
            }

            using var doc = JsonDocument.Parse(result);

            if (doc.RootElement.TryGetProperty("choices", out var choices) &&
                choices.GetArrayLength() > 0)
            {
                var message = choices[0].GetProperty("message");
                if (message.TryGetProperty("content", out var content))
                {
                    var text = content.GetString();
                    return text?.Trim() ?? "No response.";
                }
            }

            return "No valid response from OpenRouter.";
        }
    }
}

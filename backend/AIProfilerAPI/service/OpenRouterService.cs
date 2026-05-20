using System.Text;
using System.Text.Json;

namespace AIProfilerAPI.Services
{
    public class OpenRouterService
    {
        private readonly HttpClient _httpClient;
        private readonly string _model = "google/gemini-2.5-flash";
        private readonly string? _apiKey;
        private readonly string? _fallbackApiKey;

        public OpenRouterService(HttpClient httpClient, IConfiguration config)
        {
            _httpClient = httpClient;
            _apiKey = config["OpenRouter:ApiKey"];
            _fallbackApiKey = config["OpenRouter:account1extrallamaapikey"];
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

After your narrative, you MUST include a structured scoring section in EXACTLY this format (scores must be realistic integers from 0 to 100 based on your analysis):

SCORES_START
Empathy & Collaboration: [score]
Resilience & Adaptability: [score]
Analytical Depth: [score]
Creativity & Innovation: [score]
Leadership & Influence: [score]
Decision Speed: [score]
Stress Tolerance: [score]
Focus Depth: [score]
Risk Appetite: [score]
SCORES_END

Rules:
- DO NOT use any markdown bolding (avoid double asterisks like **).
- Use a professional yet deeply engaging and human tone.
- Be specific and clever in your insights.
- Keep the overall length concise but power-packed.
- The scores MUST genuinely reflect the personality you analyzed. Do not give all high or all low scores.

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

        // ⚙️ OpenRouter API Call with automatic fallback on rate-limit
        private async Task<string> CallOpenRouter(string prompt)
        {
            // Try primary key first, then fallback key on 429
            var keysToTry = new List<string?> { _apiKey, _fallbackApiKey }
                .Where(k => !string.IsNullOrEmpty(k))
                .ToList();

            foreach (var apiKey in keysToTry)
            {
                var result = await TryCallWithKey(prompt, apiKey!);
                if (result.success)
                    return result.content;

                // If rate-limited (429), try next key
                if (result.isRateLimited && apiKey != keysToTry.Last())
                {
                    Console.WriteLine("Rate limited, retrying with fallback key...");
                    await Task.Delay(2000); // Brief wait before retry
                    continue;
                }

                return result.content; // Return error for non-429 failures
            }

            return "OpenRouter API Error: All API keys exhausted or rate-limited.";
        }

        private async Task<(bool success, bool isRateLimited, string content)> TryCallWithKey(string prompt, string apiKey)
        {
            var requestBody = new
            {
                model = _model,
                max_tokens = 2000,
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
            requestMessage.Headers.Add("Authorization", $"Bearer {apiKey}");
            requestMessage.Headers.Add("HTTP-Referer", "http://localhost:4200");
            requestMessage.Headers.Add("X-Title", "AIProfiler");
            requestMessage.Content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.SendAsync(requestMessage);
            var result = await response.Content.ReadAsStringAsync();

            if (!response.IsSuccessStatusCode)
            {
                bool isRateLimited = (int)response.StatusCode == 429;
                Console.WriteLine($"OpenRouter API Error: Status={response.StatusCode}, Body={result}");
                return (false, isRateLimited, $"OpenRouter API Error: {result}");
            }

            using var doc = JsonDocument.Parse(result);

            if (doc.RootElement.TryGetProperty("choices", out var choices) &&
                choices.GetArrayLength() > 0)
            {
                var message = choices[0].GetProperty("message");
                if (message.TryGetProperty("content", out var content))
                {
                    var text = content.GetString();
                    return (true, false, text?.Trim() ?? "No response.");
                }
            }

            return (false, false, "No valid response from OpenRouter.");
        }
    }
}



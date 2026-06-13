using System.Text;
using System.Text.Json;
using AIProfilerAPI.Constants;

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

            var prompt = PromptTemplates.GetScenarioQuestionPrompt(previous);
 
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

            var prompt = PromptTemplates.GetPersonalityAnalysisPrompt(combined);

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



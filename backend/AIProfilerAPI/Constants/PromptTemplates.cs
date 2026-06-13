namespace AIProfilerAPI.Constants
{
    public static class PromptTemplates
    {
        public static string GetScenarioQuestionPrompt(string previousQuestions)
        {
            return $@"
You are a creative AI interviewer. Your goal is to ask ONE short, engaging real-life scenario question to understand someone's behavior.

Rules:
- Do NOT repeat previous questions.
- Previous questions asked: 
- {previousQuestions}
- Avoid yes/no questions; make it descriptive.
- Make it imaginative, concise, and natural.
- OUTPUT ONLY THE QUESTION. Do not include any instructions, explanations, or extra text.
- Keep it to one line.

Now generate the question:
";
        }

        public static string GetPersonalityAnalysisPrompt(string combinedResponses)
        {
            return $@"
You are a professional behavioral profiler.

Analyze these responses and produce a SHORT, concise personality profile using bullet points.

Format your output EXACTLY like this:

CORE TRAITS:
- (2-3 bullet points about who they are at their core)

BEHAVIORAL PATTERNS:
- (2-3 bullet points about how they act and decide)

STRENGTHS & BLIND SPOTS:
- (1-2 strengths, 1-2 blind spots as bullet points)

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
- Each bullet point must be ONE concise sentence (max 15 words).
- Scores are integers 0-100 based on actual analysis. Vary them realistically.
- NO markdown bolding (no **). NO lengthy paragraphs.
- Total output must be under 300 words (excluding scores).

Responses:
{combinedResponses}
";
        }
    }
}

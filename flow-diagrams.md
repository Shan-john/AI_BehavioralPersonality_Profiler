# Flow Diagrams - AI Behavioral Personality Profiler

## 1. User Profiling Sequence
This diagram illustrates the process of a user answering scenario-based questions to generate a personality profile.

```mermaid
sequenceDiagram
    participant U as User (Angular)
    participant B as Backend (.NET Core)
    participant AI as AI Engine (OpenRouter)
    participant DB as Database (SQL Server)

    U->>B: POST /api/ai/chat (First Request)
    B->>AI: Generate Scenario Question
    AI-->>B: Question String
    B-->>U: { type: "question", data: "..." }

    loop 15 Questions
        U->>B: POST /api/ai/chat (Answer + userId)
        B->>DB: Check Session State
        B->>AI: Generate Next Scenario
        AI-->>B: Question String
        B-->>U: { type: "question", data: "..." }
    end

    U->>B: POST /api/ai/chat (15th Answer)
    B->>AI: Analyze all 15 responses
    AI-->>B: Final Personality Profile (Markdown)
    B->>DB: Save Report to database
    B->>DB: Update User.Report field
    B-->>U: { type: "result", data: "Markdown Profile" }
```

## 2. Authentication Flow
```mermaid
graph TD
    A[Start] --> B{User Logged In?}
    B -- No --> C[Show Login/Register Page]
    B -- Yes --> D[Show Dashboard]
    
    C --> E[User enters credentials]
    E --> F[API: POST /api/user/login]
    F --> G{Valid?}
    G -- No --> H[Show Error]
    G -- Yes --> I[Store User ID in Session]
    I --> D
```

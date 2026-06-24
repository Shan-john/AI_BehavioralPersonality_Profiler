# Data Flow & Sequence Diagrams — AI Behavioral Personality Profiler

This document contains Mermaid diagrams for every major user flow and inter-service communication pattern in the system.

---

## Table of Contents

- [1. Personality Test Flow (End-to-End)](#1-personality-test-flow-end-to-end)
- [2. User Registration Flow](#2-user-registration-flow)
- [3. User Login Flow](#3-user-login-flow)
- [4. Report Retrieval Flow](#4-report-retrieval-flow)
- [5. Admin Dashboard Flow](#5-admin-dashboard-flow)
- [6. AI Service Call (OpenRouter)](#6-ai-service-call-openrouter)
- [7. Full Application Navigation](#7-full-application-navigation)
- [8. Data Layer Flow](#8-data-layer-flow)

---

## 1. Personality Test Flow (End-to-End)

The core feature: a 15-question conversational loop that generates a personality profile.

```mermaid
sequenceDiagram
    actor User
    participant FE as Angular Frontend<br/>(TestPage)
    participant CS as ChatService
    participant API as .NET API<br/>(AIController)
    participant MEM as In-Memory Sessions<br/>(Static Dictionary)
    participant AI as OpenRouterService
    participant OR as OpenRouter API<br/>(Gemini 2.5 Flash)
    participant REPO as ReportRepository
    participant DB as MySQL Database

    Note over User,FE: User navigates to /home/testpage
    FE->>FE: Check localStorage("loginStatus")<br/>Redirect to /signup if not logged in

    FE->>User: Display welcome messages<br/>(3 sequential messages with delays)
    User->>FE: Types "ready" or "yes"

    Note over FE,DB: Question Loop (15 iterations)

    loop Questions 1 through 14
        FE->>CS: sendMessage(userId, {answer, questionCount})
        CS->>API: POST /api/ai/chat?userId={id}<br/>{questionCount, answer, userId}
        API->>MEM: Initialize session list if new user
        API->>MEM: Store answer as "A: {answer}"
        API->>AI: GenerateScenarioQuestion()
        AI->>OR: POST chat/completions<br/>{model, prompt with previous questions}
        OR-->>AI: Question text
        AI-->>API: Question string
        API->>MEM: Store question as "Q: {question}"
        API-->>CS: {type: "question", data: "...", questionNumber: N}
        CS-->>FE: Response
        FE->>FE: Update progress bar<br/>(questionNumber / 15 * 100)%
        FE->>User: Display AI question
        User->>FE: Types answer
    end

    Note over FE,DB: Final Question (15th answer)

    FE->>CS: sendMessage(userId, {answer, questionCount: 15})
    CS->>API: POST /api/ai/chat?userId={id}<br/>{questionCount: 15, answer, userId}
    API->>MEM: Store 15th answer
    API->>MEM: Retrieve all 15 Q&A pairs
    API->>AI: AnalyzePersonality(responses)
    AI->>OR: POST chat/completions<br/>{model, analysis prompt with all responses}
    OR-->>AI: Personality profile (Markdown)
    AI-->>API: Analysis result

    API->>REPO: AddReport({data, userId})
    REPO->>DB: Check if report exists for user
    alt Report exists
        REPO->>DB: UPDATE Reports SET Data = ...
    else No existing report
        REPO->>DB: INSERT INTO Reports (Data, UserId)
    end
    DB-->>REPO: Saved
    REPO-->>API: Report entity

    API->>MEM: Clear session for userId
    API-->>CS: {type: "result", data: "Markdown Profile"}
    CS-->>FE: Response
    FE->>FE: Set progress = 100%
    FE->>User: Display final analysis
    FE->>FE: setTimeout(3s) → navigate to /home/settings
```

---

## 2. User Registration Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Angular Frontend<br/>(SignUp)
    participant API as .NET API<br/>(UserController)
    participant REPO as UserRepository
    participant DB as MySQL Database

    User->>FE: Fills registration form<br/>(name, email, password)
    FE->>API: POST /api/user/register<br/>{name, email, password}

    API->>API: Validate: email & password required

    alt Validation fails
        API-->>FE: 400 Bad Request<br/>"Email and Password are required"
        FE->>User: Show error message
    else Validation passes
        API->>REPO: GetUserByEmailAsync(email)
        REPO->>DB: SELECT * FROM Users WHERE Email = ?
        DB-->>REPO: Result

        alt Email already exists
            REPO-->>API: Existing user found
            API-->>FE: 400 Bad Request<br/>"User with this email already exists"
            FE->>User: Show duplicate email error
        else New email
            REPO-->>API: null
            API->>REPO: CreateUserAsync(user)
            REPO->>DB: INSERT INTO Users (Name, Email, Password, Role)
            DB-->>REPO: New user with ID
            REPO-->>API: User entity
            API-->>FE: 200 OK<br/>{message, userId, role}
            FE->>FE: Store userId & loginStatus in localStorage
            FE->>User: Redirect to /home
        end
    end
```

---

## 3. User Login Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Angular Frontend<br/>(SignUp)
    participant API as .NET API<br/>(UserController)
    participant REPO as UserRepository
    participant DB as MySQL Database

    User->>FE: Enters email & password
    FE->>API: POST /api/user/login<br/>{email, password}

    API->>API: Validate: email & password required

    alt Validation fails
        API-->>FE: 400 Bad Request
    else Validation passes
        API->>REPO: GetUserByEmailAsync(email)
        REPO->>DB: SELECT * FROM Users WHERE Email = ?
        DB-->>REPO: Result

        alt User not found OR password mismatch
            API-->>FE: 401 Unauthorized<br/>"Invalid email or password"
            FE->>User: Show error
        else Credentials valid
            API-->>FE: 200 OK<br/>{message, userId, email, name, role}
            FE->>FE: localStorage.setItem("loginStatus", "true")
            FE->>FE: localStorage.setItem("id", userId)

            alt role === "Admin"
                FE->>FE: localStorage.setItem("isAdminLoggedIn", "true")
            end

            FE->>User: Redirect to /home
        end
    end
```

---

## 4. Report Retrieval Flow

```mermaid
sequenceDiagram
    actor User
    participant FE as Angular Frontend<br/>(Settings)
    participant SS as SettingsService
    participant API as .NET API
    participant REPO as ReportRepository
    participant DB as MySQL Database

    Note over User,FE: User navigates to /home/settings
    FE->>FE: Read userId from localStorage

    par Fetch Profile and Report
        FE->>SS: getUserProfile(userId)
        SS->>API: GET /api/user/profile/{userId}
        API->>REPO: GetUserByIdAsync(userId)
        REPO->>DB: SELECT * FROM Users WHERE Id = ?
        DB-->>REPO: User
        REPO-->>API: User entity
        API-->>SS: {userId, email, name}
        SS-->>FE: Profile data
    and
        FE->>SS: getReportByUserId(userId)
        SS->>API: GET /api/report/user/{userId}
        API->>REPO: GetReportByUserId(userId)
        REPO->>DB: SELECT * FROM Reports WHERE UserId = ?
        DB-->>REPO: Report or null

        alt Report exists
            API-->>SS: {hasReport: true, reportId, userId, data}
        else No report
            API-->>SS: {hasReport: false, data: null}
        end

        SS-->>FE: Report data
    end

    alt hasReport = true
        FE->>FE: Parse Markdown report
        FE->>FE: Extract SCORES_START...SCORES_END block
        FE->>FE: Render personality scores chart
        FE->>FE: Display trait analysis sections
        FE->>User: Show complete personality profile
    else hasReport = false
        FE->>User: Show "No report available" message
    end
```

---

## 5. Admin Dashboard Flow

```mermaid
sequenceDiagram
    actor Admin
    participant FE as Angular Frontend
    participant Guard as adminGuard
    participant AS as adminloginService
    participant API as .NET API<br/>(UserController)
    participant DB as MySQL Database

    Admin->>FE: Navigate to /admin/adminlogin
    FE->>Admin: Show admin login form
    Admin->>FE: Enter admin credentials

    FE->>API: POST /api/user/login<br/>{email, password}
    API-->>FE: {userId, role: "Admin", ...}

    FE->>FE: localStorage.setItem("isAdminLoggedIn", "true")
    FE->>FE: Navigate to /admin/admin-homepage

    FE->>Guard: canActivate?
    Guard->>AS: isLoggedIn()
    AS->>AS: Check localStorage("isAdminLoggedIn")
    AS-->>Guard: true

    Guard-->>FE: Allow navigation

    FE->>API: GET /api/user/all
    API->>DB: SELECT * FROM Users
    DB-->>API: All users
    API-->>FE: User list

    FE->>Admin: Display all users table

    Admin->>FE: Click "View Report" for a user
    FE->>FE: Navigate to /admin/report/{id}/{email}

    FE->>Guard: canActivate?
    Guard-->>FE: true

    FE->>API: GET /api/report/user/{userId}
    API-->>FE: Report data
    FE->>Admin: Display user's personality report
```

---

## 6. AI Service Call (OpenRouter)

Detail of the `OpenRouterService` internal logic including API key fallback:

```mermaid
sequenceDiagram
    participant Caller as AIController
    participant SVC as OpenRouterService
    participant OR as OpenRouter API

    Caller->>SVC: GenerateScenarioQuestion() or<br/>AnalyzePersonality(responses)

    SVC->>SVC: Build prompt from PromptTemplates

    Note over SVC,OR: Try Primary API Key

    SVC->>OR: POST /api/v1/chat/completions<br/>Authorization: Bearer {primaryKey}<br/>{model: "google/gemini-2.5-flash", max_tokens: 2000}

    alt Success (200 OK)
        OR-->>SVC: {choices: [{message: {content: "..."}}]}
        SVC->>SVC: Extract choices[0].message.content
        SVC-->>Caller: Result text
    else Rate Limited (429)
        OR-->>SVC: 429 Too Many Requests
        SVC->>SVC: Wait 2000ms
        Note over SVC,OR: Try Fallback API Key
        SVC->>OR: POST /api/v1/chat/completions<br/>Authorization: Bearer {fallbackKey}

        alt Success
            OR-->>SVC: {choices: [{message: {content: "..."}}]}
            SVC-->>Caller: Result text
        else Also rate limited or error
            OR-->>SVC: Error
            SVC-->>Caller: "OpenRouter API Error: All API keys exhausted"
        end
    else Other Error
        OR-->>SVC: Error response
        SVC-->>Caller: "Error: AI service is currently unavailable."
    end
```

---

## 7. Full Application Navigation

Overview of all possible user navigation paths:

```mermaid
graph TD
    SPLASH["/ (Splash Page)"]
    SIGNUP["/signup (Login / Register)"]
    HOME["/home (Dashboard)"]
    TEST["/home/testpage (AI Chat Test)"]
    SETTINGS["/home/settings (Profile & Report)"]
    ADMIN_LOGIN["/admin/adminlogin"]
    ADMIN_HOME["/admin/admin-homepage"]
    ADMIN_REPORT["/admin/report/:id/:email"]

    SPLASH --> SIGNUP
    SPLASH --> HOME

    SIGNUP -- "Successful login/register" --> HOME

    HOME -- "Start Test" --> TEST
    HOME -- "Settings" --> SETTINGS
    HOME -- "Logout" --> SIGNUP

    TEST -- "Not logged in" --> SIGNUP
    TEST -- "Test complete (auto)" --> SETTINGS

    ADMIN_LOGIN -- "Admin login success" --> ADMIN_HOME
    ADMIN_HOME -- "View user report" --> ADMIN_REPORT

    style SPLASH fill:#1a1a2e,stroke:#e94560,color:#fff
    style SIGNUP fill:#16213e,stroke:#0f3460,color:#fff
    style HOME fill:#0f3460,stroke:#533483,color:#fff
    style TEST fill:#533483,stroke:#e94560,color:#fff
    style SETTINGS fill:#e94560,stroke:#f38181,color:#fff
    style ADMIN_LOGIN fill:#2c3e50,stroke:#e74c3c,color:#fff
    style ADMIN_HOME fill:#34495e,stroke:#e74c3c,color:#fff
    style ADMIN_REPORT fill:#e74c3c,stroke:#c0392b,color:#fff
```

---

## 8. Data Layer Flow

How data flows through the backend layers:

```mermaid
graph TB
    subgraph "HTTP Layer"
        REQ["Incoming HTTP Request"]
    end

    subgraph "Controller Layer"
        UC["UserController<br/>/api/user/*"]
        AC["AIController<br/>/api/ai/*"]
        RC["ReportController<br/>/api/report/*"]
    end

    subgraph "Service Layer"
        ORS["OpenRouterService<br/>AI Inference"]
        PT["PromptTemplates<br/>System Prompts"]
    end

    subgraph "Session Layer"
        SESS["Static Dictionary<br/>In-Memory Sessions"]
    end

    subgraph "Repository Layer"
        IUR["IUserRepository"]
        IRR["IReportRepository"]
        UR["UserRepository"]
        RR["ReportRepository"]
    end

    subgraph "Data Access"
        CTX["AppDbContext<br/>(EF Core)"]
    end

    subgraph "Storage"
        DB["MySQL<br/>Users + Reports Tables"]
    end

    REQ --> UC
    REQ --> AC
    REQ --> RC

    UC --> IUR
    IUR -.-> UR
    UR --> CTX

    AC --> ORS
    AC --> SESS
    AC --> IRR
    ORS --> PT

    RC --> IRR
    IRR -.-> RR
    RR --> CTX

    CTX --> DB

    style REQ fill:#3498db,stroke:#2980b9,color:#fff
    style ORS fill:#9b59b6,stroke:#8e44ad,color:#fff
    style SESS fill:#e67e22,stroke:#d35400,color:#fff
    style DB fill:#27ae60,stroke:#229954,color:#fff
```

---

## 9. Session State Lifecycle

The in-memory session managed by `AIController`:

```mermaid
stateDiagram-v2
    [*] --> Empty: User starts test
    Empty --> Collecting: First POST /api/ai/chat<br/>(questionCount=0)

    state Collecting {
        [*] --> Q1: Generate question 1
        Q1 --> A1: User answers
        A1 --> Q2: Generate question 2
        Q2 --> A2: User answers
        A2 --> QN: ...
        QN --> AN: User answers Q14
    }

    Collecting --> Analyzing: questionCount >= 15<br/>(15th answer received)
    Analyzing --> Saving: AI returns personality profile
    Saving --> Cleared: Report saved to DB
    Cleared --> [*]: Session removed from Dictionary

    note right of Collecting
        Session stored as:
        Dictionary<userId, List<string>>
        Each entry: "Q: ..." or "A: ..."
    end note

    note right of Cleared
        Session is ephemeral.
        Lost on server restart.
    end note
```

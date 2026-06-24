# 🧠 AI Behavioral Personality Profiler

An AI-powered full-stack web application that conducts interactive, scenario-based behavioral interviews and generates detailed personality profiles using generative AI. Users answer 15 situational questions through a chat interface, and the system produces a structured personality analysis complete with trait breakdowns and numeric scores.

---

## 📋 Table of Contents

- [Project Overview](#-project-overview)
- [Tech Stack Used](#-tech-stack-used)
- [Project Structure](#-project-structure)
- [Setup Instructions](#-setup-instructions)
- [How to Run the API (Backend)](#-how-to-run-the-api-backend)
- [How to Run the UI (Frontend)](#-how-to-run-the-ui-frontend)
- [How to Run Tests](#-how-to-run-tests)
- [Documentation](#-documentation)

---

## 🔍 Project Overview

### What It Does
The AI Behavioral Personality Profiler walks users through a conversational assessment:

1. **User registers/logs in** via the Angular frontend.
2. **Starts a personality test** — the AI generates 15 unique, scenario-based behavioral questions one at a time.
3. **Answers are collected** and maintained in an in-memory session on the backend.
4. **After the 15th answer**, all responses are sent to a Generative AI model (Google Gemini 2.5 Flash via OpenRouter) for analysis.
5. **A personality profile is generated** with Core Traits, Behavioral Patterns, Strengths & Blind Spots, and 9 numeric personality scores (0–100).
6. **The report is saved** to the database and displayed on the user's Settings/Profile page with visual score charts.

### Key Features
- 🤖 **AI-Powered Profiling** — uses Google Gemini 2.5 Flash for question generation and personality analysis
- 💬 **Chat-Based Interface** — conversational UI with real-time progress tracking
- 📊 **Personality Score Dashboard** — visual chart rendering of 9 personality dimensions
- 👤 **User Authentication** — registration, login, and profile management
- 🔐 **Admin Panel** — admin login, user management, and per-user report viewing with route guards
- 📝 **Report Persistence** — personality reports are saved to the database and retrievable at any time

---

## 🛠 Tech Stack Used

### Frontend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **Angular** | 21.x | SPA framework (standalone components) |
| **TypeScript** | 5.9 | Type-safe development |
| **Tailwind CSS** | 4.x | Utility-first responsive styling |
| **Angular Material** | 21.x | Material Design UI components |
| **RxJS** | 7.8 | Reactive programming & HTTP handling |
| **Karma + Jasmine** | 6.x | Unit testing framework |

### Backend
| Technology | Version | Purpose |
| :--- | :--- | :--- |
| **ASP.NET Core** | .NET 9.0 | REST API framework |
| **Entity Framework Core** | 9.0 | ORM with code-first migrations |
| **Pomelo.EntityFrameworkCore.MySql** | 9.0 | MySQL database provider |
| **xUnit** | 2.9 | Unit testing framework |
| **Moq** | 4.20 | Mocking library for tests |
| **EF Core InMemory** | 9.0 | In-memory database for testing |

### External Services
| Service | Purpose |
| :--- | :--- |
| **OpenRouter API** | AI inference gateway |
| **Google Gemini 2.5 Flash** | LLM model for question generation & personality analysis |

### Database
| Technology | Purpose |
| :--- | :--- |
| **MySQL 8.x** | Relational data storage (Users & Reports) |

---

## 📁 Project Structure

```
AI_BehavioralPersonality_Profiler/
├── backend/                          # .NET Backend
│   ├── AIProfilerAPI/                # Main API project
│   │   ├── Controllers/             # API endpoints
│   │   │   ├── AiController.cs      # POST /api/ai/chat — Q&A + analysis
│   │   │   ├── userController.cs    # /api/user — auth & CRUD
│   │   │   └── ReportController.cs  # /api/report — report retrieval
│   │   ├── Models/                  # EF Core entities & DbContext
│   │   ├── Repositories/           # Data access layer (interfaces + implementations)
│   │   ├── service/                 # OpenRouterService (AI inference)
│   │   ├── Constants/               # PromptTemplates for AI prompts
│   │   ├── Migrations/              # EF Core migration history
│   │   ├── Program.cs               # App entry point, DI, middleware
│   │   └── appsettings.json         # Config (DB connection, API keys)
│   ├── AIProfilerAPI.Tests/         # Unit tests (xUnit + Moq)
│   │   ├── Controllers/             # Controller tests
│   │   └── Services/                # Service tests
│   └── AIProfilerAPI.sln            # Solution file
│
├── frontend/                         # Angular Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── presentation/        # UI components
│   │   │   │   ├── home/            # Dashboard
│   │   │   │   ├── splash/          # Landing page
│   │   │   │   ├── sign-up/         # Login & registration
│   │   │   │   ├── test-page/       # AI chat test interface
│   │   │   │   └── settings/        # Profile & report display
│   │   │   ├── admin/               # Admin module (guarded)
│   │   │   ├── model/               # Shared data models
│   │   │   └── app.routes.ts        # Route definitions
│   │   └── environments/            # Environment configs
│   ├── karma.conf.js                # Karma test configuration
│   └── package.json                 # npm dependencies & scripts
│
├── docs/                             # Project documentation
│   ├── architecture-overview.md      # System design & component breakdown
│   ├── api-contracts.md              # REST API specification
│   └── data-flow-sequence-diagrams.md # Mermaid sequence & flow diagrams
│
├── start_project.bat                 # One-click launcher (starts both servers)
└── README.md                         # This file
```

---

## ⚙ Setup Instructions

### Prerequisites

Ensure the following are installed on your machine:

| Tool | Minimum Version | Download |
| :--- | :--- | :--- |
| **Node.js** | 18.x+ | [nodejs.org](https://nodejs.org/) |
| **npm** | 9.x+ | Included with Node.js |
| **Angular CLI** | 21.x | `npm install -g @angular/cli` |
| **.NET SDK** | 9.0+ | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| **MySQL Server** | 8.0+ | [dev.mysql.com](https://dev.mysql.com/downloads/) |

### Step 1 — Clone the Repository

```bash
git clone https://github.com/your-username/AI_BehavioralPersonality_Profiler.git
cd AI_BehavioralPersonality_Profiler
```

### Step 2 — Set Up the Database

1. Start your MySQL server.
2. Create the database:
   ```sql
   CREATE DATABASE AIProfilerDB;
   ```
3. Verify the connection string in `backend/AIProfilerAPI/appsettings.json`:
   ```json
   {
     "ConnectionStrings": {
       "DefaultConnection": "Server=localhost;Database=AIProfilerDB;User=root;Password=YOUR_PASSWORD;"
     }
   }
   ```
   > ⚠️ Update `User` and `Password` to match your local MySQL credentials.

### Step 3 — Configure the AI API Key

In `backend/AIProfilerAPI/appsettings.json`, add your OpenRouter API key:

```json
{
  "OpenRouter": {
    "ApiKey": "sk-or-v1-YOUR_OPENROUTER_API_KEY"
  }
}
```

> Get a free API key at [openrouter.ai](https://openrouter.ai/).

### Step 4 — Install Backend Dependencies

```bash
cd backend/AIProfilerAPI
dotnet restore
```

### Step 5 — Apply Database Migrations

```bash
cd backend/AIProfilerAPI
dotnet ef database update
```

> If `dotnet ef` is not installed, run: `dotnet tool install --global dotnet-ef`

### Step 6 — Install Frontend Dependencies

```bash
cd frontend
npm install
```

---

## 🚀 How to Run the API (Backend)

### Option 1 — Standard Run

```bash
cd backend/AIProfilerAPI
dotnet run
```

The API will start at: **http://localhost:5233**

### Option 2 — Hot Reload (Development)

```bash
cd backend/AIProfilerAPI
dotnet watch run
```

This enables automatic recompilation on file changes.

### Verify the API is Running

Open your browser or use curl:

```bash
curl http://localhost:5233/api/user/all
```

You should receive a JSON array (empty `[]` if no users exist yet).

### Available API Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/user/register` | Register a new user |
| `POST` | `/api/user/login` | Login with email & password |
| `GET` | `/api/user/profile/{id}` | Get user profile |
| `PUT` | `/api/user/{id}` | Update user (name/password) |
| `DELETE` | `/api/user/{id}` | Delete a user |
| `GET` | `/api/user/all` | List all users |
| `POST` | `/api/ai/chat?userId={id}` | Send answer / get next question |
| `GET` | `/api/report/{id}` | Get report by report ID |
| `GET` | `/api/report/user/{userId}` | Get report by user ID |

> 📄 For full request/response schemas, see [docs/api-contracts.md](./docs/api-contracts.md).

---

## 🖥 How to Run the UI (Frontend)

### Option 1 — Angular CLI

```bash
cd frontend
ng serve
```

### Option 2 — npm Script

```bash
cd frontend
npm start
```

The frontend will start at: **http://localhost:4200**

> The frontend is configured to proxy API requests to `http://localhost:5233/api`.  
> Make sure the backend is running before using the frontend.

### Quick Launch (Both Backend + Frontend)

Double-click the `start_project.bat` file in the project root. This opens two terminal windows — one for the backend and one for the frontend.

```
start_project.bat
```

| Service | URL |
| :--- | :--- |
| Frontend | http://localhost:4200 |
| Backend API | http://localhost:5233 |

---

## 🧪 How to Run Tests

### Backend Tests (xUnit + Moq)

The backend test project is located at `backend/AIProfilerAPI.Tests/` and uses:
- **xUnit** as the test framework
- **Moq** for mocking dependencies
- **EF Core InMemory** for database mocking

**Run all backend tests:**

```bash
cd backend
dotnet test
```

**Run with detailed output:**

```bash
cd backend
dotnet test --verbosity detailed
```

**Run a specific test class:**

```bash
cd backend
dotnet test --filter "FullyQualifiedName~AIControllerTests"
dotnet test --filter "FullyQualifiedName~UserControllerTests"
dotnet test --filter "FullyQualifiedName~ReportControllerTests"
dotnet test --filter "FullyQualifiedName~OpenRouterServiceTests"
```

**Backend test files:**

| Test File | Tests For |
| :--- | :--- |
| `Controllers/AIControllerTests.cs` | AI chat endpoint — question flow, analysis trigger, session management |
| `Controllers/UserControllerTests.cs` | User registration, login, profile CRUD, validation |
| `Controllers/ReportControllerTests.cs` | Report retrieval by ID and by user ID |
| `Services/OpenRouterServiceTests.cs` | OpenRouter API calls, fallback logic, error handling |

---

### Frontend Tests (Karma + Jasmine)

The frontend uses **Karma** as the test runner with **Jasmine** as the assertion framework, running in **Chrome**.

**Run all frontend tests:**

```bash
cd frontend
ng test
```
use the bellow command for run the frondent test files  because  of the & in my folder path 
//node ./node_modules/@angular/cli/bin/ng.js test --no-watch --browsers=ChromeHeadless

Or via npm:

```bash
cd frontend
npm test
```

**Run tests in headless mode (CI-friendly):**

```bash
cd frontend
ng test --no-watch --browsers=ChromeHeadless
```

**Run tests with code coverage:**

```bash
cd frontend
ng test --no-watch --code-coverage
```

Coverage reports are generated at: `frontend/coverage/ai-behavioral-personality-profiler/`

**Frontend test files:**

| Test File | Tests For |
| :--- | :--- |
| `app/app.spec.ts` | Root AppComponent |
| `app/app.routes.spec.ts` | Route definitions & navigation |
| `presentation/home/home.spec.ts` | Home dashboard component |
| `presentation/test-page/test-page.spec.ts` | AI chat test page component |
| `presentation/test-page/test-service.spec.ts` | ChatService HTTP calls |
| `presentation/settings/settings.spec.ts` | Settings/profile component |
| `presentation/settings/settings-service.spec.ts` | SettingsService HTTP calls |
| `admin/admin.guard.spec.ts` | Admin route guard |
| `model/userModel.spec.ts` | UserModel data class |

---

### Run All Tests (Backend + Frontend)

```bash
# Terminal 1 — Backend
cd backend
dotnet test

# Terminal 2 — Frontend
cd frontend
ng test --no-watch --browsers=ChromeHeadless
```

---

## 📚 Documentation

Detailed technical documentation is available in the [`docs/`](./docs/) folder:

| Document | Description |
| :--- | :--- |
| [Architecture Overview](./docs/architecture-overview.md) | System design, component breakdown, tech stack, ER diagrams, DI graph, deployment topology |
| [API Contracts](./docs/api-contracts.md) | Complete REST API spec with request/response schemas, status codes, and data models |
| [Data Flow & Sequence Diagrams](./docs/data-flow-sequence-diagrams.md) | Mermaid diagrams for all user flows — test loop, auth, report retrieval, admin, AI service calls |

---

## 📜 License

This project is for educational and demonstration purposes.

# Architecture - AI Behavioral Personality Profiler

## Overview
The AI Behavioral Personality Profiler is a full-stack application designed to analyze user behavior and generate personality profiles using AI. It consists of a modern Angular frontend and a robust .NET Core backend.

## System Components

### 1. Frontend (Angular)
- **Framework**: Angular 19+
- **Styling**: Tailwind CSS for modern, responsive UI.
- **State Management**: Reactive services and RxJS for asynchronous data handling.
- **Key Modules**: 
  - `Presentation`: Contains the UI components (Home, Dashboard, Profiler).
  - `Services`: Handles communication with the backend API.

### 2. Backend (.NET Core API)
- **Framework**: ASP.NET Core 8.0+
- **Architecture**: Controller-Repository pattern.
- **ORM**: Entity Framework Core for database interaction.
- **Key Controllers**:
  - `UserController`: Manages authentication and user profiles.
  - `AiController`: Orchestrates the personality analysis logic (integrating with AI services).
  - `ReportController`: Manages the generated personality reports.

### 3. Data Storage
- **Database**: SQL Server (managed via EF Core migrations).
- **Entities**: 
  - `User`: Stores credentials and basic info.
  - `Report`: Stores the JSON data and metadata for personality profiles.

## Communication Flow
1. **Request**: The Angular frontend sends HTTP requests to the .NET API.
2. **Processing**: The API validates the request, interacts with the database, and performs analysis.
3. **Response**: The API returns JSON data to the frontend for rendering.

## Deployment
- **Frontend**: Can be hosted on Vercel, Netlify, or as static assets on a web server.
- **Backend**: Hosted on Azure, AWS, or any server supporting the .NET runtime.

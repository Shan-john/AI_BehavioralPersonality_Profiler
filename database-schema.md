# Database Schema - AI Behavioral Personality Profiler

The application uses Entity Framework Core with a code-first approach. The following tables define the core data structure.

## 1. Users Table
Stores user credentials and profile information.

| Column | Type | Description |
| :--- | :--- | :--- |
| **Id** | `int` (PK) | Unique identifier for the user. |
| **Name** | `nvarchar(max)` | The user's display name. |
| **Email** | `nvarchar(max)` | User's email address (used for login). |
| **Password** | `nvarchar(max)` | Hashed password (currently plain text in dev). |
| **Report** | `nvarchar(max)` | The latest generated personality report (Markdown). |

## 2. Reports Table
Stores historical personality profiles for users.

| Column | Type | Description |
| :--- | :--- | :--- |
| **Id** | `int` (PK) | Unique identifier for the report. |
| **Data** | `nvarchar(max)` | The full personality profile analysis content. |
| **UserId** | `int` (FK) | Reference to the `Users` table. |

## Entity Relationships
- **User 1:M Report**: One user can have multiple historical reports.
- **User 1:1 Latest Report**: The `Report` field in the `Users` table stores the most recent analysis for quick retrieval.

## Migrations
Database changes are managed via EF Core migrations located in `backend/AIProfilerAPI/Migrations`.
To apply migrations:
```bash
dotnet ef database update
```

# API Contracts — AI Behavioral Personality Profiler

**Base URL:** `http://localhost:5233/api`
**Content-Type:** `application/json` (all requests and responses)
**CORS:** Allowed origin — `http://localhost:4200`

---

## Table of Contents

- [1. User Management (`/api/user`)](#1-user-management-apiuser)
  - [1.1 Register User](#11-register-user)
  - [1.2 Login](#12-login)
  - [1.3 Get User Profile](#13-get-user-profile)
  - [1.4 Update User](#14-update-user)
  - [1.5 Delete User](#15-delete-user)
  - [1.6 Get All Users](#16-get-all-users-admin--debug)
- [2. AI Profiler (`/api/ai`)](#2-ai-profiler-apiai)
  - [2.1 Chat — Send Answer / Get Question](#21-chat--send-answer--get-question)
- [3. Reports (`/api/report`)](#3-reports-apireport)
  - [3.1 Get Report by Report ID](#31-get-report-by-report-id)
  - [3.2 Get Report by User ID](#32-get-report-by-user-id)
- [4. Error Response Format](#4-error-response-format)
- [5. Data Models](#5-data-models)

---

## 1. User Management (`/api/user`)

### 1.1 Register User

Creates a new user account.

| | |
| :--- | :--- |
| **Method** | `POST` |
| **Endpoint** | `/api/user/register` |
| **Auth Required** | No |

**Request Body:**

```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response — `200 OK`:**

```json
{
  "message": "User registered successfully",
  "userId": 1,
  "role": "User"
}
```

**Error Responses:**

| Status | Condition | Body |
| :--- | :--- | :--- |
| `400 Bad Request` | Missing email or password | `"Email and Password are required"` |
| `400 Bad Request` | Duplicate email | `"User with this email already exists"` |

---

### 1.2 Login

Authenticates a user by email and password.

| | |
| :--- | :--- |
| **Method** | `POST` |
| **Endpoint** | `/api/user/login` |
| **Auth Required** | No |

**Request Body:**

```json
{
  "email": "john@example.com",
  "password": "securepassword"
}
```

**Success Response — `200 OK`:**

```json
{
  "message": "Login successful",
  "userId": 1,
  "email": "john@example.com",
  "name": "John Doe",
  "role": "User"
}
```

**Error Responses:**

| Status | Condition | Body |
| :--- | :--- | :--- |
| `400 Bad Request` | Missing email or password | `"Email and Password are required"` |
| `401 Unauthorized` | Invalid credentials | `"Invalid email or password"` |

---

### 1.3 Get User Profile

Retrieves a user's profile information (excludes password and report data).

| | |
| :--- | :--- |
| **Method** | `GET` |
| **Endpoint** | `/api/user/profile/{id}` |
| **Auth Required** | No |

**Path Parameters:**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `int` | User ID |

**Success Response — `200 OK`:**

```json
{
  "userId": 1,
  "email": "john@example.com",
  "name": "John Doe"
}
```

**Error Responses:**

| Status | Condition | Body |
| :--- | :--- | :--- |
| `404 Not Found` | User ID does not exist | `"User not found"` |

---

### 1.4 Update User

Updates user name and/or password. Fields not provided are left unchanged.

| | |
| :--- | :--- |
| **Method** | `PUT` |
| **Endpoint** | `/api/user/{id}` |
| **Auth Required** | No |

**Path Parameters:**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `int` | User ID |

**Request Body:**

```json
{
  "name": "Jane Doe",
  "password": "newsecurepassword"
}
```

> **Note:** Only `name` and `password` are updatable. Email and role changes are not supported via this endpoint.

**Success Response — `200 OK`:**

```json
{
  "message": "User updated successfully",
  "user": {
    "id": 1,
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "newsecurepassword",
    "role": "User"
  }
}
```

**Error Responses:**

| Status | Condition | Body |
| :--- | :--- | :--- |
| `404 Not Found` | User ID does not exist | `"User not found"` |

---

### 1.5 Delete User

Permanently deletes a user account.

| | |
| :--- | :--- |
| **Method** | `DELETE` |
| **Endpoint** | `/api/user/{id}` |
| **Auth Required** | No |

**Path Parameters:**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `int` | User ID |

**Success Response — `200 OK`:**

```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**

| Status | Condition | Body |
| :--- | :--- | :--- |
| `404 Not Found` | User ID does not exist | `"User not found"` |

---

### 1.6 Get All Users (Admin / Debug)

Returns all registered users. Intended for admin dashboard and debugging.

| | |
| :--- | :--- |
| **Method** | `GET` |
| **Endpoint** | `/api/user/all` |
| **Auth Required** | No |

**Success Response — `200 OK`:**

```json
[
  {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword",
    "role": "User"
  },
  {
    "id": 2,
    "name": "Admin",
    "email": "admin@test.com",
    "password": "admin123",
    "role": "Admin"
  }
]
```

> ⚠️ **Security Note:** This endpoint exposes all user data including passwords. It should be restricted or removed in production.

---

## 2. AI Profiler (`/api/ai`)

### 2.1 Chat — Send Answer / Get Question

The core interactive endpoint. Manages a 15-question conversation loop. On each call:
- **Questions 1–14**: Saves the user's answer and returns the next scenario question.
- **Question 15**: Triggers AI personality analysis, saves the report, and returns the final result.

| | |
| :--- | :--- |
| **Method** | `POST` |
| **Endpoint** | `/api/ai/chat` |
| **Auth Required** | No (but `userId` is required) |

**Query Parameters:**

| Parameter | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `userId` | `int` | Yes | Identifies which user's session to update |

**Request Body (`ChatRequest`):**

```json
{
  "questionCount": 0,
  "answer": "I would stay calm and assess the situation.",
  "userId": 1
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `questionCount` | `int` | The current question number (0-indexed from client perspective). When `>= 15`, analysis is triggered. |
| `answer` | `string?` | The user's answer to the previous question. `null` or empty for the first request. |
| `userId` | `int` | User identifier (also sent as query param). |

**Response — Next Question (`questionCount < 15`):**

```json
{
  "type": "question",
  "data": "Imagine you discover a close friend has been spreading rumors about you at work. How do you handle it?",
  "questionNumber": 1
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Always `"question"` for intermediate responses. |
| `data` | `string` | The AI-generated scenario question text. |
| `questionNumber` | `int` | The sequence number of this question (1-indexed). |

**Response — Final Analysis (`questionCount >= 15`):**

```json
{
  "type": "result",
  "data": "CORE TRAITS:\n- Naturally empathetic and people-oriented.\n- Values fairness and logical reasoning.\n..."
}
```

| Field | Type | Description |
| :--- | :--- | :--- |
| `type` | `string` | Always `"result"` for the final analysis. |
| `data` | `string` | Markdown-formatted personality profile including trait scores. |

**Analysis Output Structure (inside `data`):**

```
CORE TRAITS:
- (2-3 bullet points)

BEHAVIORAL PATTERNS:
- (2-3 bullet points)

STRENGTHS & BLIND SPOTS:
- (strengths and blind spots as bullet points)

SCORES_START
Empathy & Collaboration: [0-100]
Resilience & Adaptability: [0-100]
Analytical Depth: [0-100]
Creativity & Innovation: [0-100]
Leadership & Influence: [0-100]
Decision Speed: [0-100]
Stress Tolerance: [0-100]
Focus Depth: [0-100]
Risk Appetite: [0-100]
SCORES_END
```

**Side Effects:**
- The report is automatically saved to the `Reports` table (upsert — replaces existing report for the user).
- The in-memory session for this user is cleared after analysis.

---

## 3. Reports (`/api/report`)

### 3.1 Get Report by Report ID

Retrieves a specific report by its unique report ID.

| | |
| :--- | :--- |
| **Method** | `GET` |
| **Endpoint** | `/api/report/{id}` |
| **Auth Required** | No |

**Path Parameters:**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `id` | `int` | Report ID |

**Success Response — `200 OK`:**

```json
{
  "id": 1,
  "data": "CORE TRAITS:\n- ...",
  "userId": 1
}
```

---

### 3.2 Get Report by User ID

Retrieves the personality report for a specific user.

| | |
| :--- | :--- |
| **Method** | `GET` |
| **Endpoint** | `/api/report/user/{userId}` |
| **Auth Required** | No |

**Path Parameters:**

| Parameter | Type | Description |
| :--- | :--- | :--- |
| `userId` | `int` | User ID |

**Success Response — Report Exists (`200 OK`):**

```json
{
  "hasReport": true,
  "reportId": 1,
  "userId": 1,
  "data": "CORE TRAITS:\n- Naturally empathetic and people-oriented.\n..."
}
```

**Success Response — No Report (`200 OK`):**

```json
{
  "hasReport": false,
  "data": null
}
```

---

## 4. Error Response Format

The API uses standard HTTP status codes. Error responses are returned as plain strings or standard ASP.NET Core problem details:

| Status Code | Meaning | Common Causes |
| :--- | :--- | :--- |
| `200 OK` | Request succeeded | — |
| `400 Bad Request` | Invalid input | Missing required fields, duplicate email |
| `401 Unauthorized` | Authentication failed | Wrong email/password |
| `404 Not Found` | Resource not found | Invalid user ID, missing report |
| `500 Internal Server Error` | Server error | Database issues, AI service failure |

---

## 5. Data Models

### User

```typescript
interface User {
  id: number;        // Auto-generated PK
  name: string;      // Display name
  email: string;     // Unique, used for login
  password: string;  // Plain text (dev only)
  role: string;      // "User" or "Admin"
}
```

### Report

```typescript
interface Report {
  id: number;       // Auto-generated PK
  data: string;     // Full Markdown personality analysis
  userId: number;   // FK → Users.Id
}
```

### ChatRequest

```typescript
interface ChatRequest {
  questionCount: number;  // Current question number (0-indexed)
  answer?: string;        // User's answer (null for first request)
  userId: number;         // User identifier
}
```

### ChatResponse (Question)

```typescript
interface ChatResponseQuestion {
  type: "question";
  data: string;           // AI-generated scenario question
  questionNumber: number; // 1-indexed question sequence
}
```

### ChatResponse (Result)

```typescript
interface ChatResponseResult {
  type: "result";
  data: string;           // Markdown personality profile
}
```

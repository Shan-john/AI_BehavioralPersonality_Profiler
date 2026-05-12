# API Contracts - AI Behavioral Personality Profiler

The backend API is accessible at `http://localhost:5233/api`. All requests and responses use JSON.

## 1. User Management (`/api/user`)

### Register User
- **Endpoint**: `POST /register`
- **Request Body**:
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "User registered successfully",
    "userId": 1
  }
  ```

### User Login
- **Endpoint**: `POST /login`
- **Request Body**:
  ```json
  {
    "email": "john@example.com",
    "password": "securepassword"
  }
  ```
- **Response** (200 OK):
  ```json
  {
    "message": "Login successful",
    "userId": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
  ```

### Get User Profile
- **Endpoint**: `GET /profile/{id}`
- **Response** (200 OK):
  ```json
  {
    "userId": 1,
    "email": "john@example.com",
    "name": "John Doe"
  }
  ```

## 2. AI Profiler (`/api/ai`)

### Chat / Generate Question
- **Endpoint**: `POST /chat?userId={id}`
- **Request Body**:
  ```json
  {
    "questionCount": 0,
    "answer": "I would stay calm.",
    "userId": 1
  }
  ```
- **Response (Question)**:
  ```json
  {
    "type": "question",
    "data": "What would you do in X scenario?",
    "questionNumber": 1
  }
  ```
- **Response (Final Result)**:
  ```json
  {
    "type": "result",
    "data": "Based on your answers, you have a Pragmatic personality type..."
  }
  ```

## 3. Reports (`/api/report`)

### Get Reports by User
- **Endpoint**: `GET /user/{userId}`
- **Response** (200 OK):
  ```json
  [
    {
      "id": 1,
      "data": "Personality Profile Analysis...",
      "userId": 1
    }
  ]
  ```

# PlungePhoenix API Reference

Welcome to the PlungePhoenix backend API! This document outlines the endpoints available for the frontend team.

## Base URL
`http://localhost:8000`

## Authentication
None required. All endpoints are open.

---

## Endpoints

### 1. Health Check
- **Method & Path**: `GET /health`
- **Description**: Verifies the API is online.
- **Example Curl**: 
  ```bash
  curl -X GET http://localhost:8000/health
  ```
- **Response Shape**: 
  ```json
  {
    "success": true,
    "message": "ok",
    "data": {
      "status": "ok",
      "version": "1.0.0"
    }
  }
  ```

### 2. Ingest News
- **Method & Path**: `POST /api/news/ingest`
- **Description**: Forces background ET RSS ingestion.
- **Example Curl**: 
  ```bash
  curl -X POST http://localhost:8000/api/news/ingest
  ```

### 3. Latest News
- **Method & Path**: `GET /api/news/latest`
- **Description**: Gets the 10 most recent ET articles from ChromaDB.

### 4. Search News
- **Method & Path**: `GET /api/news/search?query=crash&top_k=5`
- **Description**: RAG vector search across stored news.

### 5. Transcribe Audio (File)
- **Method & Path**: `POST /api/audio/transcribe`
- **Description**: Upload audio via multipart form data (`file` key). Returns transcript and panic score.

### 6. Transcribe URL
- **Method & Path**: `POST /api/audio/transcribe-url`
- **Request Body**: `{"url": "https://..."}`
- **Description**: Transcribes from a public URL.

### 7. Score Text
- **Method & Path**: `POST /api/audio/score-text`
- **Request Body**: `{"text": "market crash selloff panic"}`
- **Description**: Instantly scores a given string without transcription.

### 8. Full Pipeline
- **Method & Path**: `POST /api/analysis/full-pipeline`
- **Request Body**: `{"text": "transcript text here"}`
- **Description**: The MAIN ENDPOINT. Runs panic scoring, RAG retrieval, and OpenRouter LLM Analysis sequentially.

### 9. Demo Pipeline
- **Method & Path**: `GET /api/analysis/demo`
- **Description**: Runs full pipeline on a hardcoded panic transcript. Excellent for rapid frontend testing.

---

## WebSocket Example (Real-time Panic Scoring)
`WS /api/audio/ws-panic`

```javascript
const ws = new WebSocket("ws://localhost:8000/api/audio/ws-panic");

ws.onopen = () => {
    ws.send("stocks are falling heavily");
};

ws.onmessage = (event) => {
    const response = JSON.parse(event.data);
    console.log(response.data); // { score: 0.8, level: "high", keywords_found: [...] }
};
```

---

## Error Codes Table
| Status Code | Description |
|---|---|
| `400` | Bad Request - Invalid request parameters or files |
| `422` | Validation Error - Pydantic schema validation failed |
| `500` | Internal Server Error - Unexpected crash (traceback logged) |
| `502` | Bad Gateway - Upstream error (AssemblyAI, OpenRouter, or LLM parse fail) |

---

## Quick start in 3 steps
1. Copy `.env.example` to `.env` and fill in keys.
2. Run `bash start.sh` or `uvicorn backend.main:app --reload`.
3. Open `http://localhost:8000/api/docs-summary` in your browser.

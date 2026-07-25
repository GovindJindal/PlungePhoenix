<div align="center">

# 🔥 PlungePhoenix

### AI-Powered Market Intelligence Platform

[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vite.dev)
**Transform live financial news and spoken market commentary into actionable investment insights.**

[Live Demo](#-quick-start) · [Architecture](#-system-architecture) · [API Docs](#-api-reference) · [Roadmap](#-roadmap)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [System Architecture](#-system-architecture)
- [How It Works](#-how-it-works)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Prerequisites](#-prerequisites)
- [Quick Start](#-quick-start)
- [Environment Variables](#-environment-variables)
- [API Reference](#-api-reference)
- [Frontend](#-frontend)
- [Backend Services](#-backend-services)
- [Performance](#-performance)
- [Roadmap](#-roadmap)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🧠 Overview

PlungePhoenix is an end-to-end AI-powered market intelligence platform that combines **audio sentiment analysis**, **real-time financial news monitoring**, and **AI-driven trading recommendations** into a single dashboard.

The system continuously:

1. **Collects** financial news via RSS feeds and web scraping
2. **Processes** spoken market commentary through AssemblyAI speech-to-text
3. **Detects** market panic levels using a weighted keyword scoring engine
4. **Retrieves** relevant context using RAG (Retrieval Augmented Generation) and ChromaDB vector search
5. **Generates** AI-powered trading recommendations through OpenRouter/Gemini LLMs
6. **Displays** everything in a real-time interactive dashboard

---

## ✨ Key Features

| Feature | Description |
|:--------|:------------|
| 🎙️ **Audio Sentiment Analysis** | Upload or record market commentary → AssemblyAI transcription → panic scoring |
| 📊 **Real-Time Panic Detection** | Weighted keyword engine scores market stress (0.0–1.0) with level classification |
| 🔍 **Semantic Vector Search** | ChromaDB-powered RAG finds contextually relevant news (not just keywords) |
| 🤖 **AI Trading Recommendations** | LLM-generated buy/sell/hold signals with confidence scores and sector analysis |
| 📰 **Live News Ingestion** | Continuous RSS feed + web scraping pipeline with automatic embedding generation |
| 🔄 **LLM Fallback System** | OpenRouter → Gemini auto-failover ensures 100% AI uptime |
| 📡 **WebSocket Streaming** | Real-time panic scoring via persistent WebSocket connection |
| 🛡️ **Production Hardened** | Structured error handling, request tracing, exponential backoff retries |

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PRESENTATION LAYER                       │
│  ┌──────────┐  ┌──────────────┐  ┌───────────┐  ┌───────┐  │
│  │ React 19 │  │ Landing Page │  │ Dashboard │  │  WS   │  │
│  └──────────┘  └──────────────┘  └───────────┘  └───────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │ REST / WebSocket
┌───────────────────────▼─────────────────────────────────────┐
│                    APPLICATION LAYER                         │
│  ┌─────────┐  ┌──────────┐  ┌────────────┐  ┌───────────┐  │
│  │ FastAPI  │  │ REST API │  │ Middleware │  │  Uvicorn  │  │
│  └─────────┘  └──────────┘  └────────────┘  └───────────┘  │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                      AI SERVICES LAYER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────┐  ┌───────────┐ │
│  │ AssemblyAI │  │ OpenRouter │  │ Gemini │  │  Panic    │ │
│  │ (STT)      │  │ (Primary)  │  │(Fallback│  │  Engine  │ │
│  └────────────┘  └────────────┘  └────────┘  └───────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    KNOWLEDGE LAYER                           │
│  ┌────────────┐  ┌──────────┐  ┌──────────────────────────┐ │
│  │ Embeddings │  │ ChromaDB │  │ RAG Pipeline             │ │
│  └────────────┘  └──────────┘  └──────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    DATA SOURCES LAYER                        │
│  ┌───────────┐  ┌──────────────┐  ┌───────────────────────┐ │
│  │ RSS Feeds │  │ Web Scrapers │  │ Audio Input (Mic/File) │ │
│  └───────────┘  └──────────────┘  └───────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## ⚙️ How It Works

### Data Pipeline

```
Financial Websites ─┐
RSS Feeds ──────────┼──▶ Web Scraping ──▶ Text Cleaning ──▶ Embedding Generation ──▶ ChromaDB
Market News ────────┘                                                                  │
                                                                                       │
Audio Upload ──▶ AssemblyAI (STT) ──▶ Transcript ──▶ Panic Detection                  │
                                          │                                            │
                                          ▼                                            │
                                    RAG Retrieval ◀────────────────────────────────────┘
                                          │
                                          ▼
                               OpenRouter / Gemini LLM
                                          │
                                          ▼
                              Trading Recommendation
                                          │
                                          ▼
                              Interactive Dashboard
```

### Step-by-Step Flow

1. **News Ingestion** — RSS feeds from Economic Times (and configurable sources) are fetched, cleaned, and deduplicated
2. **Embedding Generation** — Articles are converted into vector embeddings and stored in ChromaDB
3. **Audio Processing** — User uploads/records audio → AssemblyAI transcribes it with exponential backoff retries
4. **Panic Scoring** — The transcript is run through a weighted keyword engine (`crash` = 1.0, `volatile` = 0.5, etc.) producing a 0.0–1.0 panic score
5. **RAG Retrieval** — The transcript is used as a query against ChromaDB to retrieve the 10 most semantically relevant news articles
6. **LLM Analysis** — The transcript + retrieved articles + panic score are sent to an LLM (OpenRouter primary, Gemini fallback) which generates structured JSON with trading recommendations
7. **Dashboard Display** — Results stream to the React frontend showing transcript, panic meter, recommendations, and source articles

---

## 🛠️ Technology Stack

### Frontend
| Technology | Purpose |
|:-----------|:--------|
| **React 19** | UI framework |
| **Vite 7** | Build tool & dev server |
| **Vanilla CSS** | Styling (no frameworks) |
| **Lucide React** | Icon library |
| **WebSockets** | Real-time panic streaming |

### Backend
| Technology | Purpose |
|:-----------|:--------|
| **FastAPI** | API framework |
| **Python 3.11+** | Language |
| **Uvicorn** | ASGI server |
| **Pydantic v2** | Data validation |
| **python-dotenv** | Environment management |

### AI & ML
| Technology | Purpose |
|:-----------|:--------|
| **AssemblyAI** | Speech-to-text transcription |
| **OpenRouter** | Primary LLM provider (Claude, GPT, etc.) |
| **Gemini 1.5 Flash** | Fallback LLM provider |
| **ChromaDB** | Local vector database |
| **RAG** | Retrieval Augmented Generation |

### Data Collection
| Technology | Purpose |
|:-----------|:--------|
| **feedparser** | RSS feed parsing |
| **httpx** | Async HTTP client for web scraping |
| **Embeddings** | Text-to-vector conversion |

---

## 📁 Project Structure

```
PlungePhoenix/
├── backend/
│   ├── __init__.py              # Module init
│   ├── config.py                # Environment config with strict validation
│   ├── main.py                  # FastAPI app, CORS, middleware, lifespan
│   ├── middleware/
│   │   └── error_handler.py     # Structured JSON error responses
│   ├── models/
│   │   └── schemas.py           # Pydantic models (AnalysisResult, PanicScore, etc.)
│   ├── routers/
│   │   ├── analysis.py          # /api/analysis/* — full pipeline & demo
│   │   ├── audio.py             # /api/audio/* — transcribe, score, WebSocket
│   │   └── news.py              # /api/news/* — ingest, latest, search
│   ├── services/
│   │   ├── llm_analyzer.py      # LLM manager with retry + Gemini fallback
│   │   ├── news_ingester.py     # RSS feed fetcher & article cleaner
│   │   ├── panic_scorer.py      # Weighted keyword panic scoring engine
│   │   ├── rag_engine.py        # ChromaDB integration & RAG retrieval
│   │   └── transcriber.py       # AssemblyAI wrapper with exponential backoff
│   └── utils/
│       └── response_utils.py    # Standardized API response helpers
├── frontend/
│   ├── index.html               # Entry HTML with Google Fonts
│   ├── package.json             # React 19, Vite 7, Lucide
│   ├── vite.config.js           # Vite configuration
│   ├── assets/
│   │   └── hero-3d.png          # Hero section illustration
│   └── src/
│       ├── main.jsx             # React entry point
│       ├── App.jsx              # Router + health check + navbar
│       ├── styles.css           # Complete CSS (landing + dashboard)
│       ├── components/
│       │   ├── Landing.jsx      # SaaS homepage (12 sections + footer)
│       │   ├── Dashboard.jsx    # Real-time analysis dashboard
│       │   ├── Navbar.jsx       # Scroll-aware glassmorphism navbar
│       │   └── RippleGrid.jsx   # 3D particle canvas animation
│       └── lib/
│           ├── api.js           # Backend API client
│           ├── logger.js        # Frontend logging utility
│           └── VoiceRecorder.js # Microphone recording handler
├── chroma_db/                   # ChromaDB persistent storage (auto-created)
├── .env.example                 # Environment variable template
├── .gitignore                   # Git ignore rules
├── requirements.txt             # Python dependencies
├── pyrightconfig.json           # IDE import resolution config
├── start.sh                     # Quick-start setup script
├── PlungePhoenix.postman_collection.json  # Postman API collection
└── README.md                    # This file
```

---

## 📋 Prerequisites

- **Python 3.11+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **npm** — Included with Node.js
- **AssemblyAI API Key** — [assemblyai.com](https://www.assemblyai.com) (free tier available)
- **OpenRouter API Key** — [openrouter.ai](https://openrouter.ai) (free tier available)
- **Gemini API Key** — [ai.google.dev](https://ai.google.dev) (free tier available)

---

## 🚀 Quick Start

### 1. Clone the repository

```bash
git clone https://github.com/your-username/PlungePhoenix.git
cd PlungePhoenix
```

### 2. Set up the backend

```bash
# Create a virtual environment (recommended)
python -m venv .venv
source .venv/bin/activate   # macOS/Linux
# .venv\Scripts\activate    # Windows

# Install Python dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

### 3. Configure API keys

Open `.env` and fill in your API keys:

```env
ASSEMBLYAI_API_KEY=your_assemblyai_key
OPENROUTER_API_KEY=your_openrouter_key
GEMINI_API_KEY=your_gemini_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
LLM_MODEL=anthropic/claude-sonnet-4-5
CHROMA_PERSIST_DIR=./chroma_db
ET_RSS_URL=https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms
PANIC_THRESHOLD=0.6
PORT=8000
```

### 4. Start the backend

```bash
uvicorn backend.main:app --reload --port 8000
```

You should see:
```
INFO:     PlungePhoenix backend started - Configuration validated.
INFO:     Uvicorn running on http://127.0.0.1:8000
```

### 5. Set up and start the frontend

Open a **new terminal**:

```bash
cd frontend
npm install
npm run dev
```

You should see:
```
VITE v7.x.x  ready in Xms
➜  Local:   http://localhost:5173/
```

### 6. Open in browser

Navigate to **http://localhost:5173** to see the landing page, or **http://localhost:5173/#dashboard** to go directly to the analysis dashboard.

---

## 🔑 Environment Variables

| Variable | Required | Description |
|:---------|:---------|:------------|
| `ASSEMBLYAI_API_KEY` | ✅ | AssemblyAI API key for speech-to-text |
| `OPENROUTER_API_KEY` | ✅ | OpenRouter API key for primary LLM |
| `GEMINI_API_KEY` | ✅ | Google Gemini API key for fallback LLM |
| `OPENROUTER_BASE_URL` | ✅ | OpenRouter API base URL |
| `LLM_MODEL` | ✅ | LLM model identifier (e.g., `anthropic/claude-sonnet-4-5`) |
| `CHROMA_PERSIST_DIR` | ✅ | Path to ChromaDB storage directory |
| `ET_RSS_URL` | ✅ | RSS feed URL for financial news |
| `PANIC_THRESHOLD` | ⬡ | Panic score threshold (default: `0.6`) |
| `PORT` | ⬡ | Backend server port (default: `8000`) |
| `ALLOWED_ORIGINS` | ⬡ | Comma-separated CORS origins (default: `http://localhost:5173`) |

---

## 📡 API Reference

### Health

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `GET` | `/health` | Server health check |

### Audio

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/audio/transcribe` | Upload audio file for transcription + panic scoring |
| `POST` | `/api/audio/transcribe-url` | Transcribe audio from a public URL |
| `POST` | `/api/audio/score-text` | Score raw text for panic level |
| `WS` | `/api/audio/ws` | WebSocket for real-time panic scoring |

### News

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/news/ingest` | Trigger RSS feed ingestion into ChromaDB |
| `GET` | `/api/news/latest` | Get the 10 most recent articles from ChromaDB |
| `POST` | `/api/news/search` | Semantic search across stored articles |

### Analysis

| Method | Endpoint | Description |
|:-------|:---------|:------------|
| `POST` | `/api/analysis/full-pipeline` | Run full analysis (text → panic → RAG → LLM → recommendation) |
| `GET` | `/api/analysis/demo` | Run demo analysis with hardcoded panic text |

### Example Response — Full Pipeline

```json
{
  "success": true,
  "message": "Analysis complete",
  "data": {
    "analysis": {
      "summary": "Markets are showing significant stress...",
      "risk_level": "high",
      "action": "hedge",
      "confidence": 0.85,
      "recommendations": [
        {
          "action": "Reduce equity exposure",
          "reasoning": "Panic indicators suggest a broad selloff...",
          "confidence": 0.82
        }
      ],
      "sectors_affected": ["IT", "Banking", "Auto"],
      "key_factors": ["FII outflow", "Global uncertainty"]
    },
    "panic": {
      "score": 0.9,
      "level": "extreme",
      "keywords_found": ["crash", "selloff", "panic", "freefall"]
    },
    "sources_used": 10
  }
}
```

### Error Response Format

All errors follow a structured JSON format:

```json
{
  "success": false,
  "error": {
    "code": "HTTP_500",
    "message": "Human readable description",
    "details": "Technical details or traceback",
    "retryable": true
  }
}
```

---

## 🎨 Frontend

The frontend is a single-page application with two main views:

### Landing Page
A premium SaaS homepage with 12 scroll-animated sections:
- Hero with 3D particle ripple animation
- "What is PlungePhoenix" with animated AI orb
- Traditional vs PlungePhoenix comparison
- Feature cards with gradient hover effects
- Animated pipeline workflow
- Layered architecture diagram
- Technology stack grid
- Bento-grid key features
- Dashboard preview
- Use cases, metrics, roadmap
- CTA and professional footer

### Dashboard
Real-time analysis interface featuring:
- 🎙️ Microphone recording + file upload
- 📝 Live transcript display
- 📊 Panic score meter (0.0–1.0)
- 💡 AI trading recommendations with confidence scores
- 📰 News sources used in analysis
- 🔄 Demo mode for testing

---

## ⚙️ Backend Services

### Panic Scorer (`panic_scorer.py`)
Weighted keyword engine with 20+ financial panic terms. Each keyword has a weight (e.g., `crash` = 1.0, `volatile` = 0.5). The final score is capped at 1.0 and classified as `low`, `medium`, `high`, or `extreme`.

### Transcriber (`transcriber.py`)
AssemblyAI integration with **exponential backoff** (up to 3 retries). Differentiates between authentication errors (fatal) and transient errors (retryable).

### LLM Analyzer (`llm_analyzer.py`)
Dual-provider LLM system:
- **Primary**: OpenRouter (configurable model)
- **Fallback**: Gemini 1.5 Flash (via OpenAI-compatible API)

Includes retry logic with exponential backoff, JSON response validation, and automatic re-prompting if the LLM returns malformed JSON.

### RAG Engine (`rag_engine.py`)
ChromaDB-backed vector database that:
- Stores financial articles with auto-generated embeddings
- Deduplicates articles by title
- Retrieves semantically relevant context for LLM analysis

### News Ingester (`news_ingester.py`)
RSS feed parser using `feedparser` that extracts, cleans, and structures financial articles for embedding.

---

## ⚡ Performance

| Operation | Latency |
|:----------|:--------|
| Text Panic Scoring | ~13ms |
| ChromaDB Vector Retrieval | ~17ms |
| Frontend Production Build | ~912ms |
| Backend Startup Validation | ~150ms |

*LLM and transcription latency depends on the respective API providers.*

---

## 🗺️ Roadmap

- [x] **Phase 1** — Core Platform
  - [x] Audio sentiment analysis
  - [x] Panic detection engine
  - [x] RAG pipeline with ChromaDB
  - [x] Real-time dashboard
  - [x] LLM fallback system (OpenRouter → Gemini)
  - [x] Premium SaaS landing page

- [ ] **Phase 2** — Enhanced Intelligence
  - [ ] Predictive analytics
  - [ ] Portfolio risk scoring
  - [ ] Multi-exchange support
  - [ ] Historical backtesting

- [ ] **Phase 3** — Enterprise Scale
  - [ ] Institutional APIs
  - [ ] Custom AI models
  - [ ] Global markets
  - [ ] Multilingual support
  - [ ] White-label solutions

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


<div align="center">

**Built by the Govind Jindal and Bhavishya Grover**

[⬆ Back to Top](#-plungephoenix)

</div>

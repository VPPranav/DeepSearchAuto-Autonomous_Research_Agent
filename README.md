# DeepSearch Auto

DeepSearch Auto is an enterprise-grade autonomous AI research platform designed to replicate the deep-research capabilities of commercial tools like Perplexity AI. It automatically breaks down complex queries, executes parallel web searches, scrapes content, and uses Anthropic's Claude to synthesize fully cited, comprehensive reports.

## 🚀 Key Features

- **Autonomous AI Planning**: Uses LangGraph and Claude to break complex queries into targeted sub-questions.
- **Parallel Search & Extraction**: Leverages SerpAPI for concurrent searching and Trafilatura to extract clean text from web pages, bypassing noise and ads.
- **Real-Time Streaming**: Live WebSocket connection streams the research progress directly to the Next.js frontend with full transparency.
- **Knowledge Graph Visualization (NEW)**: Dynamically maps extracted entities and their relationships (e.g., organizations, concepts) in an interactive UI using React Flow.
- **Topic Intensity Heatmap (NEW)**: Clustered visualization of the most frequently mentioned keywords across all processed sources.
- **Confidence Dashboard (NEW)**: Real-time metrics tracking source agreement, evidence strength, and hallucination risk using radial progress indicators.
- **Interactive Citation Graph**: Visualizes the relationship between the main query, sub-topics, and sources using a node-based interactive interface.
- **Fact Verification**: Cross-references claims across sources to reduce hallucinations.
- **Session History (NEW)**: Locally stores your past research sessions for quick access during your active session.
- **Professional Exports (NEW)**: Download synthesized, heavily-cited research reports as formatted Markdown, PDF, or DOCX files.
- **Modern UI/UX**: Built with Next.js 15, TailwindCSS, and Framer Motion for a stunning, responsive, and glassmorphic interface.

## 🛠️ Technology Stack

### Backend
- **Framework**: FastAPI (Python)
- **AI Orchestration**: LangGraph, LangChain
- **LLM**: Anthropic Claude API (Haiku / Sonnet)
- **Data Gathering**: SerpAPI (Search), Trafilatura (Scraping)
- **Document Generation**: ReportLab (PDF), python-docx (DOCX)
- **Real-time**: Uvicorn WebSockets, Asyncio

### Frontend
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **Animations**: Framer Motion
- **Data Visualization**: React Flow (Interactive Graph & Knowledge Graph)
- **State & Auth**: React Hooks, LocalStorage Auth

## 📂 Architecture & Connection

The project is split into two independent services operating asynchronously to provide a seamless research experience.

### 1. The Presentation Layer: Frontend (Next.js)
Runs on port `3000`. The frontend is responsible for the glassmorphic UI, data visualization, and managing the user session.
- **Triggering Research**: It communicates with the backend via REST API (`POST /api/research/start`) to submit a query and receive a unique `taskId`.
- **Real-Time Polling & Streaming**: It establishes a **WebSocket connection** (`ws://.../api/research/stream/{taskId}`) to receive live, bi-directional updates as the agent moves through the research graph. If WebSockets fail, it gracefully falls back to an HTTP polling mechanism (`GET /api/research/status/{taskId}`) to ensure no data is lost.
- **Rendering Visualizations**: Once the research completes, the frontend mounts the React Flow interactive citation graphs, D3-style knowledge graphs, and renders markdown safely.

### 2. The Orchestration Layer: Backend (FastAPI)
Runs on port `8000`. This is the brain of the platform, housing the **LangGraph** orchestration framework.
- **State Machine**: The backend defines a directed graph (StateGraph) where each node is a distinct AI operation (`plan_research`, `gather_data`, `synthesize`).
- **Parallel Execution**: During the `gather_data` phase, the backend uses `asyncio.gather` to launch parallel SerpAPI web searches and Trafilatura scraping tasks across multiple sub-topics simultaneously.
- **LLM Extraction**: In the final `synthesize` phase, the AI uses structured JSON extraction to pull out Keywords, Entities, and Confidence Metrics for the new visualization dashboards.

## 🌟 Deep Dive into the New Visualizations

1. **Knowledge Graph (`KnowledgeGraph.tsx`)**: The AI scans the completed report to extract entity relationships (e.g., Company X *acquired* Startup Y). These are plotted using `reactflow` with a circular layout, allowing you to drag nodes and visualize the network of facts.
2. **Topic Heatmap (`ResearchHeatmap.tsx`)**: As the AI synthesizes sources, it tracks word frequencies and conceptual overlap. The top 10 concepts are assigned an "Intensity Score" (1-100) and plotted as scaling, color-coded interactive pills.
3. **Confidence Dashboard (`ConfidenceDashboard.tsx`)**: A trust and transparency module. The agent assigns 0.0 to 1.0 scores for "Source Agreement", "Evidence Strength", and "Hallucination Risk", which are visualized via animated SVG radial progress bars.

## 🌐 Live Deployment

### Frontend (Vercel)
https://deepsearch-auto.vercel.app/

### Backend API (Railway)
https://deepsearchauto-autonomousresearchagent-production.up.railway.app

### Health Check Endpoint
https://deepsearchauto-autonomousresearchagent-production.up.railway.app/api/health

## ⚙️ Local Setup Instructions

### 1. Backend Setup

Open a terminal and navigate to the backend directory:
```bash
cd backend
```

Create a virtual environment and install dependencies:
```bash
python -m venv venv

# Activate the virtual environment:
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate

# Install requirements INSIDE the venv:
pip install -r requirements.txt
```

Create a `.env` file in the `backend` directory with your API keys:
```env
ANTHROPIC_API_KEY=your_anthropic_api_key
SERPAPI_API_KEY=your_serpapi_api_key
```

Run the backend development server using the venv python:
```bash
# Ensure you are still inside the backend directory
venv\Scripts\python main.py
```
*The backend will be running on `http://localhost:8000`.*

### 2. Frontend Setup

Open a new terminal and navigate to the frontend directory:
```bash
cd frontend
```

Install the dependencies:
```bash
npm install
```

Create a `.env.local` file in the `frontend` directory:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

Run the frontend development server:
```bash
npm run dev
```
*The frontend will be accessible at `http://localhost:3000`.*

## 🔒 Authentication

The platform uses a simulated local-storage based authentication mechanism to gate access to the research capabilities. Simply create an account or sign in with dummy credentials directly from the homepage.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the issues page.

## 📄 License

This project is licensed under the MIT License.

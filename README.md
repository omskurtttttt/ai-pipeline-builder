# ⚡ AI Pipeline Builder

A visual, drag-and-drop pipeline builder for constructing AI workflows. Connect nodes to create data processing chains that can call LLMs, make API requests, transform text, and more — all with a beautiful dark-themed UI.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi&logoColor=white)
![Python](https://img.shields.io/badge/Python-3.12-3776AB?logo=python&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white)

---

## ✨ Features

### 🧩 Node Types
| Node | Description |
|------|-------------|
| 📥 **Input** | Starting point — provide text data to the pipeline |
| 📝 **Text** | Template node with `{{input}}` placeholder substitution |
| 🔄 **Transform** | Text operations: uppercase, lowercase, reverse, trim, regex replace |
| 🧠 **LLM** | Call OpenAI or Google Gemini APIs with custom prompts |
| 🌐 **API** | Make HTTP requests (GET/POST/PUT/PATCH/DELETE) with headers and body |
| 🔀 **Condition** | Branch logic — route data based on contains, equals, regex, etc. |
| 📤 **Output** | Display results in text, JSON, or markdown format |
| 💾 **File Save** | Capture pipeline output for download (txt, json, csv, md) |

### 🎨 UI Features
- **Drag & drop** nodes from the sidebar onto the canvas
- **Visual connections** with animated edges between nodes
- **Node configuration panel** — click any node to edit its settings
- **Execution status highlighting** — green glow for success, red for errors
- **Results panel** — slide-up panel showing per-node output after execution
- **Pipeline validation** — Analyze button checks for cycles, missing configs, disconnected nodes
- **Export/Import** — save and load pipelines as JSON files
- **Keyboard shortcuts** — Ctrl+S (save), Ctrl+Enter (run), Ctrl+E (export)
- **Responsive layout** — adapts to tablet and mobile screens
- **Error boundary** — graceful crash recovery

### ⚙️ Backend
- **Pipeline storage** — save/load pipelines to SQLite via REST API
- **Execution engine** — topological sort, async LLM/API calls, branch-aware routing
- **Flow validation** — cycle detection, config checks, reachability analysis
- **LLM integration** — OpenAI and Google Gemini with provider status indicators

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** 18+ and **npm**
- **Python** 3.11+

### 1. Clone the repo
```bash
git clone https://github.com/omskurtttttt/ai-pipeline-builder.git
cd ai-pipeline-builder
```

### 2. Backend setup
```bash
cd backend
python -m venv venv

# Windows
.\venv\Scripts\activate
# macOS/Linux
source venv/bin/activate

pip install -r requirements.txt
```

#### Environment variables (optional, for LLM nodes)
```bash
cp .env.example .env
# Edit .env and add your API keys:
# OPENAI_API_KEY=sk-...
# GEMINI_API_KEY=AI...
```

#### Start the backend
```bash
uvicorn main:app --reload --port 8000
```

### 3. Frontend setup
```bash
cd frontend
npm install
npm run dev
```

Open **http://localhost:5173** in your browser.

---

## 🏗️ Project Structure

```
ai-pipeline-builder/
├── backend/
│   ├── main.py              # FastAPI app entry point
│   ├── database.py          # SQLite + SQLAlchemy setup
│   ├── models.py            # Database models
│   ├── schemas.py           # Pydantic schemas
│   ├── executor.py          # Pipeline execution engine
│   ├── validator.py         # Flow validation logic
│   ├── llm_service.py       # OpenAI / Gemini integration
│   └── routers/
│       ├── pipelines.py     # CRUD endpoints for pipelines
│       ├── execution.py     # Pipeline execution endpoint
│       ├── llm.py           # LLM provider status
│       └── validation.py    # Pipeline validation endpoint
├── frontend/
│   └── src/
│       ├── App.jsx          # Root component with ErrorBoundary
│       ├── App.css          # Layout, responsive, animations
│       ├── index.css        # Design system (colors, tokens)
│       ├── hooks/
│       │   └── useStore.js  # Zustand state management
│       ├── utils/
│       │   └── api.js       # Backend API client
│       └── components/
│           ├── Canvas.jsx       # React Flow canvas
│           ├── Sidebar.jsx      # Node palette + config panel
│           ├── Toolbar.jsx      # Save/Load/Run/Export/Analyze
│           ├── ResultsPanel.jsx # Execution results display
│           ├── ErrorBoundary.jsx
│           └── nodes/
│               ├── InputNode.jsx
│               ├── TextNode.jsx
│               ├── TransformNode.jsx
│               ├── LLMNode.jsx
│               ├── APINode.jsx
│               ├── ConditionNode.jsx
│               ├── OutputNode.jsx
│               ├── FileSaveNode.jsx
│               └── NodeStyles.css
└── .env.example
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/pipelines` | Save a new pipeline |
| `GET` | `/api/pipelines` | List all saved pipelines |
| `GET` | `/api/pipelines/{id}` | Load a specific pipeline |
| `PUT` | `/api/pipelines/{id}` | Update an existing pipeline |
| `DELETE` | `/api/pipelines/{id}` | Delete a pipeline |
| `POST` | `/api/execute` | Execute a pipeline |
| `POST` | `/api/execute/{id}` | Execute a saved pipeline |
| `POST` | `/api/validate` | Validate pipeline flow |
| `GET` | `/api/llm/providers` | Check LLM provider availability |

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+S` | Save pipeline |
| `Ctrl+Enter` | Run pipeline |
| `Ctrl+E` | Export as JSON |
| `Delete` | Delete selected node/edge |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 19, React Flow, Zustand |
| Styling | Vanilla CSS with glassmorphism design |
| Backend | FastAPI, SQLAlchemy, Pydantic |
| Database | SQLite |
| LLM | OpenAI API, Google Gemini API |
| HTTP Client | httpx (async) |

---

## 📄 License

MIT
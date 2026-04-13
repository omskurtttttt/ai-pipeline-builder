# AI Pipeline Builder

A visual, drag-and-drop pipeline builder for constructing AI workflows. Design data processing chains that connect to large language models, make API requests, and transform text data through a straightforward and clean interface.

## Tech Stack

- **Frontend**: React 19, React Flow, Zustand (with Zundo for undo/redo), Vanilla CSS
- **Backend**: FastAPI, Python 3.12+, SQLite, SQLAlchemy
- **Integrations**: OpenAI API, Google Gemini API

## Quick Start

### Prerequisites

- Node.js 18+
- Python 3.11+

### Backend Setup

```bash
git clone https://github.com/omskurtttttt/ai-pipeline-builder.git
cd ai-pipeline-builder/backend

# Create and activate virtual environment
python -m venv venv
.\venv\Scripts\activate     # Windows
# source venv/bin/activate  # macOS/Linux

# Install dependencies and start server
pip install -r requirements.txt
cp .env.example .env        # (Optional) Add your API keys here
uvicorn main:app --reload --port 8000
```

### Frontend Setup

```bash
cd ../frontend
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

## Core Features

- **Visual Workflow Editor**: Intuitive drag-and-drop interface for composing AI logic.
- **Node Library**: 
  - *Data*: Input, Output, File Save
  - *Logic*: Text (Templates), Transform, Condition
  - *Integration*: LLM (OpenAI, Gemini), API Requests
- **Validation & Execution**: Built-in flow validation, topological execution engine, and execution results inspector.
- **Pipeline Management**: Import/Export models to JSON, save to SQLite, and easily load existing pipelines.

## Keyboard Shortcuts

- `Ctrl+S`: Save pipeline
- `Ctrl+Enter`: Run pipeline
- `Ctrl+E`: Export as JSON
- `Ctrl+Z`: Undo action
- `Ctrl+Y` / `Ctrl+Shift+Z`: Redo action
- `Backspace`: Delete selected node or edge

## License

MIT
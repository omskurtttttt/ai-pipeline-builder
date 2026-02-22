import { ReactFlowProvider } from '@xyflow/react'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import './App.css'

function App() {
  return (
    <div className="app">
      {/* ── Toolbar ── */}
      <header className="toolbar">
        <div className="toolbar-brand">
          <div className="toolbar-logo">⚡</div>
          <div>
            <div className="toolbar-title">
              AI Pipeline Builder
              <span className="toolbar-subtitle"> v0.1</span>
            </div>
          </div>
        </div>

        <div className="toolbar-actions">
          <div className="status-dot" title="Backend connected" />
          <button className="btn" title="New Pipeline">
            <span>📄</span> New
          </button>
          <button className="btn" title="Save Pipeline">
            <span>💾</span> Save
          </button>
          <button className="btn" title="Load Pipeline">
            <span>📂</span> Load
          </button>
          <div className="toolbar-divider" />
          <button className="btn btn-primary" title="Run Pipeline">
            <span>▶️</span> Run
          </button>
        </div>
      </header>

      {/* ── Main Content ── */}
      <div className="main-content">
        <Sidebar />
        <ReactFlowProvider>
          <Canvas />
        </ReactFlowProvider>
      </div>
    </div>
  )
}

export default App

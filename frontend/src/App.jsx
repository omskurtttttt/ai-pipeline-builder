import { useCallback } from 'react'
import './App.css'

/* ─── Node type definitions for the palette ─── */
const NODE_TYPES = [
  {
    type: 'inputNode',
    label: 'Input',
    description: 'Data entry point',
    icon: '📥',
    color: '#10b981',
  },
  {
    type: 'llmNode',
    label: 'LLM',
    description: 'AI language model',
    icon: '🧠',
    color: '#7c3aed',
  },
  {
    type: 'outputNode',
    label: 'Output',
    description: 'Display results',
    icon: '📤',
    color: '#3b82f6',
  },
]

function App() {
  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

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
        {/* Sidebar — Node Palette */}
        <aside className="sidebar">
          <div className="sidebar-header">
            <div className="sidebar-title">Node Palette</div>
          </div>
          <div className="sidebar-content">
            {NODE_TYPES.map((node) => (
              <div
                key={node.type}
                className="node-palette-item"
                draggable
                onDragStart={(e) => onDragStart(e, node.type)}
              >
                <div
                  className="node-palette-icon"
                  style={{ background: `${node.color}20`, color: node.color }}
                >
                  {node.icon}
                </div>
                <div className="node-palette-info">
                  <div className="node-palette-name">{node.label}</div>
                  <div className="node-palette-desc">{node.description}</div>
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Canvas Area */}
        <div className="canvas-wrapper">
          <div className="canvas-empty">
            <div className="canvas-empty-icon">🔗</div>
            <div className="canvas-empty-title">Build Your Pipeline</div>
            <div className="canvas-empty-subtitle">
              Drag nodes from the sidebar and connect them to create an AI processing workflow
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App

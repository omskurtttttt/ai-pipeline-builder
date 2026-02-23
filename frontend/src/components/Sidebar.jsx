import { useCallback } from 'react'
import useStore from '../hooks/useStore'
import './Sidebar.css'

/* ─── Node type definitions ─── */
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

/* ─── Node type → color lookup ─── */
const NODE_COLORS = {
  inputNode: '#10b981',
  llmNode: '#7c3aed',
  outputNode: '#3b82f6',
}

/* ─── Node type → icon lookup ─── */
const NODE_ICONS = {
  inputNode: '📥',
  llmNode: '🧠',
  outputNode: '📤',
}

/* ============================================
   CONFIG PANEL — renders fields per node type
   ============================================ */
function ConfigPanel({ node, updateNodeData, onClose }) {
  const { data, type, id } = node

  const handleChange = (key, value) => {
    updateNodeData(id, { [key]: value })
  }

  return (
    <div className="config-panel">
      {/* ── Header ── */}
      <div className="config-header">
        <div className="config-header-left">
          <div
            className="config-icon"
            style={{
              background: `${NODE_COLORS[type]}20`,
              color: NODE_COLORS[type],
            }}
          >
            {NODE_ICONS[type]}
          </div>
          <div>
            <div className="config-node-type">{type.replace('Node', '')}</div>
            <div className="config-node-id">{id}</div>
          </div>
        </div>
        <button className="config-close" onClick={onClose} title="Close">
          ✕
        </button>
      </div>

      {/* ── Fields ── */}
      <div className="config-fields">
        {/* — Label (all nodes) — */}
        <div className="config-field">
          <label className="config-label">Label</label>
          <input
            className="input"
            value={data.label || ''}
            onChange={(e) => handleChange('label', e.target.value)}
            placeholder="Node label"
          />
        </div>

        {/* — Input Node fields — */}
        {type === 'inputNode' && (
          <div className="config-field">
            <label className="config-label">Input Text</label>
            <textarea
              className="input"
              rows={5}
              value={data.inputText || ''}
              onChange={(e) => handleChange('inputText', e.target.value)}
              placeholder="Enter the input data for your pipeline..."
            />
          </div>
        )}

        {/* — LLM Node fields — */}
        {type === 'llmNode' && (
          <>
            <div className="config-field">
              <label className="config-label">Provider</label>
              <select
                className="input"
                value={data.provider || 'openai'}
                onChange={(e) => handleChange('provider', e.target.value)}
              >
                <option value="openai">OpenAI</option>
                <option value="gemini">Google Gemini</option>
              </select>
            </div>

            <div className="config-field">
              <label className="config-label">Model</label>
              <select
                className="input"
                value={data.model || 'gpt-3.5-turbo'}
                onChange={(e) => handleChange('model', e.target.value)}
              >
                {(data.provider === 'gemini') ? (
                  <>
                    <option value="gemini-pro">gemini-pro</option>
                    <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    <option value="gemini-1.5-pro">gemini-1.5-pro</option>
                  </>
                ) : (
                  <>
                    <option value="gpt-3.5-turbo">gpt-3.5-turbo</option>
                    <option value="gpt-4">gpt-4</option>
                    <option value="gpt-4-turbo">gpt-4-turbo</option>
                    <option value="gpt-4o">gpt-4o</option>
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                  </>
                )}
              </select>
            </div>

            <div className="config-field">
              <label className="config-label">
                Temperature
                <span className="config-value">{data.temperature ?? 0.7}</span>
              </label>
              <input
                type="range"
                className="config-slider"
                min="0"
                max="2"
                step="0.1"
                value={data.temperature ?? 0.7}
                onChange={(e) => handleChange('temperature', parseFloat(e.target.value))}
              />
              <div className="config-range-labels">
                <span>Precise</span>
                <span>Creative</span>
              </div>
            </div>

            <div className="config-field">
              <label className="config-label">Max Tokens</label>
              <input
                type="number"
                className="input"
                min="1"
                max="128000"
                value={data.maxTokens ?? 1024}
                onChange={(e) => handleChange('maxTokens', parseInt(e.target.value) || 1024)}
              />
            </div>

            <div className="config-field">
              <label className="config-label">System Prompt</label>
              <textarea
                className="input"
                rows={4}
                value={data.systemPrompt || ''}
                onChange={(e) => handleChange('systemPrompt', e.target.value)}
                placeholder="You are a helpful assistant..."
              />
            </div>
          </>
        )}

        {/* — Output Node fields — */}
        {type === 'outputNode' && (
          <div className="config-field">
            <label className="config-label">Output Format</label>
            <select
              className="input"
              value={data.format || 'text'}
              onChange={(e) => handleChange('format', e.target.value)}
            >
              <option value="text">Plain Text</option>
              <option value="json">JSON</option>
              <option value="markdown">Markdown</option>
            </select>
          </div>
        )}
      </div>
    </div>
  )
}

/* ============================================
   SIDEBAR — NODE PALETTE + CONFIG PANEL
   ============================================ */
export default function Sidebar() {
  const selectedNode = useStore((s) => s.selectedNode)
  const updateNodeData = useStore((s) => s.updateNodeData)
  const setSelectedNode = useStore((s) => s.setSelectedNode)

  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  return (
    <aside className="sidebar">
      {selectedNode ? (
        /* ── Config Mode ── */
        <>
          <div className="sidebar-header">
            <div className="sidebar-title">Configuration</div>
          </div>
          <div className="sidebar-content">
            <ConfigPanel
              node={selectedNode}
              updateNodeData={updateNodeData}
              onClose={() => setSelectedNode(null)}
            />
          </div>
        </>
      ) : (
        /* ── Palette Mode ── */
        <>
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
        </>
      )}
    </aside>
  )
}

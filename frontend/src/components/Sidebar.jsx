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
  {
    type: 'textNode',
    label: 'Text',
    description: 'Static text / template',
    icon: '📝',
    color: '#f59e0b',
  },
  {
    type: 'transformNode',
    label: 'Transform',
    description: 'Transform data',
    icon: '🔄',
    color: '#ec4899',
  },
  {
    type: 'conditionNode',
    label: 'Condition',
    description: 'Branch on condition',
    icon: '🔀',
    color: '#06b6d4',
  },
  {
    type: 'apiNode',
    label: 'API',
    description: 'HTTP request',
    icon: '🌐',
    color: '#f97316',
  },
  {
    type: 'fileSaveNode',
    label: 'File Save',
    description: 'Save output to file',
    icon: '💾',
    color: '#a855f7',
  },
]

/* ─── Node type → color / icon lookups ─── */
const NODE_COLORS = {}
const NODE_ICONS = {}
NODE_TYPES.forEach((n) => {
  NODE_COLORS[n.type] = n.color
  NODE_ICONS[n.type] = n.icon
})

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

        {/* — Input Node — */}
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

        {/* — LLM Node — */}
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

        {/* — Output Node — */}
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

        {/* — Text Node — */}
        {type === 'textNode' && (
          <>
            <div className="config-field">
              <label className="config-label">Template</label>
              <textarea
                className="input"
                rows={5}
                value={data.template || ''}
                onChange={(e) => handleChange('template', e.target.value)}
                placeholder="Enter text or use {{variable}} for template variables..."
              />
            </div>
            <div className="config-hint">
              💡 Use <code>{'{{variable}}'}</code> syntax for template variables that get filled from connected inputs.
            </div>
          </>
        )}

        {/* — Transform Node — */}
        {type === 'transformNode' && (
          <>
            <div className="config-field">
              <label className="config-label">Transform Type</label>
              <select
                className="input"
                value={data.transformType || 'uppercase'}
                onChange={(e) => handleChange('transformType', e.target.value)}
              >
                <option value="uppercase">Uppercase</option>
                <option value="lowercase">Lowercase</option>
                <option value="trim">Trim Whitespace</option>
                <option value="regex_replace">Regex Replace</option>
                <option value="json_extract">JSON Extract</option>
                <option value="split">Split</option>
                <option value="join">Join</option>
              </select>
            </div>

            {(data.transformType === 'regex_replace' || data.transformType === 'split' || data.transformType === 'join') && (
              <div className="config-field">
                <label className="config-label">
                  {data.transformType === 'regex_replace' ? 'Regex Pattern' : 'Delimiter'}
                </label>
                <input
                  className="input"
                  value={data.pattern || ''}
                  onChange={(e) => handleChange('pattern', e.target.value)}
                  placeholder={data.transformType === 'regex_replace' ? '/pattern/flags' : ','}
                />
              </div>
            )}

            {data.transformType === 'regex_replace' && (
              <div className="config-field">
                <label className="config-label">Replacement</label>
                <input
                  className="input"
                  value={data.replacement || ''}
                  onChange={(e) => handleChange('replacement', e.target.value)}
                  placeholder="Replacement string"
                />
              </div>
            )}

            {data.transformType === 'json_extract' && (
              <div className="config-field">
                <label className="config-label">JSON Path</label>
                <input
                  className="input"
                  value={data.pattern || ''}
                  onChange={(e) => handleChange('pattern', e.target.value)}
                  placeholder="e.g. data.results[0].text"
                />
              </div>
            )}
          </>
        )}

        {/* — Condition Node — */}
        {type === 'conditionNode' && (
          <>
            <div className="config-field">
              <label className="config-label">Condition Type</label>
              <select
                className="input"
                value={data.conditionType || 'contains'}
                onChange={(e) => handleChange('conditionType', e.target.value)}
              >
                <option value="contains">Contains</option>
                <option value="equals">Equals</option>
                <option value="not_equals">Not Equals</option>
                <option value="starts_with">Starts With</option>
                <option value="ends_with">Ends With</option>
                <option value="regex_match">Regex Match</option>
                <option value="length_gt">Length Greater Than</option>
                <option value="length_lt">Length Less Than</option>
                <option value="is_empty">Is Empty</option>
                <option value="not_empty">Not Empty</option>
              </select>
            </div>

            {!['is_empty', 'not_empty'].includes(data.conditionType) && (
              <div className="config-field">
                <label className="config-label">Value</label>
                <input
                  className="input"
                  value={data.conditionValue || ''}
                  onChange={(e) => handleChange('conditionValue', e.target.value)}
                  placeholder={data.conditionType === 'regex_match' ? '/pattern/flags' : 'Compare value'}
                />
              </div>
            )}

            <div className="config-branches-info">
              <div className="branch-info">
                <span className="branch-dot true-dot" />
                <span>True → right output (top)</span>
              </div>
              <div className="branch-info">
                <span className="branch-dot false-dot" />
                <span>False → right output (bottom)</span>
              </div>
            </div>
          </>
        )}

        {/* — API Node — */}
        {type === 'apiNode' && (
          <>
            <div className="config-field">
              <label className="config-label">Method</label>
              <select
                className="input"
                value={data.method || 'GET'}
                onChange={(e) => handleChange('method', e.target.value)}
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>
            </div>

            <div className="config-field">
              <label className="config-label">URL</label>
              <input
                className="input"
                value={data.url || ''}
                onChange={(e) => handleChange('url', e.target.value)}
                placeholder="https://api.example.com/data"
              />
            </div>

            <div className="config-field">
              <label className="config-label">Headers (JSON)</label>
              <textarea
                className="input"
                rows={3}
                value={typeof data.headers === 'object' ? JSON.stringify(data.headers, null, 2) : data.headers || ''}
                onChange={(e) => {
                  try {
                    handleChange('headers', JSON.parse(e.target.value))
                  } catch {
                    // Let user type freely — only save when valid JSON
                  }
                }}
                placeholder='{"Authorization": "Bearer ..."}'
              />
            </div>

            {['POST', 'PUT', 'PATCH'].includes(data.method) && (
              <div className="config-field">
                <label className="config-label">Request Body</label>
                <textarea
                  className="input"
                  rows={4}
                  value={data.body || ''}
                  onChange={(e) => handleChange('body', e.target.value)}
                  placeholder='Use {{input}} for connected input data'
                />
              </div>
            )}

            <div className="config-hint">
              💡 Connected input will be appended as query params (GET) or used as body (POST/PUT/PATCH).
            </div>
          </>
        )}

        {/* — File Save Node — */}
        {type === 'fileSaveNode' && (
          <>
            <div className="config-field">
              <label className="config-label">Filename</label>
              <input
                className="input"
                value={data.filename || ''}
                onChange={(e) => handleChange('filename', e.target.value)}
                placeholder="output"
              />
            </div>

            <div className="config-field">
              <label className="config-label">Format</label>
              <select
                className="input"
                value={data.format || 'text'}
                onChange={(e) => handleChange('format', e.target.value)}
              >
                <option value="text">Plain Text (.txt)</option>
                <option value="json">JSON (.json)</option>
                <option value="csv">CSV (.csv)</option>
                <option value="markdown">Markdown (.md)</option>
              </select>
            </div>

            <div className="config-hint">
              💡 The file will be available for download after execution completes.
            </div>
          </>
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

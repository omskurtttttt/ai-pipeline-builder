import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function LLMNode({ data, selected }) {
  return (
    <div className={`custom-node llm-node ${selected ? 'selected' : ''} ${data._executionStatus ? `exec-${data._executionStatus}` : ''}`}>
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(124, 58, 237, 0.15)', color: '#7c3aed' }}>
          🧠
        </div>
        <div className="node-title">{data.label || 'LLM'}</div>
        <div className="node-badge">{data.model || 'gpt-3.5-turbo'}</div>
      </div>
      <div className="node-body">
        <div className="node-meta">
          <span className="meta-item">🌡️ {data.temperature ?? 0.7}</span>
          <span className="meta-item">📝 {data.maxTokens ?? 1024}</span>
        </div>
        {data.systemPrompt && (
          <div className="node-preview">
            {data.systemPrompt.substring(0, 60) + (data.systemPrompt.length > 60 ? '...' : '')}
          </div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="node-handle target-handle" />
      <Handle type="source" position={Position.Right} className="node-handle source-handle" />
    </div>
  )
}

import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

const METHOD_COLORS = {
  GET: '#10b981',
  POST: '#3b82f6',
  PUT: '#f59e0b',
  DELETE: '#ef4444',
  PATCH: '#8b5cf6',
}

export default function APINode({ data, selected }) {
  const method = (data.method || 'GET').toUpperCase()
  const color = METHOD_COLORS[method] || '#64748b'

  return (
    <div className={`custom-node api-node ${selected ? 'selected' : ''} ${data._executionStatus ? `exec-${data._executionStatus}` : ''}`}>
      <div className="node-header">
        <div className="node-icon" style={{ background: `${color}15`, color }}>
          🌐
        </div>
        <div className="node-title">{data.label || 'API'}</div>
        <div className="node-badge" style={{ color, borderColor: `${color}40` }}>
          {method}
        </div>
      </div>
      <div className="node-body">
        {data.url ? (
          <div className="node-preview mono">
            {data.url.length > 50 ? data.url.substring(0, 50) + '...' : data.url}
          </div>
        ) : (
          <div className="node-preview">No URL configured</div>
        )}
        <div className="node-meta">
          {data.headers && Object.keys(data.headers).length > 0 && (
            <span className="meta-item">
              📋 {Object.keys(data.headers).length} header(s)
            </span>
          )}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="node-handle target-handle" />
      <Handle type="source" position={Position.Right} className="node-handle source-handle" />
    </div>
  )
}

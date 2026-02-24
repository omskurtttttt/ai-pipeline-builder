import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

const TRANSFORM_LABELS = {
  uppercase: 'ABC',
  lowercase: 'abc',
  trim: '✂️',
  regex_replace: '.*',
  json_extract: '{}',
  split: '÷',
  join: '+',
}

export default function TransformNode({ data, selected }) {
  const transformType = data.transformType || 'uppercase'

  return (
    <div className={`custom-node transform-node ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(236, 72, 153, 0.15)', color: '#ec4899' }}>
          🔄
        </div>
        <div className="node-title">{data.label || 'Transform'}</div>
        <div className="node-badge">{transformType}</div>
      </div>
      <div className="node-body">
        <div className="node-meta">
          <span className="meta-item">
            <span className="transform-badge">{TRANSFORM_LABELS[transformType] || '?'}</span>
            {transformType.replace('_', ' ')}
          </span>
        </div>
        {(transformType === 'regex_replace' || transformType === 'json_extract') && data.pattern && (
          <div className="node-preview mono">{data.pattern}</div>
        )}
      </div>
      <Handle type="target" position={Position.Left} className="node-handle target-handle" />
      <Handle type="source" position={Position.Right} className="node-handle source-handle" />
    </div>
  )
}

import { Handle, Position } from '@xyflow/react'
import { Shuffle } from 'lucide-react'
import './NodeStyles.css'

const TRANSFORM_LABELS = {
  uppercase: 'ABC',
  lowercase: 'abc',
  trim: 'trim',
  regex_replace: '.*',
  json_extract: '{}',
  split: 'split',
  join: 'join',
}

export default function TransformNode({ data, selected }) {
  const transformType = data.transformType || 'uppercase'

  return (
    <div className={`custom-node transform-node ${selected ? 'selected' : ''} ${data._executionStatus ? `exec-${data._executionStatus}` : ''}`}>
      <div className="node-header">
        <div className="node-icon">
          <Shuffle size={14} strokeWidth={1.5} />
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

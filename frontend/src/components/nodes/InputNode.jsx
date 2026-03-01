import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function InputNode({ data, selected }) {
  return (
    <div className={`custom-node input-node ${selected ? 'selected' : ''} ${data._executionStatus ? `exec-${data._executionStatus}` : ''}`}>
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
          📥
        </div>
        <div className="node-title">{data.label || 'Input'}</div>
      </div>
      <div className="node-body">
        <div className="node-preview">
          {data.inputText ? data.inputText.substring(0, 50) + (data.inputText.length > 50 ? '...' : '') : 'No input configured'}
        </div>
      </div>
      <Handle type="source" position={Position.Right} className="node-handle source-handle" />
    </div>
  )
}

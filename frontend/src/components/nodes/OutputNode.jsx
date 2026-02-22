import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function OutputNode({ data, selected }) {
  return (
    <div className={`custom-node output-node ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(59, 130, 246, 0.15)', color: '#3b82f6' }}>
          📤
        </div>
        <div className="node-title">{data.label || 'Output'}</div>
        <div className="node-badge">{data.format || 'text'}</div>
      </div>
      <div className="node-body">
        <div className="node-preview">Results will appear here</div>
      </div>
      <Handle type="target" position={Position.Left} className="node-handle target-handle" />
    </div>
  )
}

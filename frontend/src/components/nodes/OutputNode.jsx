import { Handle, Position } from '@xyflow/react'
import { ArrowUpFromLine } from 'lucide-react'
import './NodeStyles.css'

export default function OutputNode({ data, selected }) {
  return (
    <div className={`custom-node output-node ${selected ? 'selected' : ''} ${data._executionStatus ? `exec-${data._executionStatus}` : ''}`}>
      <div className="node-header">
        <div className="node-icon">
          <ArrowUpFromLine size={14} strokeWidth={1.5} />
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

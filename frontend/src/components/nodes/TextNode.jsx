import { Handle, Position } from '@xyflow/react'
import { FileText } from 'lucide-react'
import './NodeStyles.css'

export default function TextNode({ data, selected }) {
  return (
    <div className={`custom-node text-node ${selected ? 'selected' : ''} ${data._executionStatus ? `exec-${data._executionStatus}` : ''}`}>
      <div className="node-header">
        <div className="node-icon">
          <FileText size={14} strokeWidth={1.5} />
        </div>
        <div className="node-title">{data.label || 'Text'}</div>
      </div>
      <div className="node-body">
        <div className="node-preview">
          {data.template
            ? data.template.substring(0, 60) + (data.template.length > 60 ? '...' : '')
            : 'No template configured'}
        </div>
        {data.template && data.template.includes('{{') && (
          <div className="node-tag-row">
            {[...data.template.matchAll(/\{\{(\w+)\}\}/g)].slice(0, 3).map((m, i) => (
              <span key={i} className="node-tag">{`{{${m[1]}}}`}</span>
            ))}
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Right} className="node-handle source-handle" />
    </div>
  )
}

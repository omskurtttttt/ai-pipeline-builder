import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

const FORMAT_LABELS = {
  text: '📄 .txt',
  json: '📋 .json',
  csv: '📊 .csv',
  markdown: '📝 .md',
}

export default function FileSaveNode({ data, selected }) {
  const format = data.format || 'text'

  return (
    <div className={`custom-node filesave-node ${selected ? 'selected' : ''} ${data._executionStatus ? `exec-${data._executionStatus}` : ''}`}>
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7' }}>
          💾
        </div>
        <div className="node-title">{data.label || 'File Save'}</div>
        <div className="node-badge">{FORMAT_LABELS[format] || format}</div>
      </div>
      <div className="node-body">
        <div className="node-preview mono">
          {data.filename || 'output'}.{format === 'markdown' ? 'md' : format === 'text' ? 'txt' : format}
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="node-handle target-handle" />
    </div>
  )
}

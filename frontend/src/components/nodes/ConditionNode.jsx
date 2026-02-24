import { Handle, Position } from '@xyflow/react'
import './NodeStyles.css'

export default function ConditionNode({ data, selected }) {
  return (
    <div className={`custom-node condition-node ${selected ? 'selected' : ''}`}>
      <div className="node-header">
        <div className="node-icon" style={{ background: 'rgba(6, 182, 212, 0.15)', color: '#06b6d4' }}>
          🔀
        </div>
        <div className="node-title">{data.label || 'Condition'}</div>
        <div className="node-badge">{data.conditionType || 'contains'}</div>
      </div>
      <div className="node-body">
        {data.conditionValue && (
          <div className="node-preview mono">
            {data.conditionType || 'contains'}: "{data.conditionValue}"
          </div>
        )}
        <div className="condition-branches">
          <div className="condition-branch true-branch">
            <span className="branch-dot true-dot" />
            True
          </div>
          <div className="condition-branch false-branch">
            <span className="branch-dot false-dot" />
            False
          </div>
        </div>
      </div>
      <Handle type="target" position={Position.Left} className="node-handle target-handle" />
      <Handle
        type="source"
        position={Position.Right}
        id="true"
        className="node-handle source-handle true-handle"
        style={{ top: '40%' }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="false"
        className="node-handle source-handle false-handle"
        style={{ top: '70%' }}
      />
    </div>
  )
}

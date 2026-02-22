import { useCallback } from 'react'

const NODE_TYPES = [
  {
    type: 'inputNode',
    label: 'Input',
    description: 'Data entry point',
    icon: '📥',
    color: '#10b981',
  },
  {
    type: 'llmNode',
    label: 'LLM',
    description: 'AI language model',
    icon: '🧠',
    color: '#7c3aed',
  },
  {
    type: 'outputNode',
    label: 'Output',
    description: 'Display results',
    icon: '📤',
    color: '#3b82f6',
  },
]

export default function Sidebar() {
  const onDragStart = useCallback((event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType)
    event.dataTransfer.effectAllowed = 'move'
  }, [])

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-title">Node Palette</div>
      </div>
      <div className="sidebar-content">
        {NODE_TYPES.map((node) => (
          <div
            key={node.type}
            className="node-palette-item"
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
          >
            <div
              className="node-palette-icon"
              style={{ background: `${node.color}20`, color: node.color }}
            >
              {node.icon}
            </div>
            <div className="node-palette-info">
              <div className="node-palette-name">{node.label}</div>
              <div className="node-palette-desc">{node.description}</div>
            </div>
          </div>
        ))}
      </div>
    </aside>
  )
}

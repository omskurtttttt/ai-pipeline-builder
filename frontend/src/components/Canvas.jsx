import { useCallback, useRef, useMemo } from 'react'
import {
  ReactFlow,
  Controls,
  MiniMap,
  Background,
  BackgroundVariant,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import InputNode from './nodes/InputNode'
import LLMNode from './nodes/LLMNode'
import OutputNode from './nodes/OutputNode'
import TextNode from './nodes/TextNode'
import TransformNode from './nodes/TransformNode'
import ConditionNode from './nodes/ConditionNode'
import APINode from './nodes/APINode'
import useStore from '../hooks/useStore'
import './Canvas.css'

/* ─── Register custom node types ─── */
const nodeTypes = {
  inputNode: InputNode,
  llmNode: LLMNode,
  outputNode: OutputNode,
  textNode: TextNode,
  transformNode: TransformNode,
  conditionNode: ConditionNode,
  apiNode: APINode,
}

export default function Canvas() {
  const reactFlowWrapper = useRef(null)
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setSelectedNode,
  } = useStore()
  const executionResults = useStore((s) => s.executionResults)

  /* ─── Inject execution status into nodes ─── */
  const enhancedNodes = useMemo(() => {
    if (!executionResults?.results) return nodes
    return nodes.map((node) => {
      const result = executionResults.results[node.id]
      if (!result) return node
      return {
        ...node,
        data: {
          ...node.data,
          _executionStatus: result.status,
          _executionDuration: result.duration_ms,
        },
      }
    })
  }, [nodes, executionResults])

  /* ─── Handle drop from sidebar ─── */
  const onDragOver = useCallback((event) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'move'
  }, [])

  const onDrop = useCallback(
    (event) => {
      event.preventDefault()

      const type = event.dataTransfer.getData('application/reactflow')
      if (!type) return

      const bounds = reactFlowWrapper.current.getBoundingClientRect()
      const position = {
        x: event.clientX - bounds.left - 100,
        y: event.clientY - bounds.top - 30,
      }

      addNode(type, position)
    },
    [addNode]
  )

  /* ─── Node click → select ─── */
  const onNodeClick = useCallback(
    (_event, node) => {
      setSelectedNode(node)
    },
    [setSelectedNode]
  )

  /* ─── Deselect on pane click ─── */
  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
  }, [setSelectedNode])

  return (
    <div className="canvas-wrapper" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={enhancedNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onPaneClick={onPaneClick}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
        defaultEdgeOptions={{
          type: 'smoothstep',
          animated: true,
          style: { stroke: '#7c3aed', strokeWidth: 2 },
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="rgba(255, 255, 255, 0.05)"
        />
        <Controls className="canvas-controls" />
        <MiniMap
          className="canvas-minimap"
          nodeColor={(node) => {
            switch (node.type) {
              case 'inputNode': return '#10b981'
              case 'llmNode': return '#7c3aed'
              case 'outputNode': return '#3b82f6'
              case 'textNode': return '#f59e0b'
              case 'transformNode': return '#ec4899'
              case 'conditionNode': return '#06b6d4'
              case 'apiNode': return '#f97316'
              default: return '#64748b'
            }
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          style={{ background: 'rgba(18, 18, 26, 0.9)' }}
        />
      </ReactFlow>

      {/* Empty state overlay — only show when no nodes */}
      {nodes.length === 0 && (
        <div className="canvas-empty">
          <div className="canvas-empty-icon">🔗</div>
          <div className="canvas-empty-title">Build Your Pipeline</div>
          <div className="canvas-empty-subtitle">
            Drag nodes from the sidebar and connect them to create an AI processing workflow
          </div>
        </div>
      )}
    </div>
  )
}

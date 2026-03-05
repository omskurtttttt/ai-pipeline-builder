import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'

let nodeId = 0
const getNodeId = () => `node_${++nodeId}`

const useStore = create((set, get) => ({
    /* ─── Nodes & Edges ─── */
    nodes: [],
    edges: [],
    setNodes: (nodes) => set({ nodes }),
    setEdges: (edges) => set({ edges }),

    onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) })
    },

    onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) })
    },

    onConnect: (connection) => {
        const edge = {
            ...connection,
            id: `edge_${Date.now()}`,
            type: 'smoothstep',
            animated: true,
            style: { stroke: '#7c3aed', strokeWidth: 2 },
        }
        set({ edges: addEdge(edge, get().edges) })
    },

    /* ─── Add Node ─── */
    addNode: (type, position) => {
        const defaults = {
            inputNode: { label: 'Input', inputText: '' },
            llmNode: { label: 'LLM', model: 'gemini-2.5-flash', provider: 'gemini', temperature: 0.7, systemPrompt: '', maxTokens: 1024 },
            outputNode: { label: 'Output', format: 'text' },
            textNode: { label: 'Text', template: '' },
            transformNode: { label: 'Transform', transformType: 'uppercase', pattern: '', replacement: '' },
            conditionNode: { label: 'Condition', conditionType: 'contains', conditionValue: '' },
            apiNode: { label: 'API', method: 'GET', url: '', headers: {}, body: '' },
            fileSaveNode: { label: 'File Save', filename: 'output', format: 'text' },
        }

        const newNode = {
            id: getNodeId(),
            type,
            position,
            data: { ...defaults[type] } || { label: type },
        }

        set({ nodes: [...get().nodes, newNode] })
    },

    /* ─── Selection ─── */
    selectedNode: null,
    setSelectedNode: (node) => set({ selectedNode: node }),

    /* ─── Update Node Data ─── */
    updateNodeData: (nodeId, newData) => {
        const updatedNodes = get().nodes.map((n) =>
            n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
        )
        const selectedNode = get().selectedNode
        set({
            nodes: updatedNodes,
            // Keep selectedNode in sync so config panel reflects latest data
            selectedNode:
                selectedNode && selectedNode.id === nodeId
                    ? { ...selectedNode, data: { ...selectedNode.data, ...newData } }
                    : selectedNode,
        })
    },

    /* ─── Execution ─── */
    isExecuting: false,
    executionResults: null,  // { status, results, errors, duration_ms, ... }
    setExecuting: (running) => set({ isExecuting: running }),
    setExecutionResults: (results) => set({ executionResults: results }),
    clearExecutionResults: () => set({ executionResults: null }),
}))

export default useStore

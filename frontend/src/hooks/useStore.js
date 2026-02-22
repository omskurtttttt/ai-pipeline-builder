import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'

let nodeId = 0
const getNodeId = () => `node_${++nodeId}`

const useStore = create((set, get) => ({
    /* ─── Nodes & Edges ─── */
    nodes: [],
    edges: [],

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
            llmNode: { label: 'LLM', model: 'gpt-3.5-turbo', temperature: 0.7, systemPrompt: '', maxTokens: 1024 },
            outputNode: { label: 'Output', format: 'text' },
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
        set({
            nodes: get().nodes.map((n) =>
                n.id === nodeId ? { ...n, data: { ...n.data, ...newData } } : n
            ),
        })
    },
}))

export default useStore

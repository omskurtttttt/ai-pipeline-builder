import { useState, useEffect, useCallback } from 'react'
import useStore from '../hooks/useStore'
import { savePipeline, updatePipeline, listPipelines, loadPipeline, deletePipeline, executePipeline } from '../utils/api'
import './Toolbar.css'

export default function Toolbar() {
  const nodes = useStore((s) => s.nodes)
  const edges = useStore((s) => s.edges)
  const setNodes = useStore((s) => s.setNodes)
  const setEdges = useStore((s) => s.setEdges)
  const isExecuting = useStore((s) => s.isExecuting)
  const setExecuting = useStore((s) => s.setExecuting)
  const setExecutionResults = useStore((s) => s.setExecutionResults)

  const [pipelineName, setPipelineName] = useState('Untitled Pipeline')
  const [pipelineId, setPipelineId] = useState(null)
  const [showLoadModal, setShowLoadModal] = useState(false)
  const [savedPipelines, setSavedPipelines] = useState([])
  const [saving, setSaving] = useState(false)
  const [status, setStatus] = useState(null) // { type, message }

  /* ─── Show status message ─── */
  const showStatus = useCallback((type, message) => {
    setStatus({ type, message })
    setTimeout(() => setStatus(null), 3000)
  }, [])

  /* ─── Save ─── */
  const handleSave = useCallback(async () => {
    setSaving(true)
    try {
      if (pipelineId) {
        await updatePipeline(pipelineId, {
          name: pipelineName,
          nodes,
          edges,
        })
        showStatus('success', 'Pipeline saved!')
      } else {
        const result = await savePipeline(pipelineName, nodes, edges)
        setPipelineId(result.id)
        showStatus('success', 'Pipeline created!')
      }
    } catch (err) {
      showStatus('error', err.message)
    }
    setSaving(false)
  }, [pipelineId, pipelineName, nodes, edges, showStatus])

  /* ─── Load modal ─── */
  const handleOpenLoad = useCallback(async () => {
    try {
      const list = await listPipelines()
      setSavedPipelines(list)
      setShowLoadModal(true)
    } catch (err) {
      showStatus('error', 'Failed to load pipelines')
    }
  }, [showStatus])

  const handleLoad = useCallback(async (id) => {
    try {
      const pipeline = await loadPipeline(id)
      setNodes(pipeline.nodes)
      setEdges(pipeline.edges)
      setPipelineName(pipeline.name)
      setPipelineId(pipeline.id)
      setShowLoadModal(false)
      showStatus('success', `Loaded "${pipeline.name}"`)
    } catch (err) {
      showStatus('error', err.message)
    }
  }, [setNodes, setEdges, showStatus])

  const handleDelete = useCallback(async (id, e) => {
    e.stopPropagation()
    if (!confirm('Delete this pipeline?')) return
    try {
      await deletePipeline(id)
      setSavedPipelines((prev) => prev.filter((p) => p.id !== id))
      if (pipelineId === id) {
        setPipelineId(null)
      }
      showStatus('success', 'Pipeline deleted')
    } catch (err) {
      showStatus('error', err.message)
    }
  }, [pipelineId, showStatus])

  /* ─── New ─── */
  const handleNew = useCallback(() => {
    setNodes([])
    setEdges([])
    setPipelineName('Untitled Pipeline')
    setPipelineId(null)
    showStatus('info', 'New pipeline created')
  }, [setNodes, setEdges, showStatus])

  /* ─── Run Pipeline ─── */
  const handleRun = useCallback(async () => {
    if (nodes.length === 0) {
      showStatus('error', 'Add some nodes before running')
      return
    }
    setExecuting(true)
    try {
      const result = await executePipeline(nodes, edges)
      setExecutionResults(result)
      if (result.status === 'completed') {
        showStatus('success', `Pipeline executed in ${result.duration_ms}ms`)
      } else if (result.status === 'completed_with_errors') {
        showStatus('error', `Completed with ${result.errors.length} error(s)`)
      } else {
        showStatus('error', result.error || 'Execution failed')
      }
    } catch (err) {
      showStatus('error', err.message)
    }
    setExecuting(false)
  }, [nodes, edges, showStatus, setExecuting, setExecutionResults])

  /* ─── Keyboard shortcuts ─── */
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault()
        handleSave()
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave, handleRun])

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <div className="toolbar-logo">⚡</div>
        <div>
          <div className="toolbar-title">
            AI Pipeline Builder
            <span className="toolbar-subtitle"> v0.1</span>
          </div>
        </div>
      </div>

      {/* ── Pipeline Name ── */}
      <div className="toolbar-center">
        <input
          className="toolbar-name-input"
          value={pipelineName}
          onChange={(e) => setPipelineName(e.target.value)}
          placeholder="Pipeline name..."
        />
        {pipelineId && <span className="toolbar-id">#{pipelineId}</span>}
      </div>

      {/* ── Actions ── */}
      <div className="toolbar-actions">
        <button className="btn" onClick={handleNew} title="New Pipeline (fresh canvas)">
          <span>📄</span> New
        </button>
        <button className="btn" onClick={handleSave} disabled={saving} title="Save Pipeline (Ctrl+S)">
          <span>{saving ? '⏳' : '💾'}</span> {saving ? 'Saving...' : 'Save'}
        </button>
        <button className="btn" onClick={handleOpenLoad} title="Load Pipeline">
          <span>📂</span> Load
        </button>
        <div className="toolbar-divider" />
        <button className="btn btn-primary" onClick={handleRun} disabled={isExecuting} title="Run Pipeline (Ctrl+Enter)">
          <span>{isExecuting ? '⏳' : '▶️'}</span> {isExecuting ? 'Running...' : 'Run'}
        </button>
      </div>

      {/* ── Status Toast ── */}
      {status && (
        <div className={`toolbar-toast toast-${status.type}`}>
          {status.type === 'success' && '✅'}
          {status.type === 'error' && '❌'}
          {status.type === 'info' && 'ℹ️'}
          {' '}{status.message}
        </div>
      )}

      {/* ── Load Modal ── */}
      {showLoadModal && (
        <div className="modal-overlay" onClick={() => setShowLoadModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Load Pipeline</h3>
              <button className="config-close" onClick={() => setShowLoadModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {savedPipelines.length === 0 ? (
                <div className="modal-empty">No saved pipelines yet</div>
              ) : (
                <div className="pipeline-list">
                  {savedPipelines.map((p) => (
                    <div key={p.id} className="pipeline-list-item" onClick={() => handleLoad(p.id)}>
                      <div className="pipeline-list-info">
                        <div className="pipeline-list-name">{p.name}</div>
                        <div className="pipeline-list-date">
                          {new Date(p.updated_at).toLocaleDateString()} {new Date(p.updated_at).toLocaleTimeString()}
                        </div>
                      </div>
                      <button className="btn-icon-sm" onClick={(e) => handleDelete(p.id, e)} title="Delete">
                        🗑️
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}

import { useState, useEffect, useCallback, useRef } from 'react'
import useStore from '../hooks/useStore'
import { savePipeline, updatePipeline, listPipelines, loadPipeline, deletePipeline, executePipeline, getProviders, validatePipeline } from '../utils/api'
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
  const [providers, setProviders] = useState({ openai: false, gemini: false })

  /* ─── Check LLM provider availability on mount ─── */
  useEffect(() => {
    getProviders()
      .then((data) => setProviders(data.providers))
      .catch(() => {}) // silently fail if backend isn't running
  }, [])

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

  /* ─── Export pipeline as JSON ─── */
  const handleExport = useCallback(() => {
    const pipeline = {
      name: pipelineName,
      nodes,
      edges,
      exportedAt: new Date().toISOString(),
      version: '0.1.0',
    }
    const blob = new Blob([JSON.stringify(pipeline, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${pipelineName.replace(/\s+/g, '-').toLowerCase()}.json`
    a.click()
    URL.revokeObjectURL(url)
    showStatus('success', 'Pipeline exported!')
  }, [nodes, edges, pipelineName, showStatus])

  /* ─── Import pipeline from JSON ─── */
  const fileInputRef = useRef(null)
  const handleImport = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  const handleFileChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const pipeline = JSON.parse(evt.target.result)
        if (pipeline.nodes && pipeline.edges) {
          setNodes(pipeline.nodes)
          setEdges(pipeline.edges)
          setPipelineName(pipeline.name || 'Imported Pipeline')
          setPipelineId(null)
          showStatus('success', `Imported "${pipeline.name || 'pipeline'}"!`)
        } else {
          showStatus('error', 'Invalid pipeline file')
        }
      } catch {
        showStatus('error', 'Failed to parse pipeline file')
      }
    }
    reader.readAsText(file)
    e.target.value = '' // reset so same file can be imported again
  }, [setNodes, setEdges, showStatus])

  /* ─── Keyboard shortcuts help ─── */
  const [showShortcuts, setShowShortcuts] = useState(false)
  const [validationResults, setValidationResults] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  /* ─── Analyze pipeline ─── */
  const handleAnalyze = useCallback(async () => {
    setIsAnalyzing(true)
    setValidationResults(null)
    try {
      const result = await validatePipeline(nodes, edges)
      setValidationResults(result)
    } catch (err) {
      showStatus('error', 'Validation failed: ' + err.message)
    }
    setIsAnalyzing(false)
  }, [nodes, edges, showStatus])

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
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault()
        handleExport()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleSave, handleRun, handleExport])

  /* ─── Click outside to close panels ─── */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest('.toolbar')) {
        setShowShortcuts(false)
        setValidationResults(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <header className="toolbar">
      <div className="toolbar-brand">
        <div className="toolbar-logo">⚡</div>
        <div>
          <div className="toolbar-title">
            AI Pipeline Builder
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
        <button className="btn" onClick={handleExport} title="Export Pipeline as JSON (Ctrl+E)">
          <span>⬇️</span> Export
        </button>
        <button className="btn" onClick={handleImport} title="Import Pipeline from JSON">
          <span>⬆️</span> Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <div className="toolbar-divider" />
        <div className="provider-status" title={`OpenAI: ${providers.openai ? 'configured' : 'not set'} | Gemini: ${providers.gemini ? 'configured' : 'not set'}`}>
          <span className={`provider-dot ${providers.openai ? 'active' : ''}`}>O</span>
          <span className={`provider-dot ${providers.gemini ? 'active' : ''}`}>G</span>
        </div>
        <button className="btn btn-primary" onClick={handleRun} disabled={isExecuting} title="Run Pipeline (Ctrl+Enter)">
          <span>{isExecuting ? '⏳' : '▶️'}</span> {isExecuting ? 'Running...' : 'Run'}
        </button>
        <button className={`btn ${validationResults ? (validationResults.valid ? 'btn-success' : 'btn-warning') : ''}`} onClick={handleAnalyze} disabled={isAnalyzing} title="Analyze Pipeline">
          <span>{isAnalyzing ? '⏳' : '🔍'}</span> {isAnalyzing ? 'Analyzing...' : 'Analyze'}
        </button>
        <div className="toolbar-divider" />
        <button className="btn btn-ghost" onClick={() => { setShowShortcuts(!showShortcuts); setValidationResults(null) }} title="Keyboard Shortcuts">
          ⌨️
        </button>
      </div>

      {/* ── Shortcuts Tooltip ── */}
      {showShortcuts && (
        <div className="shortcuts-panel">
          <div className="shortcuts-title">Keyboard Shortcuts</div>
          <div className="shortcut-row"><kbd>Ctrl+S</kbd> <span>Save pipeline</span></div>
          <div className="shortcut-row"><kbd>Ctrl+Enter</kbd> <span>Run pipeline</span></div>
          <div className="shortcut-row"><kbd>Ctrl+E</kbd> <span>Export as JSON</span></div>
          <div className="shortcut-row"><kbd>Delete / Backspace</kbd> <span>Delete selected</span></div>
        </div>
      )}

      {/* ── Validation Results Dropdown ── */}
      {validationResults && (
        <div className="validation-panel">
          <div className="validation-header">
            <div className="validation-summary">
              {validationResults.valid ? '✅' : '⚠️'} {validationResults.summary}
            </div>
            <button className="config-close" onClick={() => setValidationResults(null)}>✕</button>
          </div>
          {validationResults.issues.length > 0 && (
            <div className="validation-issues">
              {validationResults.issues.map((issue, i) => (
                <div key={i} className={`validation-issue severity-${issue.severity}`}>
                  <span className="issue-icon">
                    {issue.severity === 'error' && '❌'}
                    {issue.severity === 'warning' && '⚠️'}
                    {issue.severity === 'info' && 'ℹ️'}
                  </span>
                  <span>{issue.message}</span>
                </div>
              ))}
            </div>
          )}
          <div className="validation-footer">
            {validationResults.node_count} nodes · {validationResults.edge_count} edges
          </div>
        </div>
      )}

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

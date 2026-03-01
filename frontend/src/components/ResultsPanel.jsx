import { useMemo } from 'react'
import useStore from '../hooks/useStore'
import './ResultsPanel.css'

const STATUS_ICONS = {
  completed: '✅',
  error: '❌',
  running: '⏳',
}

const TYPE_LABELS = {
  inputNode: 'Input',
  llmNode: 'LLM',
  outputNode: 'Output',
  textNode: 'Text',
  transformNode: 'Transform',
  conditionNode: 'Condition',
  apiNode: 'API',
}

export default function ResultsPanel() {
  const executionResults = useStore((s) => s.executionResults)
  const isExecuting = useStore((s) => s.isExecuting)
  const clearExecutionResults = useStore((s) => s.clearExecutionResults)

  const nodeResults = useMemo(() => {
    if (!executionResults?.results) return []
    return Object.entries(executionResults.results).map(([nodeId, result]) => ({
      nodeId,
      ...result,
    }))
  }, [executionResults])

  if (!executionResults && !isExecuting) return null

  return (
    <div className="results-panel">
      {/* ── Header ── */}
      <div className="results-header">
        <div className="results-header-left">
          <div className="results-title">
            {isExecuting ? '⏳ Running...' : '📊 Execution Results'}
          </div>
          {executionResults && (
            <div className="results-meta">
              <span className={`results-status status-${executionResults.status}`}>
                {executionResults.status === 'completed' && '✅ Success'}
                {executionResults.status === 'completed_with_errors' && '⚠️ Partial'}
                {executionResults.status === 'error' && '❌ Failed'}
              </span>
              <span className="results-duration">
                {executionResults.duration_ms}ms
              </span>
              <span className="results-count">
                {executionResults.executed_count}/{executionResults.node_count} nodes
              </span>
            </div>
          )}
        </div>
        <button className="config-close" onClick={clearExecutionResults} title="Close">
          ✕
        </button>
      </div>

      {/* ── Loading State ── */}
      {isExecuting && (
        <div className="results-loading">
          <div className="loading-spinner" />
          <span>Executing pipeline...</span>
        </div>
      )}

      {/* ── Error Message ── */}
      {executionResults?.error && (
        <div className="results-error-banner">
          <span>❌</span>
          <span>{executionResults.error}</span>
        </div>
      )}

      {/* ── Node Results ── */}
      {nodeResults.length > 0 && (
        <div className="results-list">
          {nodeResults.map((result) => (
            <div key={result.nodeId} className={`result-item status-${result.status}`}>
              <div className="result-item-header">
                <div className="result-item-left">
                  <span className="result-status-icon">
                    {STATUS_ICONS[result.status] || '⬜'}
                  </span>
                  <span className="result-node-type">
                    {TYPE_LABELS[result.node_type] || result.node_type}
                  </span>
                  <span className="result-node-id">{result.nodeId}</span>
                </div>
                <span className="result-duration">{result.duration_ms}ms</span>
              </div>

              {/* Output */}
              {result.output !== null && result.output !== undefined && (
                <div className="result-output">
                  <pre className="result-output-text">
                    {typeof result.output === 'string'
                      ? result.output.length > 500
                        ? result.output.substring(0, 500) + '...'
                        : result.output
                      : JSON.stringify(result.output, null, 2)
                    }
                  </pre>
                </div>
              )}

              {/* Condition branch */}
              {result.branch && (
                <div className="result-branch">
                  Branch: <span className={`branch-label ${result.branch}`}>
                    {result.branch}
                  </span>
                </div>
              )}

              {/* Error */}
              {result.error && (
                <div className="result-error">
                  {result.error}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

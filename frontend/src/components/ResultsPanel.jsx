import { useMemo, useState } from 'react'
import {
  CheckCircle2,
  XCircle,
  Loader2,
  BarChart2,
  X,
  ArrowDownToLine,
  BrainCircuit,
  ArrowUpFromLine,
  FileText,
  Shuffle,
  GitBranch,
  Globe,
  HardDrive,
  Square,
  ChevronDown,
} from 'lucide-react'
import useStore from '../hooks/useStore'
import './ResultsPanel.css'

const STATUS_ICONS = {
  completed: <CheckCircle2 size={13} strokeWidth={1.5} className="status-icon-ok" />,
  error: <XCircle size={13} strokeWidth={1.5} className="status-icon-err" />,
  running: <Loader2 size={13} strokeWidth={1.5} className="spinning" />,
}

const NODE_ICONS = {
  inputNode: <ArrowDownToLine size={12} strokeWidth={1.5} />,
  llmNode: <BrainCircuit size={12} strokeWidth={1.5} />,
  outputNode: <ArrowUpFromLine size={12} strokeWidth={1.5} />,
  textNode: <FileText size={12} strokeWidth={1.5} />,
  transformNode: <Shuffle size={12} strokeWidth={1.5} />,
  conditionNode: <GitBranch size={12} strokeWidth={1.5} />,
  apiNode: <Globe size={12} strokeWidth={1.5} />,
  fileSaveNode: <HardDrive size={12} strokeWidth={1.5} />,
}

const TYPE_LABELS = {
  inputNode: 'Input',
  llmNode: 'LLM',
  outputNode: 'Output',
  textNode: 'Text',
  transformNode: 'Transform',
  conditionNode: 'Condition',
  apiNode: 'API',
  fileSaveNode: 'File Save',
}

export default function ResultsPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false)
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
            {isExecuting
              ? <><Loader2 size={13} strokeWidth={1.5} className="spinning" /> Running...</>
              : <><BarChart2 size={13} strokeWidth={1.5} /> Execution Results</>
            }
          </div>
          {executionResults && (
            <div className="results-meta">
              <span className={`results-status status-${executionResults.status}`}>
                {executionResults.status === 'completed' && <><CheckCircle2 size={11} strokeWidth={1.5} /> Success</>}
                {executionResults.status === 'completed_with_errors' && <><XCircle size={11} strokeWidth={1.5} /> Partial</>}
                {executionResults.status === 'error' && <><XCircle size={11} strokeWidth={1.5} /> Failed</>}
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
        <div className="results-header-actions">
          <button 
            className="config-toggle" 
            onClick={() => setIsCollapsed(!isCollapsed)} 
            title={isCollapsed ? "Show results" : "Minimize"}
          >
            <ChevronDown size={14} strokeWidth={1.5} style={{ transform: isCollapsed ? 'rotate(180deg)' : 'rotate(0deg)' }} />
          </button>
          <button className="config-close" onClick={clearExecutionResults} title="Close and clear">
            <X size={14} strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {/* ── Loading State ── */}
      {!isCollapsed && isExecuting && (
        <div className="results-loading">
          <div className="loading-spinner" />
          <span>Executing pipeline...</span>
        </div>
      )}

      {/* ── Error Message ── */}
      {!isCollapsed && executionResults?.error && (
        <div className="results-error-banner">
          <XCircle size={13} strokeWidth={1.5} />
          <span>{executionResults.error}</span>
        </div>
      )}

      {/* ── Node Results ── */}
      {!isCollapsed && nodeResults.length > 0 && (
        <div className="results-list">
          {nodeResults.map((result) => (
            <div key={result.nodeId} className={`result-item status-${result.status}`}>
              <div className="result-item-header">
                <div className="result-item-left">
                  <span className="result-node-icon">
                    {NODE_ICONS[result.node_type] || <Square size={12} strokeWidth={1.5} />}
                  </span>
                  <span className="result-status-icon">
                    {STATUS_ICONS[result.status]}
                  </span>
                  <span className="result-node-type">
                    {TYPE_LABELS[result.node_type] || result.node_type}
                  </span>
                  <span className="result-node-id">{result.nodeId}</span>
                </div>
                <span className="result-duration">{result.duration_ms}ms</span>
              </div>

              {/* Output — scrollable, no cutoff */}
              {result.output !== null && result.output !== undefined && (
                <div className="result-output">
                  <pre className="result-output-text">
                    {typeof result.output === 'string'
                      ? result.output
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

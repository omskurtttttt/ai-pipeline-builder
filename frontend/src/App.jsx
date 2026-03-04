import { ReactFlowProvider } from '@xyflow/react'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import ResultsPanel from './components/ResultsPanel'
import ErrorBoundary from './components/ErrorBoundary'
import './App.css'

function App() {
  return (
    <ErrorBoundary>
      <div className="app">
        {/* ── Toolbar ── */}
        <Toolbar />

        {/* ── Main Content ── */}
        <div className="main-content">
          <Sidebar />
          <ReactFlowProvider>
            <Canvas />
          </ReactFlowProvider>
        </div>

        {/* ── Execution Results ── */}
        <ResultsPanel />
      </div>
    </ErrorBoundary>
  )
}

export default App

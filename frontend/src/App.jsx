import { ReactFlowProvider } from '@xyflow/react'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
import ResultsPanel from './components/ResultsPanel'
import './App.css'

function App() {
  return (
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
  )
}

export default App

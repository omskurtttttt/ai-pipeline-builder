import { ReactFlowProvider } from '@xyflow/react'
import Canvas from './components/Canvas'
import Sidebar from './components/Sidebar'
import Toolbar from './components/Toolbar'
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
    </div>
  )
}

export default App

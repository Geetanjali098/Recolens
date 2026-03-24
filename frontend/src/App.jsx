/**
 * App.jsx
 * -------
 * Root component. Sets up React Router with two pages:
 *   /          → Home (product browser + trending)
 *   /recommend → Recommendation engine UI
 */

import { Routes, Route } from 'react-router-dom'
import Navbar    from './components/Navbar'
import Home      from './pages/Home'
import Recommend from './pages/Recommend'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col bg-cream font-body">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/recommend" element={<Recommend />} />
        </Routes>
      </main>

      {/* Footer */}
      <footer className="border-t border-cream-warm py-6 px-6 text-center text-xs text-ink/30 font-mono">
        RecoLens · Hybrid Recommendation System · Built with FastAPI + React
      </footer>
    </div>
  )
}

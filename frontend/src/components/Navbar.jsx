/**
 * Navbar.jsx
 * ----------
 * Top navigation bar with logo and page links.
 */

import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const { pathname } = useLocation()

  const linkClass = (path) =>
    `text-sm font-medium transition-colors ${
      pathname === path
        ? 'text-amber-spark'
        : 'text-ink/60 hover:text-ink'
    }`

  return (
    <nav className="sticky top-0 z-50 bg-cream/90 backdrop-blur-md border-b border-cream-warm">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl">🔭</span>
          <span className="font-display font-bold text-ink text-xl tracking-tight">
            Reco<span className="text-amber-spark">Lens</span>
          </span>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-6">
          <Link to="/"           className={linkClass('/')}>Home</Link>
          <Link to="/recommend"  className={linkClass('/recommend')}>
            Recommend
          </Link>
          <a
            href="https://github.com"
            target="_blank"
            rel="noreferrer"
            className="text-sm font-medium text-ink/60 hover:text-ink transition-colors"
          >
            GitHub ↗
          </a>
        </div>
      </div>
    </nav>
  )
}

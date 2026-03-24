/**
 * Recommend.jsx
 * -------------
 * Recommendation page:
 *  - User ID input
 *  - Product selector dropdown
 *  - "Get Recommendations" button
 *  - Results: Similar Products | Users Also Liked | Hybrid
 */

import { useState, useEffect } from 'react'
import { fetchProducts, fetchRecommendations } from '../utils/api'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import SectionHeader from '../components/SectionHeader'
import LoadingSpinner from '../components/LoadingSpinner'
import ErrorBanner from '../components/ErrorBanner'

// ── Small tab component ──────────────────────────────────────────────────
function Tab({ label, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors border ${
        active
          ? 'bg-ink text-cream border-ink'
          : 'bg-white text-ink/60 border-cream-warm hover:border-ink/30'
      }`}
    >
      <span>{icon}</span> {label}
    </button>
  )
}

// ── Product grid helper ──────────────────────────────────────────────────
function RecoGrid({ items, emptyMsg }) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center py-12 text-ink/40">
        <p className="text-4xl mb-3">🤔</p>
        <p className="text-sm">{emptyMsg}</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
      {items.map((product, i) => (
        <div
          key={product.product_id}
          className="animate-fade-up"
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'both' }}
        >
          <ProductCard
            product={product}
            score={product.score}
          />
        </div>
      ))}
    </div>
  )
}

// ── Main page ───────────────────────────────────────────────────────────
export default function Recommend() {
  const [products,   setProducts]   = useState([])
  const [userId,     setUserId]     = useState('')
  const [productId,  setProductId]  = useState('')
  const [results,    setResults]    = useState(null)
  const [activeTab,  setActiveTab]  = useState('hybrid')
  const [loading,    setLoading]    = useState(false)
  const [prodLoading, setProdLoading] = useState(true)
  const [error,      setError]      = useState(null)

  // Fetch product list for dropdown
  useEffect(() => {
    fetchProducts()
      .then(res => setProducts(res.data.products))
      .catch(() => setError('Could not load products. Is the backend running?'))
      .finally(() => setProdLoading(false))
  }, [])

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)

    // Validation
    const uid = parseInt(userId)
    const pid = parseInt(productId)

    if (!uid || uid < 1) {
      setError('Please enter a valid User ID (a positive number, e.g. 1–20).')
      return
    }
    if (!pid) {
      setError('Please select a product.')
      return
    }

    setLoading(true)
    setResults(null)

    try {
      const res = await fetchRecommendations(uid, pid, 5)
      setResults(res.data)
      setActiveTab('hybrid')
    } catch (err) {
      if (err.response) {
        setError(`API error ${err.response.status}: ${err.response.data?.detail || 'Unknown error'}`)
      } else if (err.request) {
        setError('Cannot reach the backend. Make sure it is running and VITE_API_URL is correct.')
      } else {
        setError(err.message)
      }
    } finally {
      setLoading(false)
    }
  }

  // Tab config
  const tabs = [
    {
      key:      'hybrid',
      icon:     '⚗️',
      label:    'Hybrid',
      subtitle: 'Best-of-both recommendations fused together',
      items:    results?.hybrid_recommendations,
      emptyMsg: 'No hybrid recommendations available.',
    },
    {
      key:      'content',
      icon:     '🔬',
      label:    'Similar Products',
      subtitle: 'Products with similar category & price',
      items:    results?.content_recommendations,
      emptyMsg: 'No content-based recommendations available.',
    },
    {
      key:      'collab',
      icon:     '👥',
      label:    'Users Also Liked',
      subtitle: 'Loved by people with similar taste',
      items:    results?.collaborative_recommendations,
      emptyMsg: 'No collaborative recommendations available. Try a user ID between 1 and 20.',
    },
  ]

  const activeTabData = tabs.find(t => t.key === activeTab)

  return (
    <div className="min-h-screen">

      {/* ── Page header ─────────────────────────────────────────────── */}
      <div className="bg-ink-soft py-14 px-6 text-center relative overflow-hidden noise-overlay">
        <div className="absolute top-0 left-1/3 w-64 h-64 bg-amber-spark/10 blur-3xl rounded-full pointer-events-none" />
        <h1 className="relative font-display font-bold text-4xl text-cream">
          Get Recommendations
        </h1>
        <p className="relative text-cream/50 mt-2 text-base max-w-md mx-auto">
          Enter your user ID and pick a product to see what our hybrid engine suggests.
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-12 flex flex-col gap-10">

        {/* ── Form card ──────────────────────────────────────────────── */}
        <div className="bg-white rounded-3xl border border-cream-warm shadow-sm p-8">
          <h2 className="font-display font-semibold text-xl text-ink mb-6">
            Configure your query
          </h2>

          <ErrorBanner message={error} onDismiss={() => setError(null)} />

          <form onSubmit={handleSubmit} className="mt-4 flex flex-col md:flex-row gap-4">

            {/* User ID */}
            <div className="flex flex-col gap-1.5 flex-1">
              <label className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                User ID
              </label>
              <input
                type="number"
                min="1"
                placeholder="e.g. 3"
                value={userId}
                onChange={e => setUserId(e.target.value)}
                className="border border-cream-warm rounded-xl px-4 py-3 text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-amber-spark/50 font-mono text-sm"
              />
              <span className="text-xs text-ink/30">Any number 1–20</span>
            </div>

            {/* Product selector */}
            <div className="flex flex-col gap-1.5 flex-[2]">
              <label className="text-xs font-medium text-ink/50 uppercase tracking-wider">
                Reference Product
              </label>
              {prodLoading ? (
                <div className="skeleton h-12 rounded-xl" />
              ) : (
                <select
                  value={productId}
                  onChange={e => setProductId(e.target.value)}
                  className="border border-cream-warm rounded-xl px-4 py-3 text-ink bg-cream/50 focus:outline-none focus:ring-2 focus:ring-amber-spark/50 text-sm"
                >
                  <option value="">— Select a product —</option>
                  {products.map(p => (
                    <option key={p.product_id} value={p.product_id}>
                      [{p.category}] {p.name} — ${p.price}
                    </option>
                  ))}
                </select>
              )}
              <span className="text-xs text-ink/30">We'll find items similar to this</span>
            </div>

            {/* Submit */}
            <div className="flex flex-col justify-end gap-1.5">
              <label className="text-xs font-medium text-ink/50 uppercase tracking-wider invisible">
                Action
              </label>
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-spark hover:bg-amber-glow disabled:opacity-50 disabled:cursor-not-allowed text-ink font-semibold px-8 py-3 rounded-xl transition-colors shadow-sm whitespace-nowrap"
              >
                {loading ? 'Thinking…' : 'Get Recommendations →'}
              </button>
            </div>

          </form>
        </div>

        {/* ── Loading state ──────────────────────────────────────────── */}
        {loading && (
          <LoadingSpinner label="Running hybrid recommendation engine…" />
        )}

        {/* ── Results ───────────────────────────────────────────────── */}
        {results && !loading && (
          <div className="flex flex-col gap-6 animate-fade-up">

            {/* Summary pill */}
            <div className="flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full">
                ✅ Recommendations ready for User #{results.user_id}
              </span>
              <span className="text-xs text-ink/40 font-mono">
                Based on product #{results.product_id} ·{' '}
                {products.find(p => p.product_id === results.product_id)?.name ?? ''}
              </span>
            </div>

            {/* Tab switcher */}
            <div className="flex gap-2 flex-wrap">
              {tabs.map(tab => (
                <Tab
                  key={tab.key}
                  label={tab.label}
                  icon={tab.icon}
                  active={activeTab === tab.key}
                  onClick={() => setActiveTab(tab.key)}
                />
              ))}
            </div>

            {/* Active tab results */}
            <div>
              <SectionHeader
                icon={activeTabData.icon}
                title={activeTabData.label}
                subtitle={activeTabData.subtitle}
              />
              <RecoGrid
                items={activeTabData.items}
                emptyMsg={activeTabData.emptyMsg}
              />
            </div>

          </div>
        )}

        {/* ── Empty state before first query ────────────────────────── */}
        {!results && !loading && (
          <div className="text-center py-20 text-ink/30 flex flex-col items-center gap-4">
            <span className="text-7xl">🔭</span>
            <div>
              <p className="font-display text-xl text-ink/40">Your recommendations will appear here</p>
              <p className="text-sm mt-1">Fill in the form above and click "Get Recommendations"</p>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

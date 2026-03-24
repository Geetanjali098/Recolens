/**
 * Home.jsx
 * --------
 * Landing page showing:
 *  - Hero section with CTA
 *  - Category filter bar
 *  - Trending products grid
 *  - All products grid (filterable)
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { fetchProducts, fetchCategories, fetchTrending } from '../utils/api'
import ProductCard from '../components/ProductCard'
import SkeletonCard from '../components/SkeletonCard'
import SectionHeader from '../components/SectionHeader'
import ErrorBanner from '../components/ErrorBanner'

export default function Home() {
  const [products,   setProducts]   = useState([])
  const [trending,   setTrending]   = useState([])
  const [categories, setCategories] = useState([])
  const [activeCategory, setActiveCategory] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState(null)

  // ── Fetch categories & trending on mount ──────────────────────────────
  useEffect(() => {
    Promise.all([fetchCategories(), fetchTrending(6)])
      .then(([catRes, trendRes]) => {
        setCategories(catRes.data.categories)
        setTrending(trendRes.data.trending)
      })
      .catch(() => setError('Failed to load initial data. Is the backend running?'))
  }, [])

  // ── Fetch products whenever category filter changes ───────────────────
  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchProducts(activeCategory)
      .then(res => setProducts(res.data.products))
      .catch(() => setError('Could not fetch products. Please try again.'))
      .finally(() => setLoading(false))
  }, [activeCategory])

  return (
    <div className="min-h-screen">

      {/* ── Hero ──────────────────────────────────────────────────────── */}
      <section className="relative bg-ink-soft noise-overlay overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 py-24 flex flex-col items-center text-center gap-6">
          {/* Decorative blobs */}
          <div className="absolute -top-20 -left-20 w-80 h-80 rounded-full bg-amber-spark/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -right-20 w-80 h-80 rounded-full bg-sage/20 blur-3xl pointer-events-none" />

          <span className="relative inline-flex items-center gap-2 bg-white/10 text-cream text-xs font-mono px-4 py-1.5 rounded-full border border-white/20">
            <span className="w-2 h-2 rounded-full bg-amber-spark animate-pulse-soft" />
            Hybrid AI · Content + Collaborative Filtering
          </span>

          <h1 className="relative font-display text-5xl md:text-6xl font-bold text-cream leading-tight max-w-3xl">
            Discover products{' '}
            <span className="text-amber-spark italic">made for you</span>
          </h1>

          <p className="relative text-cream/60 max-w-xl text-lg">
            Our hybrid recommendation engine analyses what you like and what people like you love — surfacing the perfect products every time.
          </p>

          <Link
            to="/recommend"
            className="relative mt-2 inline-flex items-center gap-2 bg-amber-spark hover:bg-amber-glow text-ink font-semibold px-8 py-3 rounded-full transition-colors shadow-lg"
          >
            Get Recommendations →
          </Link>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-16">

        {/* ── Error ─────────────────────────────────────────────────── */}
        <ErrorBanner message={error} onDismiss={() => setError(null)} />

        {/* ── Trending ──────────────────────────────────────────────── */}
        {trending.length > 0 && (
          <section>
            <SectionHeader
              icon="🔥"
              title="Trending Now"
              subtitle="Most popular products based on user ratings"
            />
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {trending.map(product => (
                <ProductCard key={product.product_id} product={product} />
              ))}
            </div>
          </section>
        )}

        {/* ── All Products ──────────────────────────────────────────── */}
        <section>
          <SectionHeader
            icon="🛍️"
            title="All Products"
            subtitle="Browse our full catalogue"
          />

          {/* Category filter pills */}
          <div className="flex flex-wrap gap-2 mb-8">
            <button
              onClick={() => setActiveCategory(null)}
              className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                activeCategory === null
                  ? 'bg-ink text-cream border-ink'
                  : 'bg-white text-ink/70 border-cream-warm hover:border-ink/30'
              }`}
            >
              All
            </button>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors border ${
                  activeCategory === cat
                    ? 'bg-ink text-cream border-ink'
                    : 'bg-white text-ink/70 border-cream-warm hover:border-ink/30'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Products grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 10 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : products.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {products.map((product, i) => (
                <div
                  key={product.product_id}
                  className="animate-fade-up"
                  style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                >
                  <ProductCard product={product} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-ink/40">
              <p className="text-5xl mb-4">📦</p>
              <p>No products found in this category.</p>
            </div>
          )}
        </section>

        {/* ── How it works ──────────────────────────────────────────── */}
        <section className="bg-ink-soft rounded-3xl p-10 text-cream grid md:grid-cols-3 gap-8">
          <div className="col-span-full mb-2">
            <h2 className="font-display font-bold text-3xl">How RecoLens works</h2>
            <p className="text-cream/50 mt-1">A two-signal recommendation engine under the hood</p>
          </div>
          {[
            {
              icon: '🔬',
              title: 'Content-Based Filtering',
              desc: 'Analyses product features — category & price — using cosine similarity to find items that share characteristics with what you viewing.',
            },
            {
              icon: '👥',
              title: 'Collaborative Filtering',
              desc: 'Finds users with similar taste and surfaces products they rated highly that you haven\'t seen yet. Built on a user-item interaction matrix.',
            },
            {
              icon: '⚗️',
              title: 'Hybrid Fusion',
              desc: 'Blends both scores with tuned weights (40% content + 60% collaborative) into a single ranked list optimised for relevance.',
            },
          ].map(card => (
            <div key={card.title} className="flex flex-col gap-3">
              <span className="text-4xl">{card.icon}</span>
              <h3 className="font-display font-semibold text-xl">{card.title}</h3>
              <p className="text-cream/60 text-sm leading-relaxed">{card.desc}</p>
            </div>
          ))}
        </section>

      </div>
    </div>
  )
}

/**
 * ProductCard.jsx
 * ---------------
 * Displays a single product with image, name, category, and price.
 * Shows an optional similarity/score badge.
 */

import React, { useState } from 'react'

const CATEGORY_COLORS = {
  Electronics: 'bg-blue-100 text-blue-700',
  Footwear:    'bg-green-100 text-green-700',
  Books:       'bg-yellow-100 text-yellow-700',
  Clothing:    'bg-purple-100 text-purple-700',
  Kitchen:     'bg-orange-100 text-orange-700',
  Sports:      'bg-red-100 text-red-700',
}

export default function ProductCard({ product, score }) {
  const [imgError, setImgError] = useState(false)

  const {
    name,
    category,
    price,
    image_url,
  } = product

  const categoryClass =
    CATEGORY_COLORS[category] || 'bg-gray-100 text-gray-700'

  return (
    <div className="card-lift bg-white rounded-2xl overflow-hidden border border-cream-warm shadow-sm flex flex-col">
      {/* Product Image */}
      <div className="relative h-48 bg-cream overflow-hidden">
        {!imgError ? (
          <img
            src={image_url}
            alt={name}
            className="w-full h-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : (
          // Fallback placeholder if image fails
          <div className="w-full h-full flex items-center justify-center bg-cream-warm">
            <span className="text-5xl select-none">🛍️</span>
          </div>
        )}

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-xs font-medium px-2 py-1 rounded-full ${categoryClass}`}
        >
          {category}
        </span>

        {/* Score badge (if provided) */}
        {score !== undefined && (
          <span className="absolute top-3 right-3 text-xs font-mono bg-ink text-cream px-2 py-1 rounded-full">
            {(score * 100).toFixed(0)}% match
          </span>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3
          className="font-display font-semibold text-ink leading-snug line-clamp-2"
          title={name}
        >
          {name}
        </h3>
        <div className="mt-auto pt-2 flex items-center justify-between">
          <span className="text-lg font-semibold text-ink">
            ${price.toFixed(2)}
          </span>
          <button className="text-xs bg-amber-spark hover:bg-amber-glow text-ink font-medium px-3 py-1.5 rounded-full transition-colors">
            View
          </button>
        </div>
      </div>
    </div>
  )
}

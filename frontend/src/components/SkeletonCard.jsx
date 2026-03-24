/**
 * SkeletonCard.jsx
 * ----------------
 * Placeholder card shown while data is loading.
 */

export default function SkeletonCard() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden border border-cream-warm shadow-sm">
      {/* Image placeholder */}
      <div className="skeleton h-48 w-full" />
      {/* Content placeholders */}
      <div className="p-4 flex flex-col gap-3">
        <div className="skeleton h-4 w-3/4 rounded-full" />
        <div className="skeleton h-4 w-1/2 rounded-full" />
        <div className="skeleton h-6 w-1/3 rounded-full mt-2" />
      </div>
    </div>
  )
}

/**
 * LoadingSpinner.jsx
 * ------------------
 * Animated spinner shown during API calls.
 */

export default function LoadingSpinner({ label = 'Loading…' }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-12">
      {/* Ring spinner */}
      <div className="relative w-12 h-12">
        <div className="absolute inset-0 rounded-full border-4 border-cream-warm" />
        <div className="absolute inset-0 rounded-full border-4 border-amber-spark border-t-transparent animate-spin" />
      </div>
      <p className="text-sm text-ink/50 font-mono">{label}</p>
    </div>
  )
}

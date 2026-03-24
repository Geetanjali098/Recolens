/**
 * ErrorBanner.jsx
 * ---------------
 * Displays an error message with a dismiss button.
 */

export default function ErrorBanner({ message, onDismiss }) {
  if (!message) return null

  return (
    <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm">
      <span className="text-lg mt-0.5">⚠️</span>
      <p className="flex-1">{message}</p>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-red-400 hover:text-red-600 font-bold text-base leading-none"
        >
          ×
        </button>
      )}
    </div>
  )
}

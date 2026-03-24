/**
 * SectionHeader.jsx
 * -----------------
 * Reusable section heading with icon + subtitle.
 */

export default function SectionHeader({ icon, title, subtitle }) {
  return (
    <div className="flex items-start gap-3 mb-6">
      {icon && (
        <span className="text-3xl mt-0.5">{icon}</span>
      )}
      <div>
        <h2 className="font-display font-bold text-2xl text-ink">{title}</h2>
        {subtitle && (
          <p className="text-sm text-ink/50 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  )
}

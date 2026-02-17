'use client'

interface PersonalityCardProps {
  personalityTraits: string
  ideals: string
  bonds: string
  flaws: string
  editing: boolean
  onChange: (field: string, value: string) => void
}

const fields = [
  { key: 'personalityTraits', label: 'Personality Traits', color: 'border-l-blue-400' },
  { key: 'ideals', label: 'Ideals', color: 'border-l-emerald-400' },
  { key: 'bonds', label: 'Bonds', color: 'border-l-amber-400' },
  { key: 'flaws', label: 'Flaws', color: 'border-l-red-400' },
]

export default function PersonalityCard({
  personalityTraits,
  ideals,
  bonds,
  flaws,
  editing,
  onChange,
}: PersonalityCardProps) {
  const values: Record<string, string> = { personalityTraits, ideals, bonds, flaws }

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-bold uppercase tracking-wider text-text-muted">Personality</h3>
      {fields.map(({ key, label, color }) => (
        <div
          key={key}
          className={`p-2 rounded-lg border border-border-theme bg-surface-elevated border-l-2 ${color}`}
        >
          <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">{label}</p>
          {editing ? (
            <textarea
              value={values[key]}
              onChange={(e) => onChange(key, e.target.value)}
              rows={2}
              className="w-full text-xs text-text-secondary bg-transparent border-none focus:outline-none resize-none"
              placeholder={`Enter ${label.toLowerCase()}...`}
            />
          ) : (
            <p className="text-xs text-text-secondary whitespace-pre-wrap">
              {values[key] || <span className="text-text-muted italic">Not set</span>}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}

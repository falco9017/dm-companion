'use client'

import { Minus, Plus } from 'lucide-react'

interface HitPointTrackerProps {
  current: number
  maximum: number
  temporary: number
  editing: boolean
  onChange: (hp: { current: number; maximum: number; temporary: number }) => void
}

export default function HitPointTracker({
  current,
  maximum,
  temporary,
  editing,
  onChange,
}: HitPointTrackerProps) {
  const percentage = maximum > 0 ? Math.max(0, Math.min(100, (current / maximum) * 100)) : 0
  const hpColor =
    percentage > 50
      ? 'var(--forest)'
      : percentage > 25
        ? 'var(--gold-dark)'
        : 'var(--crimson)'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="dnd-section-title text-[10px]">Hit Points</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ current: Math.max(0, current - 1), maximum, temporary })}
            className="w-6 h-6 rounded-full border border-gold-dark/50 flex items-center justify-center text-ink-secondary hover:text-crimson hover:border-crimson/50 transition-colors"
          >
            <Minus className="w-3 h-3" />
          </button>
          <span className="text-sm font-bold min-w-[60px] text-center" style={{ color: hpColor }}>
            {current} / {editing ? (
              <input
                type="text"
                inputMode="numeric"
                value={maximum}
                onChange={(e) => onChange({ current, maximum: parseInt(e.target.value) || 0, temporary })}
                className="w-10 text-center bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none"
                style={{ color: hpColor }}
              />
            ) : (
              maximum
            )}
          </span>
          <button
            onClick={() => onChange({ current: Math.min(maximum, current + 1), maximum, temporary })}
            className="w-6 h-6 rounded-full border border-gold-dark/50 flex items-center justify-center text-ink-secondary hover:text-forest hover:border-forest/50 transition-colors"
          >
            <Plus className="w-3 h-3" />
          </button>
        </div>
      </div>
      <div className="h-3 rounded-full border border-gold-dark/50 overflow-hidden parchment-inner">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            background: `linear-gradient(90deg, ${hpColor}, ${hpColor}dd)`,
          }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-ink-secondary" style={{ borderBottom: '1px dashed var(--gold-dark)', paddingBottom: '1px' }}>Temp HP:</span>
        {editing ? (
          <input
            type="text"
            inputMode="numeric"
            value={temporary}
            onChange={(e) => onChange({ current, maximum, temporary: parseInt(e.target.value) || 0 })}
            className="w-10 text-xs text-center bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink-secondary"
          />
        ) : (
          <button
            onClick={() => {
              const val = prompt('Temporary HP:', String(temporary))
              if (val !== null) onChange({ current, maximum, temporary: parseInt(val) || 0 })
            }}
            className="text-xs text-ink-secondary hover:text-gold-dark transition-colors"
          >
            {temporary}
          </button>
        )}
      </div>
    </div>
  )
}

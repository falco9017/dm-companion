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
  const barColor =
    percentage > 50
      ? 'bg-emerald-500'
      : percentage > 25
        ? 'bg-amber-500'
        : 'bg-red-500'

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-text-muted">Hit Points</span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onChange({ current: Math.max(0, current - 1), maximum, temporary })}
            className="p-0.5 rounded text-text-muted hover:text-red-400 hover:bg-red-400/10 transition-colors"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <span className="text-sm font-bold text-text-primary min-w-[60px] text-center">
            {current} / {editing ? (
              <input
                type="text"
                inputMode="numeric"
                value={maximum}
                onChange={(e) => onChange({ current, maximum: parseInt(e.target.value) || 0, temporary })}
                className="w-10 text-center bg-transparent border-b border-border-theme focus:border-accent-purple focus:outline-none"
              />
            ) : (
              maximum
            )}
          </span>
          <button
            onClick={() => onChange({ current: Math.min(maximum, current + 1), maximum, temporary })}
            className="p-0.5 rounded text-text-muted hover:text-emerald-400 hover:bg-emerald-400/10 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      <div className="h-3 rounded-full bg-surface border border-border-theme overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <div className="flex items-center gap-2">
        <span className="text-[10px] text-text-muted">Temp HP:</span>
        {editing ? (
          <input
            type="text"
            inputMode="numeric"
            value={temporary}
            onChange={(e) => onChange({ current, maximum, temporary: parseInt(e.target.value) || 0 })}
            className="w-10 text-xs text-center bg-transparent border-b border-border-theme focus:border-accent-purple focus:outline-none text-text-secondary"
          />
        ) : (
          <button
            onClick={() => {
              const val = prompt('Temporary HP:', String(temporary))
              if (val !== null) onChange({ current, maximum, temporary: parseInt(val) || 0 })
            }}
            className="text-xs text-text-secondary hover:text-accent-purple-light transition-colors"
          >
            {temporary}
          </button>
        )}
      </div>
    </div>
  )
}

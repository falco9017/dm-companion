'use client'

import type { Currency } from '@/types/character-sheet'

interface CurrencyTrackerProps {
  currency: Currency
  onChange: (currency: Currency) => void
}

const coinConfig = [
  { key: 'cp' as const, label: 'CP', color: 'text-orange-400' },
  { key: 'sp' as const, label: 'SP', color: 'text-gray-300' },
  { key: 'ep' as const, label: 'EP', color: 'text-blue-300' },
  { key: 'gp' as const, label: 'GP', color: 'text-amber-400' },
  { key: 'pp' as const, label: 'PP', color: 'text-slate-200' },
]

export default function CurrencyTracker({ currency, onChange }: CurrencyTrackerProps) {
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {coinConfig.map(({ key, label, color }) => (
        <div
          key={key}
          className="flex items-center gap-1 px-2 py-1 rounded-lg border border-border bg-card"
        >
          <span className={`text-[10px] font-bold ${color}`}>{label}</span>
          <input
            type="text"
            inputMode="numeric"
            value={currency[key]}
            onChange={(e) => onChange({ ...currency, [key]: parseInt(e.target.value) || 0 })}
            className="w-12 text-xs text-center bg-transparent border-none focus:outline-none text-foreground"
            min={0}
          />
        </div>
      ))}
    </div>
  )
}

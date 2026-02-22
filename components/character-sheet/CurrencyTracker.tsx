'use client'

import type { Currency } from '@/types/character-sheet'

interface CurrencyTrackerProps {
  currency: Currency
  onChange: (currency: Currency) => void
}

const coinConfig = [
  { key: 'cp' as const, label: 'CP', coinClass: 'dnd-coin-cp' },
  { key: 'sp' as const, label: 'SP', coinClass: 'dnd-coin-sp' },
  { key: 'ep' as const, label: 'EP', coinClass: 'dnd-coin-ep' },
  { key: 'gp' as const, label: 'GP', coinClass: 'dnd-coin-gp' },
  { key: 'pp' as const, label: 'PP', coinClass: 'dnd-coin-pp' },
]

export default function CurrencyTracker({ currency, onChange }: CurrencyTrackerProps) {
  return (
    <div className="flex items-center gap-3 flex-wrap justify-center">
      {coinConfig.map(({ key, label, coinClass }) => (
        <div key={key} className="flex flex-col items-center gap-1">
          <div className={`dnd-coin ${coinClass}`}>
            <span className="text-[9px] leading-none">{label}</span>
          </div>
          <input
            type="text"
            inputMode="numeric"
            value={currency[key]}
            onChange={(e) => onChange({ ...currency, [key]: parseInt(e.target.value) || 0 })}
            className="w-10 text-xs text-center bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink"
            min={0}
          />
        </div>
      ))}
    </div>
  )
}

'use client'

import type { AbilityScore } from '@/types/character-sheet'

interface AbilityScoreCardProps {
  name: string
  ability: AbilityScore
  saveProficient: boolean
  saveModifier: number
  editing: boolean
  onChange: (score: number) => void
}

export default function AbilityScoreCard({
  name,
  ability,
  saveProficient,
  saveModifier,
  editing,
  onChange,
}: AbilityScoreCardProps) {
  const modStr = ability.modifier >= 0 ? `+${ability.modifier}` : `${ability.modifier}`
  const saveStr = saveModifier >= 0 ? `+${saveModifier}` : `${saveModifier}`

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="dnd-section-title text-[10px]">{name}</span>
      {/* Shield outer (gold border layer) */}
      <div className="relative w-16 h-20 sm:w-[4.5rem] sm:h-[5.5rem]">
        <div
          className="absolute inset-0 shield-border"
          style={{ background: 'var(--gold-dark)' }}
        />
        {/* Shield inner (parchment fill) */}
        <div
          className="absolute shield-shape parchment-inner flex flex-col items-center justify-center"
          style={{ inset: '2px' }}
        >
          <span className="text-xl sm:text-2xl font-bold text-ink leading-none">{modStr}</span>
          {editing ? (
            <input
              type="text"
              inputMode="numeric"
              value={ability.score}
              onChange={(e) => onChange(parseInt(e.target.value) || 0)}
              className="w-10 text-center text-xs text-ink-secondary bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none mt-0.5"
            />
          ) : (
            <span className="text-xs text-ink-secondary mt-0.5">{ability.score}</span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-[10px] text-ink-secondary">
        <span style={{ color: saveProficient ? 'var(--gold)' : undefined }} className={saveProficient ? 'font-semibold' : ''}>
          {saveProficient ? '◆' : '○'}
        </span>
        <span>Save {saveStr}</span>
      </div>
    </div>
  )
}

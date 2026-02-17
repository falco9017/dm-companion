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
      <span className="text-[10px] font-bold uppercase tracking-wider text-text-muted">{name}</span>
      <div className="relative w-16 h-20 flex flex-col items-center justify-center rounded-lg border-2 border-border-theme bg-surface-elevated hover:border-accent-purple/40 transition-colors">
        <span className="text-xl font-bold text-text-primary">{modStr}</span>
        {editing ? (
          <input
            type="text"
            inputMode="numeric"
            value={ability.score}
            onChange={(e) => onChange(parseInt(e.target.value) || 0)}
            className="w-10 text-center text-xs text-text-muted bg-transparent border-b border-border-theme focus:border-accent-purple focus:outline-none"
          />
        ) : (
          <span className="text-xs text-text-muted">{ability.score}</span>
        )}
      </div>
      <div className="flex items-center gap-1 text-[10px] text-text-muted">
        <span className={saveProficient ? 'text-accent-purple-light font-semibold' : ''}>
          {saveProficient ? '◆' : '○'}
        </span>
        <span>Save {saveStr}</span>
      </div>
    </div>
  )
}

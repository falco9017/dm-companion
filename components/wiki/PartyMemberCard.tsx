'use client'

import { cn } from '@/lib/utils'
import type { CharacterSheetData } from '@/types/character-sheet'

interface PartyMemberCardProps {
  characterName: string
  playerName: string | null
  data: CharacterSheetData
  isOwn?: boolean
  className?: string
}

export default function PartyMemberCard({ characterName, playerName, data, isOwn, className }: PartyMemberCardProps) {
  const currentHp = data.hitPoints?.current ?? data.hitPoints?.maximum ?? '—'
  const maxHp = data.hitPoints?.maximum ?? '—'
  const ac = data.armorClass ?? '—'
  const init = data.initiative
  const initiative = init !== undefined && init !== null
    ? (init >= 0 ? `+${init}` : String(init))
    : '—'

  const level = data.level || '—'
  const race = data.race || ''
  const charClass = data.class || ''
  const subtitle = [race, charClass, level ? `Level ${level}` : ''].filter(Boolean).join(' · ')

  return (
    <div className={cn(
      'parchment-inner dnd-frame-light rounded-lg p-4 space-y-3',
      isOwn && 'ring-2 ring-gold/60',
      className
    )}>
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-ink text-sm">{characterName || 'Unnamed Character'}</h3>
          {isOwn && (
            <span className="text-xs px-1.5 py-0.5 rounded bg-gold/20 text-gold-dark font-medium">You</span>
          )}
        </div>
        {playerName && (
          <p className="text-xs text-ink-secondary">{playerName}</p>
        )}
        {subtitle && (
          <p className="text-xs text-ink-secondary mt-0.5">{subtitle}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="dnd-frame-light rounded p-2">
          <div className="text-xs text-ink-secondary font-medium mb-0.5">HP</div>
          <div className="text-sm font-bold text-ink">{currentHp}<span className="text-xs text-ink-secondary">/{maxHp}</span></div>
        </div>
        <div className="dnd-frame-light rounded p-2">
          <div className="text-xs text-ink-secondary font-medium mb-0.5">AC</div>
          <div className="text-sm font-bold text-ink">{ac}</div>
        </div>
        <div className="dnd-frame-light rounded p-2">
          <div className="text-xs text-ink-secondary font-medium mb-0.5">Init</div>
          <div className="text-sm font-bold text-ink">{initiative}</div>
        </div>
      </div>
    </div>
  )
}

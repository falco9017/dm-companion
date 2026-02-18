'use client'

import { Users, Heart, Shield, Zap } from 'lucide-react'
import type { CharacterSheetData } from '@/types/character-sheet'

interface PartySheet {
  id: string
  data: CharacterSheetData
  assignedPlayerId: string | null
  assignedPlayer: { id: string; name: string | null; email: string } | null
  wikiEntry: { id: string; title: string }
}

interface PartyOverviewProps {
  sheets: PartySheet[]
  mySheetId: string | null
}

function hpColor(current: number, max: number) {
  const pct = max > 0 ? current / max : 1
  if (pct > 0.5) return 'text-green-400'
  if (pct > 0.25) return 'text-amber-400'
  return 'text-red-400'
}

export default function PartyOverview({ sheets, mySheetId }: PartyOverviewProps) {
  if (sheets.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        No characters in the party yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {sheets.map((sheet) => {
        const d = sheet.data
        const isMe = sheet.id === mySheetId
        return (
          <div
            key={sheet.id}
            className={`p-4 rounded-xl border transition-colors ${
              isMe
                ? 'border-accent-purple/50 bg-accent-purple/5'
                : 'border-border-theme bg-surface-elevated'
            }`}
          >
            {/* Name row */}
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold text-text-primary">
                    {d.characterName || sheet.wikiEntry.title}
                  </h3>
                  {isMe && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple-light">
                      You
                    </span>
                  )}
                </div>
                <p className="text-xs text-text-muted">
                  {[d.race, d.class, d.level ? `Level ${d.level}` : null]
                    .filter(Boolean)
                    .join(' · ')}
                </p>
                {sheet.assignedPlayer && (
                  <p className="text-[11px] text-text-muted mt-0.5">
                    {sheet.assignedPlayer.name || sheet.assignedPlayer.email}
                  </p>
                )}
              </div>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-2">
              {/* HP */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface border border-border-theme">
                <Heart className="w-3.5 h-3.5 text-rose-400 shrink-0" />
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wide">HP</p>
                  <p className={`text-xs font-bold ${hpColor(d.hitPoints.current, d.hitPoints.maximum)}`}>
                    {d.hitPoints.current}/{d.hitPoints.maximum}
                    {d.hitPoints.temporary > 0 && (
                      <span className="text-blue-300 ml-0.5">+{d.hitPoints.temporary}</span>
                    )}
                  </p>
                </div>
              </div>

              {/* AC */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface border border-border-theme">
                <Shield className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wide">AC</p>
                  <p className="text-xs font-bold text-text-primary">{d.armorClass}</p>
                </div>
              </div>

              {/* Initiative */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-surface border border-border-theme">
                <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <div>
                  <p className="text-[9px] text-text-muted uppercase tracking-wide">Init</p>
                  <p className="text-xs font-bold text-text-primary">
                    {d.initiative >= 0 ? '+' : ''}{d.initiative}
                  </p>
                </div>
              </div>
            </div>

            {/* Ability scores (compact) */}
            <div className="grid grid-cols-6 gap-1 mt-2">
              {(
                [
                  ['STR', d.abilities.strength.modifier],
                  ['DEX', d.abilities.dexterity.modifier],
                  ['CON', d.abilities.constitution.modifier],
                  ['INT', d.abilities.intelligence.modifier],
                  ['WIS', d.abilities.wisdom.modifier],
                  ['CHA', d.abilities.charisma.modifier],
                ] as [string, number][]
              ).map(([label, mod]) => (
                <div
                  key={label}
                  className="text-center p-1 rounded bg-surface border border-border-theme"
                >
                  <p className="text-[8px] text-text-muted">{label}</p>
                  <p className="text-[11px] font-semibold text-text-primary">
                    {mod >= 0 ? '+' : ''}{mod}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

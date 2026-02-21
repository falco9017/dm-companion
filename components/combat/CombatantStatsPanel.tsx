'use client'

import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, Zap, Heart, Footprints } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Combatant } from '@/types/combat'
import type { CharacterSheetData, Abilities } from '@/types/character-sheet'

const ABILITY_LABELS: Record<keyof Abilities, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

function hpBarColor(current: number, max: number) {
  if (max === 0) return 'bg-muted'
  const pct = current / max
  if (current <= 0) return 'bg-gray-400'
  if (pct > 0.5) return 'bg-green-500'
  if (pct > 0.25) return 'bg-amber-500'
  return 'bg-red-500'
}

function typeLabel(type: Combatant['type']) {
  if (type === 'player') return 'Player Character'
  if (type === 'npc') return 'NPC'
  return 'Monster'
}

function typeBadgeVariant(type: Combatant['type']): 'default' | 'secondary' | 'destructive' {
  if (type === 'player') return 'default'
  if (type === 'npc') return 'secondary'
  return 'destructive'
}

function CharacterStats({ combatant, sheet }: { combatant: Combatant; sheet: CharacterSheetData }) {
  const hpPct = combatant.maxHp > 0 ? Math.max(0, combatant.currentHp / combatant.maxHp) : 0
  const proficientSkills = sheet.skills.filter((s) => s.proficient || s.expertise)
  const attacks = sheet.equipment.filter((e) => e.attackBonus !== undefined || e.damage)

  return (
    <div className="space-y-4">
      {/* Identity */}
      <div>
        <p className="text-sm text-muted-foreground">
          {[sheet.race, sheet.class, sheet.subclass].filter(Boolean).join(' · ')}
          {sheet.level ? ` · Level ${sheet.level}` : ''}
        </p>
        {sheet.background && (
          <p className="text-xs text-muted-foreground">{sheet.background}</p>
        )}
      </div>

      {/* Core combat stats */}
      <div className="grid grid-cols-4 gap-2">
        <div className="flex flex-col items-center gap-0.5 rounded-md border p-2">
          <Shield className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-lg font-bold">{sheet.armorClass}</span>
          <span className="text-xs text-muted-foreground">AC</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-md border p-2">
          <Zap className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-lg font-bold">
            {sheet.initiative >= 0 ? `+${sheet.initiative}` : sheet.initiative}
          </span>
          <span className="text-xs text-muted-foreground">Init</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-md border p-2">
          <Footprints className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-lg font-bold">{sheet.speed}</span>
          <span className="text-xs text-muted-foreground">ft</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-md border p-2">
          <Heart className="w-3.5 h-3.5 text-muted-foreground" />
          <span className={cn('text-lg font-bold', combatant.currentHp <= 0 && 'text-muted-foreground')}>
            {combatant.currentHp}
          </span>
          <span className="text-xs text-muted-foreground">/{combatant.maxHp}</span>
        </div>
      </div>

      {/* HP bar */}
      <div className="space-y-1">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn('h-full rounded-full transition-all', hpBarColor(combatant.currentHp, combatant.maxHp))}
            style={{ width: `${hpPct * 100}%` }}
          />
        </div>
        {combatant.temporaryHp > 0 && (
          <p className="text-xs text-blue-500">+{combatant.temporaryHp} temp HP</p>
        )}
      </div>

      <Separator />

      {/* Ability scores */}
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Abilities</p>
        <div className="grid grid-cols-6 gap-1">
          {(Object.keys(ABILITY_LABELS) as Array<keyof Abilities>).map((key) => {
            const ability = sheet.abilities[key]
            return (
              <div key={key} className="flex flex-col items-center rounded border p-1.5">
                <span className="text-xs text-muted-foreground">{ABILITY_LABELS[key]}</span>
                <span className="font-bold text-sm">
                  {ability.modifier >= 0 ? `+${ability.modifier}` : ability.modifier}
                </span>
                <span className="text-xs text-muted-foreground">{ability.score}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Attacks */}
      {attacks.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Attacks</p>
            <div className="space-y-1">
              {attacks.map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  <div className="flex gap-2 text-muted-foreground shrink-0 ml-2">
                    {item.attackBonus !== undefined && <span>+{item.attackBonus} to hit</span>}
                    {item.damage && <span>{item.damage}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Proficient skills */}
      {proficientSkills.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Proficient Skills</p>
            <div className="flex flex-wrap gap-1">
              {proficientSkills.map((s) => (
                <Badge key={s.name} variant="secondary" className="text-xs">
                  {s.name} ({s.modifier >= 0 ? `+${s.modifier}` : s.modifier})
                  {s.expertise && ' ✦'}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Features */}
      {sheet.features.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">Features & Traits</p>
            <div className="space-y-2">
              {sheet.features.map((f, i) => (
                <div key={i}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{f.name}</span>
                    {f.usesMax !== undefined && (
                      <Badge variant="outline" className="text-xs">
                        {f.usesCurrent ?? 0}/{f.usesMax}
                      </Badge>
                    )}
                  </div>
                  {f.description && (
                    <p className="text-xs text-muted-foreground mt-0.5">{f.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Spellcasting */}
      {sheet.spellcasting && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
              Spellcasting ({sheet.spellcasting.ability})
            </p>
            <div className="flex gap-4 text-sm">
              <span>DC {sheet.spellcasting.saveDC}</span>
              <span>+{sheet.spellcasting.attackBonus} to hit</span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1.5">
              {sheet.spellcasting.spellSlots.filter((s) => s.total > 0).map((slot) => (
                <Badge key={slot.level} variant="outline" className="text-xs">
                  L{slot.level}: {slot.total - slot.used}/{slot.total}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

function WikiStats({ content, notes }: { content: string; notes: string }) {
  return (
    <div className="space-y-3">
      {content ? (
        <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
          {content}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground italic">No wiki entry content available.</p>
      )}
      {notes && (
        <>
          <Separator />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Combat Notes</p>
            <p className="text-sm whitespace-pre-wrap">{notes}</p>
          </div>
        </>
      )}
    </div>
  )
}

export default function CombatantStatsPanel({ combatant }: { combatant: Combatant }) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b bg-muted/20">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-base leading-tight">{combatant.name}</h3>
          <Badge variant={typeBadgeVariant(combatant.type)} className="text-xs">
            {typeLabel(combatant.type)}
          </Badge>
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground mt-1">
          <span>AC {combatant.ac}</span>
          <span>
            HP {combatant.currentHp}/{combatant.maxHp}
          </span>
          {combatant.temporaryHp > 0 && <span>+{combatant.temporaryHp} temp</span>}
          <span>Init {combatant.initiative}</span>
        </div>
      </div>

      {/* Stats content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4">
          {combatant.characterSheet ? (
            <CharacterStats combatant={combatant} sheet={combatant.characterSheet} />
          ) : (
            <WikiStats content={combatant.wikiContent ?? ''} notes={combatant.notes} />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

'use client'

import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Shield, Zap, Heart, Footprints } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Combatant } from '@/types/combat'
import type { CharacterSheetData, Abilities } from '@/types/character-sheet'

interface CombatantStatsSheetProps {
  combatant: Combatant | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ABILITY_LABELS: Record<keyof Abilities, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
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

function CharacterSheetStats({ sheet }: { sheet: CharacterSheetData }) {
  const hpPct = sheet.hitPoints.maximum > 0
    ? Math.max(0, sheet.hitPoints.current / sheet.hitPoints.maximum)
    : 0

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
          <span className="text-lg font-bold">{sheet.initiative >= 0 ? `+${sheet.initiative}` : sheet.initiative}</span>
          <span className="text-xs text-muted-foreground">Init</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-md border p-2">
          <Footprints className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-lg font-bold">{sheet.speed}</span>
          <span className="text-xs text-muted-foreground">ft</span>
        </div>
        <div className="flex flex-col items-center gap-0.5 rounded-md border p-2">
          <Heart className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="text-lg font-bold">{sheet.hitPoints.current}</span>
          <span className="text-xs text-muted-foreground">/{sheet.hitPoints.maximum}</span>
        </div>
      </div>

      {/* HP bar */}
      <div className="space-y-1">
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all',
              hpPct > 0.5 ? 'bg-green-500' :
              hpPct > 0.25 ? 'bg-amber-500' : 'bg-red-500'
            )}
            style={{ width: `${hpPct * 100}%` }}
          />
        </div>
        {sheet.hitPoints.temporary > 0 && (
          <p className="text-xs text-muted-foreground">+{sheet.hitPoints.temporary} temp HP</p>
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
                <span className="font-bold text-sm">{ability.modifier >= 0 ? `+${ability.modifier}` : ability.modifier}</span>
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
                  <div className="flex gap-2 text-muted-foreground">
                    {item.attackBonus !== undefined && (
                      <span>+{item.attackBonus} to hit</span>
                    )}
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

function WikiContentStats({ content, notes }: { content: string; notes: string }) {
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

export default function CombatantStatsSheet({ combatant, open, onOpenChange }: CombatantStatsSheetProps) {
  if (!combatant) return null

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md flex flex-col p-0">
        <SheetHeader className="px-4 pt-4 pb-3 border-b flex-shrink-0">
          <div className="flex items-center gap-2">
            <SheetTitle className="text-base">{combatant.name}</SheetTitle>
            <Badge variant={typeBadgeVariant(combatant.type)} className="text-xs">
              {typeLabel(combatant.type)}
            </Badge>
          </div>
          <div className="flex gap-3 text-sm text-muted-foreground">
            <span>AC {combatant.ac}</span>
            <span>HP {combatant.currentHp}/{combatant.maxHp}</span>
            {combatant.temporaryHp > 0 && <span>+{combatant.temporaryHp} temp</span>}
            <span>Init {combatant.initiative}</span>
          </div>
        </SheetHeader>

        <ScrollArea className="flex-1 px-4 py-4">
          {combatant.characterSheet ? (
            <CharacterSheetStats sheet={combatant.characterSheet} />
          ) : (
            <WikiContentStats
              content={combatant.wikiContent ?? ''}
              notes={combatant.notes}
            />
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  )
}

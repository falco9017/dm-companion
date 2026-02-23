'use client'

import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Shield, Zap, Heart, Footprints, Plus, Minus, Moon, Sun, Swords } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Combatant, MonsterData } from '@/types/combat'
import type { CharacterSheetData, Abilities, SpellSlot, Spell, Spellcasting } from '@/types/character-sheet'

const ABILITY_LABELS: Record<keyof Abilities, string> = {
  strength: 'STR',
  dexterity: 'DEX',
  constitution: 'CON',
  intelligence: 'INT',
  wisdom: 'WIS',
  charisma: 'CHA',
}

const MONSTER_ABILITY_KEYS: Array<{ key: keyof MonsterData['abilities']; label: string }> = [
  { key: 'strength', label: 'STR' },
  { key: 'dexterity', label: 'DEX' },
  { key: 'constitution', label: 'CON' },
  { key: 'intelligence', label: 'INT' },
  { key: 'wisdom', label: 'WIS' },
  { key: 'charisma', label: 'CHA' },
]

function hpBarColor(current: number, max: number) {
  if (max === 0) return 'bg-muted-foreground/30'
  const pct = current / max
  if (current <= 0) return 'bg-muted-foreground/30'
  if (pct > 0.5) return 'bg-green-500'
  if (pct > 0.25) return 'bg-amber-500'
  return 'bg-destructive'
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

function abilityMod(score: number) {
  const mod = Math.floor((score - 10) / 2)
  return mod >= 0 ? `+${mod}` : String(mod)
}

function formatCr(cr: number) {
  if (cr === 0.125) return '1/8'
  if (cr === 0.25) return '1/4'
  if (cr === 0.5) return '1/2'
  return String(cr)
}

// Compact ability score box
function AbilityBox({ label, score }: { label: string; score: number }) {
  const mod = Math.floor((score - 10) / 2)
  return (
    <div className="flex flex-col items-center rounded-md border bg-card p-1.5 gap-0.5">
      <span className="text-[9px] font-bold uppercase tracking-wide text-muted-foreground">{label}</span>
      <span className="text-sm font-bold leading-none">{mod >= 0 ? `+${mod}` : mod}</span>
      <span className="text-[10px] text-muted-foreground">{score}</span>
    </div>
  )
}

// HP bar
function HpBar({ current, max, temporary }: { current: number; max: number; temporary: number }) {
  const pct = max > 0 ? Math.max(0, current) / max : 0
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>
          HP <strong className={cn(current <= 0 && 'text-destructive')}>{current}</strong>/{max}
        </span>
        {temporary > 0 && <span className="text-blue-500">+{temporary} temp</span>}
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn('h-full rounded-full transition-all', hpBarColor(current, max))}
          style={{ width: `${pct * 100}%` }}
        />
      </div>
    </div>
  )
}

// Spell slot row with +/- controls
function SpellSlotRow({ slot, onChange }: { slot: SpellSlot; onChange: (updated: SpellSlot) => void }) {
  const available = slot.total - slot.used
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="text-[10px] font-semibold uppercase text-muted-foreground w-12">Lv {slot.level}</span>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 text-destructive hover:text-destructive hover:bg-destructive/10"
        disabled={slot.used >= slot.total}
        onClick={() => onChange({ ...slot, used: slot.used + 1 })}
        title="Use slot"
      >
        <Minus className="w-2.5 h-2.5" />
      </Button>
      <div className="flex gap-0.5 flex-1">
        {Array.from({ length: slot.total }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'flex-1 h-3 rounded-sm border transition-all',
              i < available
                ? 'bg-primary border-primary'
                : 'bg-transparent border-muted-foreground/30'
            )}
          />
        ))}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-5 w-5 text-primary hover:text-primary hover:bg-primary/10"
        disabled={slot.used <= 0}
        onClick={() => onChange({ ...slot, used: slot.used - 1 })}
        title="Restore slot"
      >
        <Plus className="w-2.5 h-2.5" />
      </Button>
      <span className="text-[10px] text-muted-foreground w-8 text-right">{available}/{slot.total}</span>
    </div>
  )
}

// Prepared spell row with Cast button
function SpellRow({ spell, slots, onCast }: { spell: Spell; slots: SpellSlot[]; onCast: (slotLevel: number) => void }) {
  // Find the lowest available slot at or above spell level
  const availableSlot =
    spell.level === 0
      ? null
      : slots.find((s) => s.level >= spell.level && s.used < s.total) ?? null

  return (
    <div className="flex items-center gap-2 py-1 border-b border-border/40 last:border-0">
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium truncate">{spell.name}</p>
        <div className="flex gap-1 mt-0.5">
          {spell.level === 0 && (
            <span className="text-[9px] text-muted-foreground">Cantrip</span>
          )}
          {spell.concentration && (
            <Badge variant="outline" className="text-[9px] h-3.5 px-1 border-primary/50 text-primary">
              C
            </Badge>
          )}
          {spell.ritual && (
            <Badge variant="outline" className="text-[9px] h-3.5 px-1">
              R
            </Badge>
          )}
          {spell.school && (
            <span className="text-[9px] text-muted-foreground">{spell.school}</span>
          )}
        </div>
      </div>
      {spell.level > 0 && (
        <Button
          variant="outline"
          size="sm"
          className={cn('h-6 text-[10px] px-2 gap-1 flex-shrink-0', !availableSlot && 'opacity-40')}
          disabled={!availableSlot}
          onClick={() => availableSlot && onCast(availableSlot.level)}
          title={availableSlot ? `Cast using level ${availableSlot.level} slot` : 'No spell slots available'}
        >
          <Swords className="w-2.5 h-2.5" />
          Cast
        </Button>
      )}
    </div>
  )
}

// Character / NPC stats panel
function CharacterStats({
  combatant,
  sheet,
  onUpdate,
}: {
  combatant: Combatant
  sheet: CharacterSheetData
  onUpdate: (patch: Partial<Combatant>) => void
}) {
  const attacks = sheet.equipment.filter((e) => e.attackBonus !== undefined || e.damage)
  const equippedNonAttack = sheet.equipment.filter((e) => e.equipped && !e.attackBonus && !e.damage)

  function updateSpellcasting(sc: Spellcasting) {
    onUpdate({ characterSheet: { ...sheet, spellcasting: sc } })
  }

  function updateSlot(slotIndex: number, slot: SpellSlot) {
    if (!sheet.spellcasting) return
    const updated = [...sheet.spellcasting.spellSlots]
    updated[slotIndex] = slot
    updateSpellcasting({ ...sheet.spellcasting, spellSlots: updated })
  }

  function castSpell(slotLevel: number) {
    if (!sheet.spellcasting) return
    const slotIndex = sheet.spellcasting.spellSlots.findIndex((s) => s.level === slotLevel)
    if (slotIndex === -1) return
    const updated = [...sheet.spellcasting.spellSlots]
    updated[slotIndex] = { ...updated[slotIndex], used: updated[slotIndex].used + 1 }
    updateSpellcasting({ ...sheet.spellcasting, spellSlots: updated })
  }

  function doLongRest() {
    const updatedSheet: CharacterSheetData = {
      ...sheet,
      spellcasting: sheet.spellcasting
        ? {
            ...sheet.spellcasting,
            spellSlots: sheet.spellcasting.spellSlots.map((s) => ({ ...s, used: 0 })),
          }
        : null,
      features: sheet.features.map((f) => ({
        ...f,
        usesCurrent: f.usesMax,
      })),
    }
    onUpdate({ characterSheet: updatedSheet, currentHp: combatant.maxHp })
  }

  function doShortRest() {
    // Short rest: restore feature uses, not spell slots (warlock players adjust manually)
    const updatedSheet: CharacterSheetData = {
      ...sheet,
      features: sheet.features.map((f) => ({
        ...f,
        usesCurrent: f.usesMax,
      })),
    }
    onUpdate({ characterSheet: updatedSheet })
  }

  const preparedSpells = sheet.spellcasting
    ? sheet.spellcasting.spells.filter((s) => s.prepared || s.level === 0)
    : []

  return (
    <div className="space-y-4">
      {/* Identity */}
      <div>
        <p className="text-sm text-muted-foreground">
          {[sheet.race, sheet.class, sheet.subclass].filter(Boolean).join(' · ')}
          {sheet.level ? ` · Level ${sheet.level}` : ''}
        </p>
        {sheet.background && <p className="text-xs text-muted-foreground">{sheet.background}</p>}
      </div>

      {/* HP Bar */}
      <HpBar current={combatant.currentHp} max={combatant.maxHp} temporary={combatant.temporaryHp} />

      {/* Core combat stats */}
      <div className="grid grid-cols-4 gap-1.5">
        <div className="flex flex-col items-center rounded-md border bg-card p-1.5 text-center gap-0.5">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="font-bold text-sm">{sheet.armorClass}</span>
          <span className="text-[9px] text-muted-foreground">AC</span>
        </div>
        <div className="flex flex-col items-center rounded-md border bg-card p-1.5 text-center gap-0.5">
          <Zap className="w-3 h-3 text-muted-foreground" />
          <span className="font-bold text-sm">
            {sheet.initiative >= 0 ? `+${sheet.initiative}` : sheet.initiative}
          </span>
          <span className="text-[9px] text-muted-foreground">Init</span>
        </div>
        <div className="flex flex-col items-center rounded-md border bg-card p-1.5 text-center gap-0.5">
          <Footprints className="w-3 h-3 text-muted-foreground" />
          <span className="font-bold text-sm">{sheet.speed}</span>
          <span className="text-[9px] text-muted-foreground">ft</span>
        </div>
        <div className="flex flex-col items-center rounded-md border bg-card p-1.5 text-center gap-0.5">
          <Heart className="w-3 h-3 text-muted-foreground" />
          <span className="font-bold text-sm">+{sheet.proficiencyBonus}</span>
          <span className="text-[9px] text-muted-foreground">Prof</span>
        </div>
      </div>

      {/* Ability scores */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Abilities</p>
        <div className="grid grid-cols-6 gap-1">
          {(Object.keys(ABILITY_LABELS) as Array<keyof Abilities>).map((key) => (
            <AbilityBox key={key} label={ABILITY_LABELS[key]} score={sheet.abilities[key].score} />
          ))}
        </div>
      </div>

      {/* Attacks */}
      {attacks.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Attacks & Weapons
            </p>
            <div className="space-y-1">
              {attacks.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border bg-card px-2 py-1.5"
                >
                  <span className="text-xs font-medium truncate">{item.name}</span>
                  <div className="flex gap-2 shrink-0 ml-2">
                    {item.attackBonus !== undefined && (
                      <span className="text-xs font-semibold text-primary">+{item.attackBonus}</span>
                    )}
                    {item.damage && (
                      <span className="text-xs text-muted-foreground">{item.damage}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Equipped non-attack items */}
      {equippedNonAttack.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Equipment</p>
            <div className="flex flex-wrap gap-1">
              {equippedNonAttack.map((item, i) => (
                <Badge key={i} variant="outline" className="text-xs">
                  {item.name}
                </Badge>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Spellcasting */}
      {sheet.spellcasting && (
        <>
          <Separator />
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                Spellcasting ({sheet.spellcasting.ability})
              </p>
              <div className="flex gap-3 text-xs text-muted-foreground">
                <span>DC {sheet.spellcasting.saveDC}</span>
                <span>+{sheet.spellcasting.attackBonus} hit</span>
              </div>
            </div>

            {/* Spell slots */}
            {sheet.spellcasting.spellSlots.filter((s) => s.total > 0).length > 0 && (
              <div className="rounded-md border bg-muted/30 px-3 py-2 space-y-0.5">
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
                  Spell Slots
                </p>
                {sheet.spellcasting.spellSlots
                  .filter((s) => s.total > 0)
                  .map((slot) => {
                    const actualIndex = sheet.spellcasting!.spellSlots.indexOf(slot)
                    return (
                      <SpellSlotRow
                        key={slot.level}
                        slot={slot}
                        onChange={(updated) => updateSlot(actualIndex, updated)}
                      />
                    )
                  })}
              </div>
            )}

            {/* Prepared spells */}
            {preparedSpells.length > 0 && (
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
                  Prepared Spells
                </p>
                <div className="rounded-md border bg-card px-2">
                  {preparedSpells.map((spell, i) => {
                    const globalIndex = sheet.spellcasting!.spells.indexOf(spell)
                    return (
                      <SpellRow
                        key={`${spell.name}-${globalIndex}`}
                        spell={spell}
                        slots={sheet.spellcasting!.spellSlots}
                        onCast={castSpell}
                      />
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Features */}
      {sheet.features.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Features & Traits
            </p>
            <div className="space-y-1.5">
              {sheet.features.map((f, i) => (
                <div key={i} className="rounded-md border bg-card px-2 py-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold">{f.name}</span>
                    {f.usesMax !== undefined && (
                      <Badge variant="outline" className="text-[10px] h-4 px-1">
                        {f.usesCurrent ?? 0}/{f.usesMax}
                      </Badge>
                    )}
                  </div>
                  {f.description && (
                    <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{f.description}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Rest buttons */}
      <Separator />
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs gap-1"
          onClick={doShortRest}
          title="Restore feature uses"
        >
          <Moon className="w-3 h-3" />
          Short Rest
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="flex-1 h-7 text-xs gap-1"
          onClick={doLongRest}
          title="Restore HP, all spell slots, and feature uses"
        >
          <Sun className="w-3 h-3" />
          Long Rest
        </Button>
      </div>
    </div>
  )
}

// Monster stats panel (from D&D SRD or custom)
function MonsterStats({ combatant }: { combatant: Combatant }) {
  const { monsterData, wikiContent } = combatant

  if (!monsterData) {
    return (
      <div className="space-y-3">
        <HpBar current={combatant.currentHp} max={combatant.maxHp} temporary={combatant.temporaryHp} />
        {wikiContent ? (
          <div className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">{wikiContent}</div>
        ) : (
          <p className="text-sm text-muted-foreground italic">No details available.</p>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Type info */}
      <div>
        <p className="text-sm text-muted-foreground capitalize">
          {monsterData.size} {monsterData.type}
        </p>
        <p className="text-xs text-muted-foreground">
          CR {formatCr(monsterData.challengeRating)} · {monsterData.xp} XP
        </p>
      </div>

      {/* HP Bar */}
      <HpBar current={combatant.currentHp} max={combatant.maxHp} temporary={combatant.temporaryHp} />

      {/* Core stats */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="flex flex-col items-center rounded-md border bg-card p-1.5 text-center gap-0.5">
          <Shield className="w-3 h-3 text-muted-foreground" />
          <span className="font-bold text-sm">{combatant.ac}</span>
          <span className="text-[9px] text-muted-foreground">AC</span>
        </div>
        <div className="flex flex-col items-center rounded-md border bg-card p-1.5 text-center gap-0.5">
          <Zap className="w-3 h-3 text-muted-foreground" />
          <span className="font-bold text-sm">{abilityMod(monsterData.abilities.dexterity)}</span>
          <span className="text-[9px] text-muted-foreground">Init</span>
        </div>
        <div className="flex flex-col items-center rounded-md border bg-card p-1.5 text-center gap-0.5">
          <Heart className="w-3 h-3 text-muted-foreground" />
          <span className="font-bold text-sm">{combatant.maxHp}</span>
          <span className="text-[9px] text-muted-foreground">Max HP</span>
        </div>
      </div>

      {/* Ability scores */}
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Abilities</p>
        <div className="grid grid-cols-6 gap-1">
          {MONSTER_ABILITY_KEYS.map(({ key, label }) => (
            <AbilityBox key={key} label={label} score={monsterData.abilities[key]} />
          ))}
        </div>
      </div>

      {/* Actions */}
      {monsterData.actions && monsterData.actions.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">Actions</p>
            <div className="space-y-1.5">
              {monsterData.actions.map((action, i) => (
                <div key={i} className="rounded-md border bg-card px-2 py-1.5">
                  <p className="text-xs font-semibold">{action.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{action.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Special Abilities */}
      {monsterData.specialAbilities && monsterData.specialAbilities.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Special Abilities
            </p>
            <div className="space-y-1.5">
              {monsterData.specialAbilities.map((sa, i) => (
                <div key={i} className="rounded-md border bg-card px-2 py-1.5">
                  <p className="text-xs font-semibold">{sa.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{sa.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Legendary Actions */}
      {monsterData.legendaryActions && monsterData.legendaryActions.length > 0 && (
        <>
          <Separator />
          <div>
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1.5">
              Legendary Actions
            </p>
            <div className="space-y-1.5">
              {monsterData.legendaryActions.map((la, i) => (
                <div key={i} className="rounded-md border bg-card px-2 py-1.5">
                  <p className="text-xs font-semibold">{la.name}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5 leading-relaxed">{la.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default function CombatantStatsPanel({
  combatant,
  onUpdate,
}: {
  combatant: Combatant
  onUpdate: (patch: Partial<Combatant>) => void
}) {
  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="flex-shrink-0 px-4 pt-3 pb-3 border-b bg-card/50">
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
          {combatant.temporaryHp > 0 && <span className="text-blue-500">+{combatant.temporaryHp} temp</span>}
          <span>Init {combatant.initiative}</span>
        </div>
      </div>

      {/* Stats content */}
      <ScrollArea className="flex-1">
        <div className="px-4 py-4">
          {combatant.characterSheet ? (
            <CharacterStats combatant={combatant} sheet={combatant.characterSheet} onUpdate={onUpdate} />
          ) : (
            <MonsterStats combatant={combatant} />
          )}
        </div>
      </ScrollArea>
    </div>
  )
}

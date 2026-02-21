'use client'

import { BookOpen, X } from 'lucide-react'
import type { Spellcasting, Spell, SpellSlot } from '@/types/character-sheet'
import SpellPicker from './SpellPicker'

interface SpellSectionProps {
  spellcasting: Spellcasting
  editing: boolean
  characterClass?: string
  onChange: (spellcasting: Spellcasting) => void
}

function SpellSlotTracker({
  slot,
  onChange,
}: {
  slot: SpellSlot
  onChange: (slot: SpellSlot) => void
}) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] text-muted-foreground w-8">Lv {slot.level}</span>
      <div className="flex gap-0.5">
        {Array.from({ length: slot.total }).map((_, i) => (
          <button
            key={i}
            onClick={() => onChange({ ...slot, used: i < slot.used ? i : i + 1 })}
            className="w-3.5 h-3.5 rounded-sm border transition-colors"
            style={{
              borderColor: i < slot.used ? 'rgb(75, 85, 99)' : 'rgb(139, 92, 246)',
              backgroundColor: i < slot.used ? 'rgb(55, 65, 81)' : 'rgb(139, 92, 246)',
              opacity: i < slot.used ? 0.4 : 1,
            }}
          />
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">
        {slot.total - slot.used}/{slot.total}
      </span>
    </div>
  )
}

function SpellCard({
  spell,
  editing,
  onTogglePrepared,
  onRemove,
}: {
  spell: Spell
  editing: boolean
  onTogglePrepared: () => void
  onRemove: () => void
}) {
  return (
    <div className={`relative p-2 rounded-lg border bg-card transition-colors ${
      spell.prepared ? 'border-primary/40' : 'border-border opacity-60'
    }`}>
      {editing && (
        <button
          onClick={onRemove}
          className="absolute top-0.5 right-0.5 p-0.5 rounded text-muted-foreground hover:text-red-400 transition-colors"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
      <div className="flex items-start gap-1.5">
        <button
          onClick={onTogglePrepared}
          className="mt-0.5 flex-shrink-0"
          title={spell.prepared ? 'Prepared' : 'Not prepared'}
        >
          {spell.prepared ? (
            <span className="text-primary text-xs">●</span>
          ) : (
            <span className="text-muted-foreground text-xs">○</span>
          )}
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-foreground truncate">{spell.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {spell.concentration && (
              <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300">C</span>
            )}
            {spell.ritual && (
              <span className="text-[9px] px-1 rounded bg-blue-500/20 text-blue-300">R</span>
            )}
            <span className="text-[9px] text-muted-foreground">{spell.school}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SpellSection({ spellcasting, editing, characterClass, onChange }: SpellSectionProps) {
  const spellsByLevel = spellcasting.spells.reduce(
    (acc, spell) => {
      const key = spell.level
      if (!acc[key]) acc[key] = []
      acc[key].push(spell)
      return acc
    },
    {} as Record<number, Spell[]>
  )

  const togglePrepared = (spellIndex: number) => {
    const updated = [...spellcasting.spells]
    updated[spellIndex] = { ...updated[spellIndex], prepared: !updated[spellIndex].prepared }
    onChange({ ...spellcasting, spells: updated })
  }

  const removeSpell = (spellIndex: number) => {
    const updated = spellcasting.spells.filter((_, i) => i !== spellIndex)
    onChange({ ...spellcasting, spells: updated })
  }

  const updateSlot = (slotIndex: number, slot: SpellSlot) => {
    const updated = [...spellcasting.spellSlots]
    updated[slotIndex] = slot
    onChange({ ...spellcasting, spellSlots: updated })
  }

  const addSpell = (spell: Spell) => {
    onChange({ ...spellcasting, spells: [...spellcasting.spells, spell] })
  }

  const levelLabels: Record<number, string> = {
    0: 'Cantrips',
    1: '1st Level',
    2: '2nd Level',
    3: '3rd Level',
    4: '4th Level',
    5: '5th Level',
    6: '6th Level',
    7: '7th Level',
    8: '8th Level',
    9: '9th Level',
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Spellcasting</h3>
        </div>
      </div>

      {/* Spell stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 rounded-lg border border-border bg-card text-center">
          <p className="text-[10px] text-muted-foreground">Save DC</p>
          {editing ? (
            <input
              type="text"
              inputMode="numeric"
              value={spellcasting.saveDC}
              onChange={(e) => onChange({ ...spellcasting, saveDC: parseInt(e.target.value) || 0 })}
              className="w-10 text-center text-sm font-bold bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground mx-auto block"
            />
          ) : (
            <p className="text-sm font-bold text-foreground">{spellcasting.saveDC}</p>
          )}
        </div>
        <div className="p-2 rounded-lg border border-border bg-card text-center">
          <p className="text-[10px] text-muted-foreground">Attack</p>
          {editing ? (
            <input
              type="text"
              inputMode="numeric"
              value={spellcasting.attackBonus}
              onChange={(e) => onChange({ ...spellcasting, attackBonus: parseInt(e.target.value) || 0 })}
              className="w-10 text-center text-sm font-bold bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground mx-auto block"
            />
          ) : (
            <p className="text-sm font-bold text-foreground">+{spellcasting.attackBonus}</p>
          )}
        </div>
        <div className="p-2 rounded-lg border border-border bg-card text-center">
          <p className="text-[10px] text-muted-foreground">Ability</p>
          {editing ? (
            <input
              type="text"
              value={spellcasting.ability}
              onChange={(e) => onChange({ ...spellcasting, ability: e.target.value })}
              className="w-12 text-center text-sm font-bold bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground mx-auto block"
            />
          ) : (
            <p className="text-sm font-bold text-foreground">{spellcasting.ability}</p>
          )}
        </div>
      </div>

      {/* Spell slots */}
      {spellcasting.spellSlots.length > 0 && (
        <div className="space-y-1">
          <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Spell Slots</h4>
          {spellcasting.spellSlots.map((slot, i) => (
            <SpellSlotTracker key={slot.level} slot={slot} onChange={(s) => updateSlot(i, s)} />
          ))}
        </div>
      )}

      {/* Spells grouped by level */}
      <div className="space-y-3">
        {Object.entries(spellsByLevel)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, spells]) => (
            <div key={level}>
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                {levelLabels[Number(level)] || `Level ${level}`}
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                {spells.map((spell) => {
                  const globalIndex = spellcasting.spells.indexOf(spell)
                  return (
                    <SpellCard
                      key={`${spell.name}-${globalIndex}`}
                      spell={spell}
                      editing={editing}
                      onTogglePrepared={() => togglePrepared(globalIndex)}
                      onRemove={() => removeSpell(globalIndex)}
                    />
                  )
                })}
              </div>
            </div>
          ))}
      </div>

      {editing && (
        <SpellPicker characterClass={characterClass} onAdd={addSpell} />
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { BookOpen, X } from 'lucide-react'
import type { Spellcasting, Spell, SpellSlot } from '@/types/character-sheet'
import SpellPicker from './SpellPicker'
import { SpellDetailDialog } from './SpellDetailDialog'

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
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-ink-secondary w-8 flex-shrink-0">Lv {slot.level}</span>
      <div className="flex gap-1 flex-wrap">
        {Array.from({ length: slot.total }).map((_, i) => {
          const isUsed = i < slot.used
          return (
            <button
              key={i}
              onClick={() => onChange({ ...slot, used: isUsed ? i : i + 1 })}
              className="w-4 h-4 rounded-full border-2 transition-all hover:scale-110"
              title={isUsed ? 'Click to restore' : 'Click to use'}
              style={{
                borderColor: 'var(--mystic-purple)',
                backgroundColor: isUsed ? 'transparent' : 'var(--mystic-purple)',
                opacity: isUsed ? 0.25 : 0.9,
              }}
            />
          )
        })}
      </div>
      <span className="text-[10px] text-ink-secondary">
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
  onClick,
}: {
  spell: Spell
  editing: boolean
  onTogglePrepared: () => void
  onRemove: () => void
  onClick: () => void
}) {
  return (
    <div
      className={`relative p-2 dnd-frame-light parchment-inner transition-opacity cursor-pointer hover:brightness-95 active:scale-[0.98] ${
        spell.prepared ? '' : 'opacity-50'
      }`}
      onClick={onClick}
    >
      {editing && (
        <button
          onClick={(e) => { e.stopPropagation(); onRemove() }}
          className="absolute top-0.5 right-0.5 p-0.5 rounded text-ink-secondary hover:text-crimson transition-colors z-10"
        >
          <X className="w-2.5 h-2.5" />
        </button>
      )}
      <div className="flex items-start gap-1.5">
        <button
          onClick={(e) => { e.stopPropagation(); onTogglePrepared() }}
          className="mt-0.5 flex-shrink-0"
          title={spell.prepared ? 'Prepared' : 'Not prepared'}
        >
          {spell.prepared ? (
            <span className="text-xs" style={{ color: 'var(--mystic-purple)' }}>●</span>
          ) : (
            <span className="text-xs text-ink-secondary">○</span>
          )}
        </button>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold text-ink truncate">{spell.name}</p>
          <div className="flex items-center gap-1 mt-0.5">
            {spell.level === 0 && (
              <span className="text-[9px] text-ink-secondary">Cantrip</span>
            )}
            {spell.concentration && (
              <span className="text-[9px] px-1 rounded border" style={{ borderColor: 'var(--gold)', color: 'var(--gold-dark)', backgroundColor: 'color-mix(in srgb, var(--gold) 15%, transparent)' }}>C</span>
            )}
            {spell.ritual && (
              <span className="text-[9px] px-1 rounded border" style={{ borderColor: 'var(--royal-blue)', color: 'var(--royal-blue)', backgroundColor: 'color-mix(in srgb, var(--royal-blue) 15%, transparent)' }}>R</span>
            )}
            {spell.school && (
              <span className="text-[9px] text-ink-secondary">{spell.school}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SpellSection({ spellcasting, editing, characterClass, onChange }: SpellSectionProps) {
  const [selectedSpell, setSelectedSpell] = useState<string | null>(null)
  const [spellDialogOpen, setSpellDialogOpen] = useState(false)

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

  const openSpellDetail = (spellName: string) => {
    setSelectedSpell(spellName)
    setSpellDialogOpen(true)
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
      <div className="flex items-center gap-2">
        <BookOpen className="w-4 h-4" style={{ color: 'var(--mystic-purple)' }} />
        <h3 className="dnd-section-title">Spellcasting</h3>
      </div>

      {/* Spell stats */}
      <div className="grid grid-cols-3 gap-2">
        <div className="p-2 dnd-frame-light parchment-inner text-center">
          <p className="text-[10px] text-ink-secondary">Save DC</p>
          {editing ? (
            <input
              type="text"
              inputMode="numeric"
              value={spellcasting.saveDC}
              onChange={(e) => onChange({ ...spellcasting, saveDC: parseInt(e.target.value) || 0 })}
              className="w-10 text-center text-sm font-bold bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink mx-auto block"
            />
          ) : (
            <p className="text-sm font-bold text-ink">{spellcasting.saveDC}</p>
          )}
        </div>
        <div className="p-2 dnd-frame-light parchment-inner text-center">
          <p className="text-[10px] text-ink-secondary">Attack</p>
          {editing ? (
            <input
              type="text"
              inputMode="numeric"
              value={spellcasting.attackBonus}
              onChange={(e) => onChange({ ...spellcasting, attackBonus: parseInt(e.target.value) || 0 })}
              className="w-10 text-center text-sm font-bold bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink mx-auto block"
            />
          ) : (
            <p className="text-sm font-bold text-ink">+{spellcasting.attackBonus}</p>
          )}
        </div>
        <div className="p-2 dnd-frame-light parchment-inner text-center">
          <p className="text-[10px] text-ink-secondary">Ability</p>
          {editing ? (
            <input
              type="text"
              value={spellcasting.ability}
              onChange={(e) => onChange({ ...spellcasting, ability: e.target.value })}
              className="w-12 text-center text-sm font-bold bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink mx-auto block"
            />
          ) : (
            <p className="text-sm font-bold text-ink">{spellcasting.ability}</p>
          )}
        </div>
      </div>

      {/* Spell slots — dot style */}
      {spellcasting.spellSlots.length > 0 && (
        <div className="space-y-1.5 p-2 dnd-frame-light parchment-inner">
          <h4 className="dnd-section-title text-[10px] mb-2">Spell Slots</h4>
          {spellcasting.spellSlots.map((slot, i) => (
            <SpellSlotTracker key={slot.level} slot={slot} onChange={(s) => updateSlot(i, s)} />
          ))}
        </div>
      )}

      {/* Spells grouped by level */}
      <div className="space-y-3">
        {Object.entries(spellsByLevel)
          .sort(([a], [b]) => Number(a) - Number(b))
          .map(([level, spells], idx) => (
            <div key={level}>
              {idx > 0 && <div className="dnd-divider" />}
              <h4 className="dnd-section-title text-[10px] mb-1.5">
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
                      onClick={() => openSpellDetail(spell.name)}
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

      <SpellDetailDialog
        spellName={selectedSpell}
        open={spellDialogOpen}
        onOpenChange={setSpellDialogOpen}
      />
    </div>
  )
}

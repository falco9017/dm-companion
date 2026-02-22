'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, Plus, X } from 'lucide-react'
import type { Spell } from '@/types/character-sheet'
import spellsData from '@/data/spells-5e.json'

interface SpellEntry {
  name: string
  level: number
  school: string
  casting_time: string
  range: string
  components: string
  duration: string
  ritual: boolean
  concentration: boolean
  classes: string[]
}

const ALL_SPELLS: SpellEntry[] = spellsData as SpellEntry[]

interface SpellPickerProps {
  characterClass?: string
  onAdd: (spell: Spell) => void
}

const LEVEL_LABELS: Record<number, string> = {
  0: 'Cantrip',
  1: '1st',
  2: '2nd',
  3: '3rd',
  4: '4th',
  5: '5th',
  6: '6th',
  7: '7th',
  8: '8th',
  9: '9th',
}

export default function SpellPicker({ characterClass, onAdd }: SpellPickerProps) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const filtered = ALL_SPELLS.filter((s) => {
    const matchesQuery = query.length < 2 || s.name.toLowerCase().includes(query.toLowerCase())
    const matchesLevel = levelFilter === null || s.level === levelFilter
    return matchesQuery && matchesLevel
  }).slice(0, 50) // cap results for performance

  const handleSelect = (entry: SpellEntry) => {
    onAdd({
      name: entry.name,
      level: entry.level,
      school: entry.school,
      concentration: entry.concentration,
      ritual: entry.ritual,
      prepared: false,
      description: `Casting time: ${entry.casting_time} | Range: ${entry.range} | Duration: ${entry.duration} | Components: ${entry.components}`,
    })
    setQuery('')
    setLevelFilter(null)
    setOpen(false)
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 text-xs text-gold-dark hover:text-gold transition-colors"
      >
        <Plus className="w-3.5 h-3.5" /> Add Spell
      </button>

      {open && (
        <div className="absolute bottom-full mb-2 left-0 z-50 w-80 dnd-frame parchment-inner overflow-hidden">
          {/* Search */}
          <div className="p-2 border-b border-gold/30">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-secondary" />
              <input
                autoFocus
                type="text"
                placeholder="Search spells…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-sm rounded-lg border border-gold/30 bg-transparent text-ink focus:outline-none focus:border-gold"
              />
              {query && (
                <button
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-secondary hover:text-ink"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Level filter chips */}
            <div className="flex gap-1 mt-2 flex-wrap">
              <button
                onClick={() => setLevelFilter(null)}
                className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                  levelFilter === null
                    ? 'border-gold text-gold-dark'
                    : 'border-gold/30 text-ink-secondary hover:text-ink'
                }`}
                style={levelFilter === null ? { backgroundColor: 'color-mix(in srgb, var(--gold) 20%, transparent)' } : undefined}
              >
                All
              </button>
              {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setLevelFilter(levelFilter === lvl ? null : lvl)}
                  className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors ${
                    levelFilter === lvl
                      ? 'border-gold text-gold-dark'
                      : 'border-gold/30 text-ink-secondary hover:text-ink'
                  }`}
                  style={levelFilter === lvl ? { backgroundColor: 'color-mix(in srgb, var(--gold) 20%, transparent)' } : undefined}
                >
                  {LEVEL_LABELS[lvl]}
                </button>
              ))}
            </div>
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto">
            {filtered.length === 0 ? (
              <p className="text-center text-ink-secondary text-xs py-4">No spells found</p>
            ) : (
              filtered.map((spell) => (
                <button
                  key={spell.name}
                  type="button"
                  onClick={() => handleSelect(spell)}
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gold/10 transition-colors text-left group"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium text-ink truncate">{spell.name}</span>
                      {spell.concentration && (
                        <span className="text-[9px] px-1 rounded border shrink-0" style={{ borderColor: 'var(--gold)', color: 'var(--gold-dark)', backgroundColor: 'color-mix(in srgb, var(--gold) 15%, transparent)' }}>C</span>
                      )}
                      {spell.ritual && (
                        <span className="text-[9px] px-1 rounded border shrink-0" style={{ borderColor: 'var(--royal-blue)', color: 'var(--royal-blue)', backgroundColor: 'color-mix(in srgb, var(--royal-blue) 15%, transparent)' }}>R</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[10px] text-ink-secondary">
                        {spell.level === 0 ? 'Cantrip' : `${LEVEL_LABELS[spell.level]}-level`} {spell.school}
                      </span>
                      {characterClass && spell.classes.some(
                        (c) => c.toLowerCase() === characterClass.toLowerCase()
                      ) && (
                        <span className="text-[9px] px-1 rounded border" style={{ borderColor: 'var(--forest)', color: 'var(--forest)', backgroundColor: 'color-mix(in srgb, var(--forest) 15%, transparent)' }}>
                          {characterClass}
                        </span>
                      )}
                    </div>
                  </div>
                  <Plus className="w-3 h-3 text-ink-secondary group-hover:text-gold-dark transition-colors shrink-0" />
                </button>
              ))
            )}
          </div>

          {filtered.length === 50 && (
            <p className="text-center text-ink-secondary text-[10px] py-1.5 border-t border-gold/30">
              Showing first 50 results — type to narrow down
            </p>
          )}
        </div>
      )}
    </div>
  )
}

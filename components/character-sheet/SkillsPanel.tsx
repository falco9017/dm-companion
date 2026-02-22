'use client'

import type { Skill } from '@/types/character-sheet'

interface SkillsPanelProps {
  skills: Skill[]
  editing: boolean
  onChange: (skills: Skill[]) => void
}

export default function SkillsPanel({ skills, editing, onChange }: SkillsPanelProps) {
  const toggleProficiency = (index: number) => {
    const updated = [...skills]
    const skill = { ...updated[index] }
    if (skill.expertise) {
      skill.expertise = false
      skill.proficient = false
    } else if (skill.proficient) {
      skill.expertise = true
    } else {
      skill.proficient = true
    }
    updated[index] = skill
    onChange(updated)
  }

  const updateModifier = (index: number, value: number) => {
    const updated = [...skills]
    updated[index] = { ...updated[index], modifier: value }
    onChange(updated)
  }

  return (
    <div className="space-y-1.5">
      <h3 className="dnd-section-title dnd-header-border">Skills</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0">
        {skills.map((skill, i) => {
          const modStr = skill.modifier >= 0 ? `+${skill.modifier}` : `${skill.modifier}`
          return (
            <div key={skill.name} className="flex items-center gap-1.5 py-1 group border-b border-gold/10">
              <button
                onClick={() => (editing ? toggleProficiency(i) : undefined)}
                className={`flex-shrink-0 ${editing ? 'cursor-pointer' : 'cursor-default'}`}
              >
                {skill.expertise ? (
                  <span className="flex gap-0.5">
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--gold)' }} />
                    <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--gold)' }} />
                  </span>
                ) : skill.proficient ? (
                  <span className="w-2 h-2 rounded-full inline-block" style={{ background: 'var(--gold)' }} />
                ) : (
                  <span className="w-2 h-2 rounded-full inline-block border border-gold/40" />
                )}
              </button>
              {editing ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={skill.modifier}
                  onChange={(e) => updateModifier(i, parseInt(e.target.value) || 0)}
                  className="w-8 text-xs text-center bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink"
                />
              ) : (
                <span className="text-xs font-mono text-ink w-6 text-right">{modStr}</span>
              )}
              <span className="text-xs text-ink truncate">{skill.name}</span>
              <span className="text-[9px] px-1 py-0.5 rounded bg-parchment-dark/50 text-ink-secondary">{skill.ability}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

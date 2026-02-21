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
      <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Skills</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-0.5">
        {skills.map((skill, i) => {
          const modStr = skill.modifier >= 0 ? `+${skill.modifier}` : `${skill.modifier}`
          return (
            <div key={skill.name} className="flex items-center gap-1.5 py-0.5 group">
              <button
                onClick={() => (editing ? toggleProficiency(i) : undefined)}
                className={`text-xs flex-shrink-0 ${editing ? 'cursor-pointer' : 'cursor-default'}`}
                title={
                  skill.expertise
                    ? 'Expertise'
                    : skill.proficient
                      ? 'Proficient (click for expertise)'
                      : 'Not proficient'
                }
              >
                {skill.expertise ? (
                  <span className="text-primary">◆◆</span>
                ) : skill.proficient ? (
                  <span className="text-primary">◆</span>
                ) : (
                  <span className="text-muted-foreground">○</span>
                )}
              </button>
              {editing ? (
                <input
                  type="text"
                  inputMode="numeric"
                  value={skill.modifier}
                  onChange={(e) => updateModifier(i, parseInt(e.target.value) || 0)}
                  className="w-8 text-xs text-center bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground"
                />
              ) : (
                <span className="text-xs font-mono text-foreground w-6 text-right">{modStr}</span>
              )}
              <span className="text-xs text-muted-foreground truncate">{skill.name}</span>
              <span className="text-[9px] text-muted-foreground">({skill.ability})</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

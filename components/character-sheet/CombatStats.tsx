'use client'

import { Shield, Zap, Footprints } from 'lucide-react'

interface CombatStatsProps {
  armorClass: number
  initiative: number
  speed: number
  proficiencyBonus: number
  editing: boolean
  onChange: (field: string, value: number) => void
}

function StatBox({
  icon: Icon,
  label,
  value,
  editing,
  onChange,
  color,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  editing: boolean
  onChange: (v: number) => void
  color: string
}) {
  return (
    <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-card">
      <Icon className={`w-4 h-4 ${color}`} />
      {editing ? (
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-12 text-center text-lg font-bold bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground"
        />
      ) : (
        <span className="text-lg font-bold text-foreground">{value}</span>
      )}
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
    </div>
  )
}

export default function CombatStats({
  armorClass,
  initiative,
  speed,
  proficiencyBonus,
  editing,
  onChange,
}: CombatStatsProps) {
  const initStr = initiative >= 0 ? `+${initiative}` : `${initiative}`

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        <StatBox
          icon={Shield}
          label="AC"
          value={armorClass}
          editing={editing}
          onChange={(v) => onChange('armorClass', v)}
          color="text-blue-400"
        />
        <div className="flex flex-col items-center gap-1 p-2 rounded-lg border border-border bg-card">
          <Zap className="w-4 h-4 text-amber-400" />
          {editing ? (
            <input
              type="text"
            inputMode="numeric"
              value={initiative}
              onChange={(e) => onChange('initiative', parseInt(e.target.value) || 0)}
              className="w-12 text-center text-lg font-bold bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground"
            />
          ) : (
            <span className="text-lg font-bold text-foreground">{initStr}</span>
          )}
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Init</span>
        </div>
        <StatBox
          icon={Footprints}
          label="Speed"
          value={speed}
          editing={editing}
          onChange={(v) => onChange('speed', v)}
          color="text-emerald-400"
        />
      </div>
      <div className="flex items-center justify-center gap-2 p-2 rounded-lg border border-border bg-card">
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Prof. Bonus</span>
        {editing ? (
          <input
            type="text"
            inputMode="numeric"
            value={proficiencyBonus}
            onChange={(e) => onChange('proficiencyBonus', parseInt(e.target.value) || 0)}
            className="w-10 text-center text-sm font-bold bg-transparent border-b border-border focus:border-primary focus:outline-none text-foreground"
          />
        ) : (
          <span className="text-sm font-bold text-primary">
            +{proficiencyBonus}
          </span>
        )}
      </div>
    </div>
  )
}

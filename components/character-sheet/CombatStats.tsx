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
  displayValue,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number
  editing: boolean
  onChange: (v: number) => void
  color: string
  displayValue?: string
}) {
  return (
    <div className="relative flex flex-col items-center gap-1 p-3 pt-5 dnd-frame-light parchment-inner">
      {/* Floating icon badge */}
      <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-6 h-6 rounded-full border-2 border-gold-dark flex items-center justify-center parchment-inner`}>
        <Icon className={`w-3 h-3 ${color}`} />
      </div>
      {editing ? (
        <input
          type="text"
          inputMode="numeric"
          value={value}
          onChange={(e) => onChange(parseInt(e.target.value) || 0)}
          className="w-12 text-center text-lg font-bold bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink"
        />
      ) : (
        <span className="text-lg font-bold text-ink">{displayValue ?? value}</span>
      )}
      <span className="dnd-section-title text-[10px]">{label}</span>
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
      <div className="grid grid-cols-3 gap-3">
        <StatBox
          icon={Shield}
          label="AC"
          value={armorClass}
          editing={editing}
          onChange={(v) => onChange('armorClass', v)}
          color="text-royal-blue"
        />
        <StatBox
          icon={Zap}
          label="Init"
          value={initiative}
          editing={editing}
          onChange={(v) => onChange('initiative', v)}
          color="text-gold-dark"
          displayValue={initStr}
        />
        <StatBox
          icon={Footprints}
          label="Speed"
          value={speed}
          editing={editing}
          onChange={(v) => onChange('speed', v)}
          color="text-forest"
        />
      </div>
      <div className="flex items-center justify-center gap-2 px-3 py-1.5 dnd-frame-light parchment-inner rounded-full mx-auto w-fit">
        <span className="dnd-section-title text-[10px]">Prof. Bonus</span>
        {editing ? (
          <input
            type="text"
            inputMode="numeric"
            value={proficiencyBonus}
            onChange={(e) => onChange('proficiencyBonus', parseInt(e.target.value) || 0)}
            className="w-10 text-center text-sm font-bold bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink"
          />
        ) : (
          <span className="text-sm font-bold text-gold-dark">
            +{proficiencyBonus}
          </span>
        )}
      </div>
    </div>
  )
}

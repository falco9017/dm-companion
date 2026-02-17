'use client'

import { Sword, Shield, Sparkles, Package, X } from 'lucide-react'
import type { EquipmentItem } from '@/types/character-sheet'

interface EquipmentCardProps {
  item: EquipmentItem
  editing: boolean
  onUpdate: (item: EquipmentItem) => void
  onRemove: () => void
}

export default function EquipmentCard({ item, editing, onUpdate, onRemove }: EquipmentCardProps) {
  const isWeapon = !!item.damage
  const isArmor = item.name.toLowerCase().includes('armor') ||
    item.name.toLowerCase().includes('shield') ||
    item.name.toLowerCase().includes('mail')

  const Icon = isWeapon ? Sword : isArmor ? Shield : Package

  return (
    <div
      className={`relative p-3 rounded-lg border bg-surface-elevated transition-colors ${
        item.magical
          ? 'border-amber-500/40 shadow-[0_0_8px_rgba(245,158,11,0.1)]'
          : 'border-border-theme'
      }`}
    >
      {editing && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 p-0.5 rounded text-text-muted hover:text-red-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="flex items-start gap-2">
        <div className={`mt-0.5 ${item.magical ? 'text-amber-400' : 'text-text-muted'}`}>
          {item.magical ? <Sparkles className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate({ ...item, name: e.target.value })}
              className="text-xs font-semibold text-text-primary bg-transparent border-b border-border-theme focus:border-accent-purple focus:outline-none w-full"
            />
          ) : (
            <p className="text-xs font-semibold text-text-primary truncate">{item.name}</p>
          )}
          {item.damage && (
            <p className="text-[10px] text-red-400 mt-0.5">{item.damage}{item.attackBonus ? ` (+${item.attackBonus})` : ''}</p>
          )}
          {item.description && !editing && (
            <p className="text-[10px] text-text-muted mt-0.5 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {item.quantity > 1 && (
              <span className="text-[10px] text-text-muted">x{item.quantity}</span>
            )}
            <button
              onClick={() => onUpdate({ ...item, equipped: !item.equipped })}
              className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                item.equipped
                  ? 'border-emerald-500/40 text-emerald-400 bg-emerald-500/10'
                  : 'border-border-theme text-text-muted'
              }`}
            >
              {item.equipped ? 'Equipped' : 'Unequipped'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

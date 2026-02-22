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
      className={`relative p-3 dnd-frame-light parchment-inner dnd-card-hover ${
        item.magical ? 'dnd-magical-glow' : ''
      }`}
    >
      {editing && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 p-0.5 rounded text-ink-secondary hover:text-crimson transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="flex items-start gap-2">
        <div className={`mt-0.5 ${item.magical ? 'text-gold' : 'text-ink-secondary'}`}>
          {item.magical ? <Sparkles className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
        </div>
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={item.name}
              onChange={(e) => onUpdate({ ...item, name: e.target.value })}
              className="text-xs font-semibold text-ink bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none w-full"
            />
          ) : (
            <p className="text-xs font-semibold text-ink truncate">{item.name}</p>
          )}
          {/* Gold separator */}
          <div className="h-px my-1" style={{ background: 'linear-gradient(90deg, var(--gold), transparent)' }} />
          {item.damage && (
            <p className="text-[10px] font-bold mt-0.5" style={{ color: 'var(--crimson)' }}>
              {item.damage}{item.attackBonus ? ` (+${item.attackBonus})` : ''}
            </p>
          )}
          {item.description && !editing && (
            <p className="text-[10px] text-ink-secondary mt-0.5 line-clamp-2">{item.description}</p>
          )}
          <div className="flex items-center gap-2 mt-1">
            {item.quantity > 1 && (
              <span className="text-[10px] text-ink-secondary">x{item.quantity}</span>
            )}
            <button
              onClick={() => onUpdate({ ...item, equipped: !item.equipped })}
              className={`text-[10px] px-1.5 py-0.5 rounded-full border transition-colors ${
                item.equipped
                  ? 'border-forest/50 bg-forest/15'
                  : 'border-gold/30 text-ink-secondary'
              }`}
              style={item.equipped ? { color: 'var(--forest)' } : undefined}
            >
              {item.equipped ? 'Equipped' : 'Stowed'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Sword, Shield, Sparkles, Package, X } from 'lucide-react'
import type { EquipmentItem } from '@/types/character-sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

interface EquipmentCardProps {
  item: EquipmentItem
  editing: boolean
  onUpdate: (item: EquipmentItem) => void
  onRemove: () => void
}

export default function EquipmentCard({ item, editing, onUpdate, onRemove }: EquipmentCardProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const isWeapon = !!item.damage
  const isArmor = item.name.toLowerCase().includes('armor') ||
    item.name.toLowerCase().includes('shield') ||
    item.name.toLowerCase().includes('mail')

  const Icon = isWeapon ? Sword : isArmor ? Shield : Package

  return (
    <>
      <div
        className={`relative p-3 dnd-frame-light parchment-inner dnd-card-hover cursor-pointer ${
          item.magical ? 'dnd-magical-glow' : ''
        }`}
        onClick={() => !editing && setDialogOpen(true)}
      >
        {editing && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemove() }}
            className="absolute top-1 right-1 p-0.5 rounded text-ink-secondary hover:text-crimson transition-colors z-10"
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
                onClick={(e) => e.stopPropagation()}
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
                onClick={(e) => { e.stopPropagation(); onUpdate({ ...item, equipped: !item.equipped }) }}
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

      {/* Detail popup */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className={item.magical ? 'text-gold' : 'text-muted-foreground'}>
                {item.magical ? <Sparkles className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
              </div>
              {item.name}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="flex flex-wrap gap-2">
              {item.magical && (
                <Badge variant="outline" className="border-amber-500/50 text-amber-600 dark:text-amber-400">
                  Magical
                </Badge>
              )}
              {item.quantity > 1 && (
                <Badge variant="secondary">×{item.quantity}</Badge>
              )}
              <Badge variant={item.equipped ? 'default' : 'outline'}>
                {item.equipped ? 'Equipped' : 'Stowed'}
              </Badge>
            </div>
            {item.damage && (
              <div>
                <p className="text-xs font-semibold text-muted-foreground mb-1">Combat</p>
                <p className="text-sm font-bold" style={{ color: 'var(--crimson)' }}>
                  {item.damage}
                  {item.attackBonus ? ` · +${item.attackBonus} to hit` : ''}
                </p>
              </div>
            )}
            {item.weight ? (
              <p className="text-xs text-muted-foreground">{item.weight} lb</p>
            ) : null}
            {item.description ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
            ) : (
              <p className="text-sm text-muted-foreground italic">No description.</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

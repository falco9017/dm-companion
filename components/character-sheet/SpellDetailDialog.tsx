'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Loader2 } from 'lucide-react'

interface DndApiSpell {
  name: string
  level: number
  school: { name: string }
  casting_time: string
  range: string
  duration: string
  components: string[]
  material?: string
  concentration: boolean
  ritual: boolean
  desc: string[]
  higher_level?: string[]
  classes: { name: string }[]
  damage?: {
    damage_type?: { name: string }
    damage_at_slot_level?: Record<string, string>
  }
}

function spellToSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export function SpellDetailDialog({
  spellName,
  open,
  onOpenChange,
}: {
  spellName: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  const [data, setData] = useState<DndApiSpell | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open || !spellName) return
    setLoading(true)
    setError(null)
    setData(null)
    const slug = spellToSlug(spellName)
    fetch(`https://www.dnd5eapi.co/api/spells/${slug}`)
      .then((res) => {
        if (!res.ok) throw new Error('Spell not found in the SRD database.')
        return res.json()
      })
      .then((json: DndApiSpell) => setData(json))
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false))
  }, [open, spellName])

  const levelLabel = data
    ? data.level === 0
      ? `Cantrip · ${data.school?.name}`
      : `Level ${data.level} · ${data.school?.name}`
    : null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{spellName}</DialogTitle>
          {levelLabel && (
            <p className="text-sm text-muted-foreground">{levelLabel}</p>
          )}
        </DialogHeader>

        {loading && (
          <div className="flex items-center justify-center py-8 gap-2 text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Looking up spell...</span>
          </div>
        )}

        {error && (
          <p className="text-sm text-muted-foreground italic py-4">{error}</p>
        )}

        {data && (
          <div className="space-y-4">
            {/* Properties grid */}
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs border rounded-md p-3 bg-muted/30">
              <div>
                <span className="font-semibold text-muted-foreground">Casting Time: </span>
                {data.casting_time}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Range: </span>
                {data.range}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Duration: </span>
                {data.duration}
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">Components: </span>
                {data.components.join(', ')}
                {data.material && ` (${data.material})`}
              </div>
            </div>

            {/* Tags */}
            <div className="flex gap-1.5 flex-wrap">
              {data.concentration && (
                <Badge variant="outline" className="text-xs border-amber-500/50 text-amber-600 dark:text-amber-400">
                  Concentration
                </Badge>
              )}
              {data.ritual && (
                <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-600 dark:text-blue-400">
                  Ritual
                </Badge>
              )}
              {data.damage?.damage_type && (
                <Badge variant="outline" className="text-xs border-destructive/50 text-destructive">
                  {data.damage.damage_type.name} damage
                </Badge>
              )}
              {data.classes?.map((c) => (
                <Badge key={c.name} variant="secondary" className="text-xs">
                  {c.name}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <div className="space-y-2">
              {data.desc.map((para, i) => (
                <p key={i} className="text-sm leading-relaxed">
                  {para}
                </p>
              ))}
            </div>

            {/* At higher levels */}
            {data.higher_level && data.higher_level.length > 0 && (
              <div className="border-t pt-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                  At Higher Levels
                </p>
                {data.higher_level.map((para, i) => (
                  <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                    {para}
                  </p>
                ))}
              </div>
            )}

            {/* Damage at slot level */}
            {data.damage?.damage_at_slot_level &&
              Object.keys(data.damage.damage_at_slot_level).length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Damage by Slot Level
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.entries(data.damage.damage_at_slot_level).map(([lvl, dmg]) => (
                      <span
                        key={lvl}
                        className="text-xs px-2 py-0.5 rounded-md border bg-muted/50"
                      >
                        Lv {lvl}: <strong>{dmg}</strong>
                      </span>
                    ))}
                  </div>
                </div>
              )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

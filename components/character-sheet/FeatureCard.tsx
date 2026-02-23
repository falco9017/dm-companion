'use client'

import { useState } from 'react'
import { X, Plus } from 'lucide-react'
import type { Feature } from '@/types/character-sheet'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

const GROUP_STYLES: Record<string, { accent: string; title: string; badge: string }> = {
  Class: {
    accent: 'var(--royal-blue)',
    title: 'Class Features',
    badge: 'color-mix(in srgb, var(--royal-blue) 15%, transparent)',
  },
  Race: {
    accent: 'var(--forest)',
    title: 'Race Features',
    badge: 'color-mix(in srgb, var(--forest) 15%, transparent)',
  },
  Background: {
    accent: 'var(--gold-dark)',
    title: 'Background Features',
    badge: 'color-mix(in srgb, var(--gold-dark) 15%, transparent)',
  },
}

interface FeatureRowProps {
  feature: Feature
  editing: boolean
  onUpdate: (feature: Feature) => void
  onRemove: () => void
  accentColor: string
}

function FeatureRow({ feature, editing, onUpdate, onRemove, accentColor }: FeatureRowProps) {
  const [dialogOpen, setDialogOpen] = useState(false)
  const hasUses = feature.usesMax !== undefined && feature.usesMax > 0
  const isFeat = feature.source === 'Feat'

  return (
    <>
      <div
        className={`group relative py-2 px-2 rounded-md transition-colors ${!editing ? 'cursor-pointer hover:bg-parchment-dark/30' : ''}`}
        onClick={() => !editing && setDialogOpen(true)}
      >
        {/* Name row */}
        <div className="flex items-start gap-1.5">
          <span
            className="mt-[3px] w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: accentColor, opacity: 0.8 }}
          />
          <div className="flex-1 min-w-0">
            {editing ? (
              <div className="flex items-center gap-1">
                <input
                  type="text"
                  value={feature.name}
                  onChange={(e) => onUpdate({ ...feature, name: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 text-xs font-semibold text-ink bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none"
                />
                {/* Source override for Feat */}
                <select
                  value={feature.source}
                  onChange={(e) => onUpdate({ ...feature, source: e.target.value })}
                  onClick={(e) => e.stopPropagation()}
                  className="text-[10px] text-ink-secondary bg-parchment-dark/40 border border-gold/30 rounded px-1 py-0.5 focus:outline-none"
                >
                  <option value="Class">Class</option>
                  <option value="Race">Race</option>
                  <option value="Background">Background</option>
                  <option value="Feat">Feat</option>
                </select>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-semibold text-ink leading-snug">{feature.name}</span>
                {isFeat && (
                  <span className="text-[9px] px-1 py-0.5 rounded bg-mystic-purple/15 text-mystic-purple border border-mystic-purple/30 leading-none">
                    Feat
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {editing ? (
              <textarea
                value={feature.description}
                onChange={(e) => onUpdate({ ...feature, description: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                rows={2}
                className="w-full mt-1 text-[10px] text-ink-secondary bg-transparent border border-gold/30 rounded p-1 focus:border-gold focus:outline-none resize-none"
              />
            ) : (
              feature.description && (
                <p className="text-[10px] text-ink-secondary mt-0.5 line-clamp-2 leading-snug">
                  {feature.description}
                </p>
              )
            )}

            {/* Use tokens */}
            {hasUses && (
              <div className="flex items-center gap-1 mt-1.5 flex-wrap">
                {editing && (
                  <div className="flex items-center gap-1 mr-1">
                    <span className="text-[10px] text-ink-secondary">Uses:</span>
                    <input
                      type="number"
                      min={0}
                      max={20}
                      value={feature.usesMax ?? 0}
                      onChange={(e) => onUpdate({ ...feature, usesMax: parseInt(e.target.value) || 0 })}
                      onClick={(e) => e.stopPropagation()}
                      className="w-8 text-[10px] text-center bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink"
                    />
                  </div>
                )}
                {Array.from({ length: feature.usesMax! }).map((_, i) => (
                  <button
                    key={i}
                    onClick={(e) => {
                      e.stopPropagation()
                      onUpdate({
                        ...feature,
                        usesCurrent: i < (feature.usesCurrent || 0) ? i : i + 1,
                      })
                    }}
                    className="w-4 h-4 rounded-full border-2 transition-colors flex-shrink-0"
                    style={{
                      borderColor: i < (feature.usesCurrent || 0) ? 'var(--mystic-purple)' : 'var(--gold)',
                      backgroundColor: i < (feature.usesCurrent || 0) ? 'var(--mystic-purple)' : 'transparent',
                      opacity: i < (feature.usesCurrent || 0) ? 1 : 0.4,
                    }}
                  />
                ))}
                <span className="text-[10px] text-ink-secondary">
                  {feature.usesCurrent || 0}/{feature.usesMax}
                </span>
              </div>
            )}

            {/* Uses setup in editing when no uses yet */}
            {editing && !hasUses && (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onUpdate({ ...feature, usesMax: 1, usesCurrent: 0 })
                }}
                className="mt-1 text-[10px] text-ink-secondary/50 hover:text-gold-dark transition-colors"
              >
                + add uses
              </button>
            )}
          </div>

          {editing && (
            <button
              onClick={(e) => { e.stopPropagation(); onRemove() }}
              className="flex-shrink-0 p-0.5 rounded text-ink-secondary/40 hover:text-crimson transition-colors opacity-0 group-hover:opacity-100"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      </div>

      {/* Detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[70vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{feature.name}</DialogTitle>
          </DialogHeader>
          {hasUses && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-muted-foreground">Uses:</span>
              <div className="flex gap-1 flex-wrap">
                {Array.from({ length: feature.usesMax! }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() =>
                      onUpdate({
                        ...feature,
                        usesCurrent: i < (feature.usesCurrent || 0) ? i : i + 1,
                      })
                    }
                    className="w-4 h-4 rounded-full border-2 transition-colors"
                    style={{
                      borderColor: i < (feature.usesCurrent || 0) ? 'var(--mystic-purple)' : 'var(--gold)',
                      backgroundColor: i < (feature.usesCurrent || 0) ? 'var(--mystic-purple)' : 'transparent',
                      opacity: i < (feature.usesCurrent || 0) ? 1 : 0.4,
                    }}
                  />
                ))}
                <span className="text-xs text-muted-foreground ml-1">
                  {feature.usesCurrent || 0}/{feature.usesMax}
                </span>
              </div>
            </div>
          )}
          {feature.description ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{feature.description}</p>
          ) : (
            <p className="text-sm text-muted-foreground italic">No description.</p>
          )}
        </DialogContent>
      </Dialog>
    </>
  )
}

// ── Group Card ────────────────────────────────────────────────────────────────

interface FeaturesGroupCardProps {
  source: 'Class' | 'Race' | 'Background'
  features: { feature: Feature; index: number }[]
  editing: boolean
  onUpdate: (index: number, feature: Feature) => void
  onRemove: (index: number) => void
  onAdd: () => void
}

export default function FeaturesGroupCard({
  source,
  features,
  editing,
  onUpdate,
  onRemove,
  onAdd,
}: FeaturesGroupCardProps) {
  const style = GROUP_STYLES[source]

  return (
    <div className="flex flex-col dnd-frame parchment-inner overflow-hidden">
      {/* Header */}
      <div
        className="px-3 py-2 flex items-center justify-between flex-shrink-0"
        style={{
          borderBottom: `2px solid color-mix(in srgb, ${style.accent} 40%, transparent)`,
          background: `color-mix(in srgb, ${style.accent} 8%, transparent)`,
        }}
      >
        <h4 className="dnd-section-title text-xs" style={{ color: style.accent }}>
          {style.title}
        </h4>
        {editing && (
          <button
            onClick={onAdd}
            className="flex items-center gap-0.5 text-[10px] transition-colors hover:opacity-80"
            style={{ color: style.accent }}
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      {/* Feature list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gold/20">
        {features.length === 0 ? (
          <p className="text-[10px] text-ink-secondary/50 text-center py-4 px-2 italic">
            No {style.title.toLowerCase()} yet.
          </p>
        ) : (
          features.map(({ feature, index }) => (
            <FeatureRow
              key={index}
              feature={feature}
              editing={editing}
              accentColor={style.accent}
              onUpdate={(updated) => onUpdate(index, updated)}
              onRemove={() => onRemove(index)}
            />
          ))
        )}
      </div>
    </div>
  )
}

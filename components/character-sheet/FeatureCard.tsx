'use client'

import { X, Plus } from 'lucide-react'
import type { Feature } from '@/types/character-sheet'

const GROUP_STYLES: Record<string, { accent: string; title: string }> = {
  Class: {
    accent: 'var(--royal-blue)',
    title: 'Class Features',
  },
  Race: {
    accent: 'var(--forest)',
    title: 'Race Features',
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
  const hasUses = feature.usesMax !== undefined && feature.usesMax > 0
  const isFeat = feature.source === 'Feat'

  return (
    <div className="group flex items-start gap-2 py-1.5">
      <span
        className="mt-[5px] w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ backgroundColor: accentColor, opacity: 0.75 }}
      />
      <div className="flex-1 min-w-0">
        {editing ? (
          <>
            <div className="flex items-center gap-1 mb-1">
              <input
                type="text"
                value={feature.name}
                onChange={(e) => onUpdate({ ...feature, name: e.target.value })}
                className="flex-1 text-xs font-semibold text-ink bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none"
              />
              <select
                value={feature.source}
                onChange={(e) => onUpdate({ ...feature, source: e.target.value })}
                className="text-[10px] text-ink-secondary bg-parchment-dark/40 border border-gold/30 rounded px-1 py-0.5 focus:outline-none"
              >
                <option value="Class">Class</option>
                <option value="Race">Race</option>
                <option value="Feat">Feat</option>
              </select>
            </div>
            <textarea
              value={feature.description}
              onChange={(e) => onUpdate({ ...feature, description: e.target.value })}
              rows={2}
              className="w-full text-[10px] text-ink-secondary bg-transparent border border-gold/30 rounded p-1 focus:border-gold focus:outline-none resize-none"
            />
          </>
        ) : (
          <>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-semibold text-ink leading-snug">{feature.name}</span>
              {isFeat && (
                <span className="text-[9px] px-1 py-0.5 rounded bg-mystic-purple/15 text-mystic-purple border border-mystic-purple/30 leading-none">
                  Feat
                </span>
              )}
            </div>
            {feature.description && (
              <p className="text-[10px] text-ink-secondary mt-0.5 leading-snug whitespace-pre-wrap">
                {feature.description}
              </p>
            )}
          </>
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
                  className="w-8 text-[10px] text-center bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none text-ink"
                />
              </div>
            )}
            {Array.from({ length: feature.usesMax! }).map((_, i) => (
              <button
                key={i}
                onClick={() =>
                  onUpdate({
                    ...feature,
                    usesCurrent: i < (feature.usesCurrent || 0) ? i : i + 1,
                  })
                }
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

        {editing && !hasUses && (
          <button
            onClick={() => onUpdate({ ...feature, usesMax: 1, usesCurrent: 0 })}
            className="mt-0.5 text-[10px] text-ink-secondary/50 hover:text-gold-dark transition-colors"
          >
            + add uses
          </button>
        )}
      </div>

      {editing && (
        <button
          onClick={onRemove}
          className="flex-shrink-0 p-0.5 rounded text-ink-secondary/40 hover:text-crimson transition-colors opacity-0 group-hover:opacity-100 mt-0.5"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
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
  const style = GROUP_STYLES[source] ?? GROUP_STYLES['Class']

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

      {/* Feature list — no dividers, even spacing via gap */}
      <div className="px-3 py-2 flex flex-col gap-2">
        {features.length === 0 ? (
          <p className="text-[10px] text-ink-secondary/50 text-center py-3 italic">
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

'use client'

import { Star, X } from 'lucide-react'
import type { Feature } from '@/types/character-sheet'

interface FeatureCardProps {
  feature: Feature
  editing: boolean
  onUpdate: (feature: Feature) => void
  onRemove: () => void
}

const sourceStyles: Record<string, { color: string; bg: string; border: string }> = {
  Class: { color: 'var(--royal-blue)', bg: 'var(--royal-blue)', border: 'var(--royal-blue)' },
  Race: { color: 'var(--forest)', bg: 'var(--forest)', border: 'var(--forest)' },
  Background: { color: 'var(--gold-dark)', bg: 'var(--gold-dark)', border: 'var(--gold-dark)' },
  Feat: { color: 'var(--mystic-purple)', bg: 'var(--mystic-purple)', border: 'var(--mystic-purple)' },
}

export default function FeatureCard({ feature, editing, onUpdate, onRemove }: FeatureCardProps) {
  const style = sourceStyles[feature.source] || { color: 'var(--ink-secondary)', bg: 'var(--ink-secondary)', border: 'var(--gold-dark)' }
  const hasUses = feature.usesMax !== undefined && feature.usesMax > 0

  return (
    <div className="relative p-3 dnd-frame-light parchment-inner dnd-card-hover">
      {editing && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 p-0.5 rounded text-ink-secondary hover:text-crimson transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="flex items-start gap-2">
        <Star className="w-3.5 h-3.5 mt-0.5 flex-shrink-0" style={{ color: style.color }} />
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={feature.name}
              onChange={(e) => onUpdate({ ...feature, name: e.target.value })}
              className="text-xs font-semibold text-ink bg-transparent border-b border-gold/40 focus:border-gold focus:outline-none w-full"
            />
          ) : (
            <p className="text-xs font-semibold text-ink">{feature.name}</p>
          )}
          <span
            className="text-[10px] px-1.5 py-0.5 rounded-full border inline-block mt-1"
            style={{
              color: style.color,
              borderColor: `color-mix(in srgb, ${style.border} 40%, transparent)`,
              backgroundColor: `color-mix(in srgb, ${style.bg} 12%, transparent)`,
            }}
          >
            {feature.source}
          </span>
          {editing ? (
            <textarea
              value={feature.description}
              onChange={(e) => onUpdate({ ...feature, description: e.target.value })}
              rows={2}
              className="w-full mt-1 text-[10px] text-ink-secondary bg-transparent border border-gold/30 rounded p-1 focus:border-gold focus:outline-none resize-none"
            />
          ) : (
            feature.description && (
              <p className="text-[10px] text-ink-secondary mt-1 line-clamp-3">{feature.description}</p>
            )
          )}
          {hasUses && (
            <div className="flex items-center gap-1 mt-1.5">
              {Array.from({ length: feature.usesMax! }).map((_, i) => (
                <button
                  key={i}
                  onClick={() =>
                    onUpdate({
                      ...feature,
                      usesCurrent: i < (feature.usesCurrent || 0) ? i : i + 1,
                    })
                  }
                  className="w-3.5 h-3.5 rounded-full border-2 transition-colors"
                  style={{
                    borderColor:
                      i < (feature.usesCurrent || 0)
                        ? 'var(--mystic-purple)'
                        : 'var(--gold)',
                    backgroundColor:
                      i < (feature.usesCurrent || 0)
                        ? 'var(--mystic-purple)'
                        : 'transparent',
                    opacity: i < (feature.usesCurrent || 0) ? 1 : 0.4,
                  }}
                />
              ))}
              <span className="text-[10px] text-ink-secondary ml-1">
                {feature.usesCurrent || 0}/{feature.usesMax}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

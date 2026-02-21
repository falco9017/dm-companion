'use client'

import { Star, X } from 'lucide-react'
import type { Feature } from '@/types/character-sheet'

interface FeatureCardProps {
  feature: Feature
  editing: boolean
  onUpdate: (feature: Feature) => void
  onRemove: () => void
}

const sourceColors: Record<string, string> = {
  Class: 'text-blue-400 border-blue-500/30',
  Race: 'text-emerald-400 border-emerald-500/30',
  Background: 'text-amber-400 border-amber-500/30',
  Feat: 'text-purple-400 border-purple-500/30',
}

export default function FeatureCard({ feature, editing, onUpdate, onRemove }: FeatureCardProps) {
  const colorClass = sourceColors[feature.source] || 'text-muted-foreground border-border'
  const hasUses = feature.usesMax !== undefined && feature.usesMax > 0

  return (
    <div className="relative p-3 rounded-lg border border-border bg-card">
      {editing && (
        <button
          onClick={onRemove}
          className="absolute top-1 right-1 p-0.5 rounded text-muted-foreground hover:text-red-400 transition-colors"
        >
          <X className="w-3 h-3" />
        </button>
      )}
      <div className="flex items-start gap-2">
        <Star className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          {editing ? (
            <input
              type="text"
              value={feature.name}
              onChange={(e) => onUpdate({ ...feature, name: e.target.value })}
              className="text-xs font-semibold text-foreground bg-transparent border-b border-border focus:border-primary focus:outline-none w-full"
            />
          ) : (
            <p className="text-xs font-semibold text-foreground">{feature.name}</p>
          )}
          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${colorClass} inline-block mt-1`}>
            {feature.source}
          </span>
          {editing ? (
            <textarea
              value={feature.description}
              onChange={(e) => onUpdate({ ...feature, description: e.target.value })}
              rows={2}
              className="w-full mt-1 text-[10px] text-muted-foreground bg-transparent border border-border rounded p-1 focus:border-primary focus:outline-none resize-none"
            />
          ) : (
            feature.description && (
              <p className="text-[10px] text-muted-foreground mt-1 line-clamp-3">{feature.description}</p>
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
                        ? 'rgb(139, 92, 246)'
                        : 'rgb(75, 85, 99)',
                    backgroundColor:
                      i < (feature.usesCurrent || 0)
                        ? 'rgb(139, 92, 246)'
                        : 'transparent',
                  }}
                />
              ))}
              <span className="text-[10px] text-muted-foreground ml-1">
                {feature.usesCurrent || 0}/{feature.usesMax}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

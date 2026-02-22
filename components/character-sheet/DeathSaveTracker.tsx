'use client'

interface DeathSaveTrackerProps {
  successes: number
  failures: number
  onChange: (saves: { successes: number; failures: number }) => void
}

export default function DeathSaveTracker({ successes, failures, onChange }: DeathSaveTrackerProps) {
  return (
    <div className="flex items-center gap-4 p-2 dnd-frame-light parchment-inner">
      <span className="dnd-section-title text-[10px]">Death Saves</span>
      <div className="flex items-center gap-1">
        <span className="text-[10px] mr-1" style={{ color: 'var(--forest)' }}>S</span>
        {[0, 1, 2].map((i) => (
          <button
            key={`s-${i}`}
            onClick={() => onChange({ successes: i < successes ? i : i + 1, failures })}
            className="w-4 h-4 rounded-full border-2 transition-colors"
            style={{
              borderColor: i < successes ? 'var(--forest)' : 'var(--gold)',
              backgroundColor: i < successes ? 'var(--forest)' : 'transparent',
              opacity: i < successes ? 1 : 0.4,
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] mr-1" style={{ color: 'var(--crimson)' }}>F</span>
        {[0, 1, 2].map((i) => (
          <button
            key={`f-${i}`}
            onClick={() => onChange({ successes, failures: i < failures ? i : i + 1 })}
            className="w-4 h-4 rounded-full border-2 transition-colors"
            style={{
              borderColor: i < failures ? 'var(--crimson)' : 'var(--gold)',
              backgroundColor: i < failures ? 'var(--crimson)' : 'transparent',
              opacity: i < failures ? 1 : 0.4,
            }}
          />
        ))}
      </div>
    </div>
  )
}

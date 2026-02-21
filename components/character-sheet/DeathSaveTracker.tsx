'use client'

interface DeathSaveTrackerProps {
  successes: number
  failures: number
  onChange: (saves: { successes: number; failures: number }) => void
}

export default function DeathSaveTracker({ successes, failures, onChange }: DeathSaveTrackerProps) {
  return (
    <div className="flex items-center gap-4 p-2 rounded-lg border border-border bg-card">
      <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Death Saves</span>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-emerald-400 mr-1">S</span>
        {[0, 1, 2].map((i) => (
          <button
            key={`s-${i}`}
            onClick={() => onChange({ successes: i < successes ? i : i + 1, failures })}
            className="w-4 h-4 rounded-full border-2 transition-colors"
            style={{
              borderColor: i < successes ? 'rgb(52, 211, 153)' : 'rgb(75, 85, 99)',
              backgroundColor: i < successes ? 'rgb(52, 211, 153)' : 'transparent',
            }}
          />
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span className="text-[10px] text-red-400 mr-1">F</span>
        {[0, 1, 2].map((i) => (
          <button
            key={`f-${i}`}
            onClick={() => onChange({ successes, failures: i < failures ? i : i + 1 })}
            className="w-4 h-4 rounded-full border-2 transition-colors"
            style={{
              borderColor: i < failures ? 'rgb(248, 113, 113)' : 'rgb(75, 85, 99)',
              backgroundColor: i < failures ? 'rgb(248, 113, 113)' : 'transparent',
            }}
          />
        ))}
      </div>
    </div>
  )
}

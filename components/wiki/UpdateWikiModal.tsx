'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { RefreshCw, Loader2 } from 'lucide-react'

interface UpdateWikiModalProps {
  campaignId: string
  isOpen: boolean
  onClose: () => void
}

export default function UpdateWikiModal({
  campaignId,
  isOpen,
  onClose,
}: UpdateWikiModalProps) {
  const router = useRouter()
  const [instructions, setInstructions] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ created: number; updated: number } | null>(null)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen) return null

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/wiki/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          campaignId,
          userInstructions: instructions.trim() || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Generation failed')
      }

      setResult({ created: data.created, updated: data.updated })
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setInstructions('')
    setResult(null)
    setError(null)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative glass-card-elevated bg-surface rounded-xl w-full max-w-lg mx-3">
        <div className="flex items-center justify-between p-6 border-b border-border-theme">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-accent-purple/20 flex items-center justify-center">
              <RefreshCw className="w-4 h-4 text-accent-purple-light" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">Update Wiki</h2>
          </div>
          <button
            onClick={handleClose}
            className="text-text-muted hover:text-text-primary text-xl transition-colors"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-text-muted text-sm">
            Analyze all session recaps and create or update wiki entries for characters, locations, items, and more.
          </p>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1">
              Additional instructions (optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Focus on the new NPCs from the latest session"
              className="w-full px-3 py-2.5 rounded-lg input-dark text-sm resize-none"
              rows={3}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-error/10 border border-error/20 rounded-lg text-red-400 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="p-3 bg-success/10 border border-success/20 rounded-lg text-emerald-400 text-sm">
              Done! Created {result.created} and updated {result.updated} entries.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded-lg text-text-muted hover:text-text-primary transition-colors"
              disabled={loading}
            >
              {result ? 'Close' : 'Cancel'}
            </button>
            {!result && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="btn-primary px-4 py-2 text-sm rounded-lg flex items-center gap-2"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <RefreshCw className="w-4 h-4" />
                )}
                {loading ? 'Analyzing sessions...' : 'Generate Wiki'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

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
      <div className="absolute inset-0 bg-black/60" onClick={handleClose} />
      <div className="relative bg-gray-900 border border-gray-700 rounded-xl w-full max-w-lg mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-800">
          <h2 className="text-xl font-bold text-white">Update Wiki</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            &times;
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-gray-400 text-sm">
            Analyze all session recaps and create or update wiki entries for characters, locations, items, and more.
          </p>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">
              Additional instructions (optional)
            </label>
            <textarea
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Focus on the new NPCs from the latest session"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-500 text-sm resize-none focus:outline-none focus:border-blue-500"
              rows={3}
              disabled={loading}
            />
          </div>

          {error && (
            <div className="p-3 bg-red-900/30 border border-red-800 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {result && (
            <div className="p-3 bg-green-900/30 border border-green-800 rounded-lg text-green-300 text-sm">
              Done! Created {result.created} and updated {result.updated} entries.
            </div>
          )}

          <div className="flex justify-end gap-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm rounded-lg text-gray-400 hover:text-white transition-colors"
              disabled={loading}
            >
              {result ? 'Close' : 'Cancel'}
            </button>
            {!result && (
              <button
                onClick={handleGenerate}
                disabled={loading}
                className="px-4 py-2 text-sm rounded-lg bg-purple-600 text-white hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && (
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
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

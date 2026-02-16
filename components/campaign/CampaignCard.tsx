'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateCampaign, deleteCampaign } from '@/actions/campaigns'

interface CampaignCardProps {
  campaign: {
    id: string
    name: string
    description: string | null
    _count: {
      audioFiles: number
      wikiEntries: number
    }
  }
  userId: string
}

export default function CampaignCard({ campaign, userId }: CampaignCardProps) {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(campaign.name)
  const [saving, setSaving] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus()
      inputRef.current?.select()
    }
  }, [editing])

  const handleRename = async () => {
    if (!name.trim() || name === campaign.name) {
      setName(campaign.name)
      setEditing(false)
      return
    }
    setSaving(true)
    try {
      await updateCampaign(campaign.id, userId, { name: name.trim() })
      setEditing(false)
      router.refresh()
    } catch {
      setName(campaign.name)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setMenuOpen(false)
    if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) return
    try {
      await deleteCampaign(campaign.id, userId)
    } catch {
      // deleteCampaign redirects on success
    }
  }

  return (
    <div className="relative bg-gray-800/50 rounded-lg border border-gray-700 p-6 hover:bg-gray-800 transition-colors">
      {/* Three-dot menu */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
          className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
          title="Campaign options"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <circle cx="8" cy="3" r="1.5" />
            <circle cx="8" cy="8" r="1.5" />
            <circle cx="8" cy="13" r="1.5" />
          </svg>
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMenuOpen(false)
                setEditing(true)
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
            >
              Rename
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDelete()
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      <Link href={`/campaigns/${campaign.id}`} className="block">
        {editing ? (
          <div onClick={(e) => e.preventDefault()}>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename()
                if (e.key === 'Escape') {
                  setName(campaign.name)
                  setEditing(false)
                }
              }}
              onBlur={handleRename}
              disabled={saving}
              className="text-xl font-bold text-white mb-2 bg-gray-700 border border-gray-600 rounded px-2 py-1 w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        ) : (
          <h2 className="text-xl font-bold text-white mb-2 pr-8">
            {campaign.name}
          </h2>
        )}
        {campaign.description && (
          <p className="text-gray-400 text-sm mb-4 line-clamp-2">
            {campaign.description}
          </p>
        )}
        <div className="flex gap-4 text-sm text-gray-500">
          <span>{campaign._count.audioFiles} audio files</span>
          <span>{campaign._count.wikiEntries} wiki entries</span>
        </div>
      </Link>
    </div>
  )
}

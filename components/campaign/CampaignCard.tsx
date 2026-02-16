'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { updateCampaign, deleteCampaign } from '@/actions/campaigns'
import { MoreVertical, Music, BookOpen } from 'lucide-react'

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
    <div className="relative glass-card rounded-xl p-5 sm:p-6 hover-glow transition-all group">
      {/* Three-dot menu */}
      <div className="absolute top-3 right-3" ref={menuRef}>
        <button
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            setMenuOpen(!menuOpen)
          }}
          className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-white/5 transition-colors"
          title="Campaign options"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-1 w-40 glass-card-elevated bg-surface-elevated rounded-lg shadow-xl z-10 py-1 border border-border-theme">
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                setMenuOpen(false)
                setEditing(true)
              }}
              className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors"
            >
              Rename
            </button>
            <button
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                handleDelete()
              }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-white/5 hover:text-red-300 transition-colors"
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
              className="text-lg sm:text-xl font-bold text-text-primary mb-2 input-dark rounded-lg px-2 py-1 w-full"
            />
          </div>
        ) : (
          <h2 className="text-lg sm:text-xl font-bold text-text-primary mb-2 pr-8 group-hover:text-accent-purple-light transition-colors">
            {campaign.name}
          </h2>
        )}
        {campaign.description && (
          <p className="text-text-muted text-sm mb-4 line-clamp-2">
            {campaign.description}
          </p>
        )}
        <div className="flex gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Music className="w-3 h-3" />
            {campaign._count.audioFiles} audio
          </span>
          <span className="flex items-center gap-1">
            <BookOpen className="w-3 h-3" />
            {campaign._count.wikiEntries} wiki
          </span>
        </div>
      </Link>
    </div>
  )
}

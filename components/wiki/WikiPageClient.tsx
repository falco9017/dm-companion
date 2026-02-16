'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WikiEntryType } from '@prisma/client'
import AudioUploader from '@/components/audio/AudioUploader'
import WikiEntryForm from './WikiEntryForm'

const typeIcons: Record<WikiEntryType, string> = {
  SESSION_RECAP: '📜',
  CHARACTER: '👤',
  LOCATION: '🗺️',
  EVENT: '⚔️',
  ITEM: '💎',
  NPC: '🎭',
  FACTION: '🏰',
  LORE: '📚',
  QUEST: '🎯',
  OTHER: '📝',
}

const typeLabels: Record<WikiEntryType, string> = {
  SESSION_RECAP: 'Session Recaps',
  CHARACTER: 'Characters',
  LOCATION: 'Locations',
  EVENT: 'Events',
  ITEM: 'Items',
  NPC: 'NPCs',
  FACTION: 'Factions',
  LORE: 'Lore',
  QUEST: 'Quests',
  OTHER: 'Other',
}

type Panel = 'none' | 'upload' | 'create'

interface WikiPageClientProps {
  campaignId: string
  userId: string
  entries: {
    id: string
    title: string
    slug: string
    type: WikiEntryType
    excerpt: string | null
    tags: string[]
    audioFile: { id: string; filename: string } | null
  }[]
  entriesByType: { type: WikiEntryType; _count: number }[]
  activeType?: WikiEntryType
}

export default function WikiPageClient({
  campaignId,
  userId,
  entries,
  entriesByType,
  activeType,
}: WikiPageClientProps) {
  const [panel, setPanel] = useState<Panel>('none')

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href={`/campaigns/${campaignId}`}
            className="text-gray-400 hover:text-gray-300 text-sm mb-2 inline-block"
          >
            &larr; Back to Campaign
          </Link>
          <h1 className="text-3xl font-bold text-white">Campaign Wiki</h1>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setPanel(panel === 'upload' ? 'none' : 'upload')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              panel === 'upload'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Upload Audio
          </button>
          <button
            onClick={() => setPanel(panel === 'create' ? 'none' : 'create')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              panel === 'create'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            Create Entry
          </button>
        </div>
      </div>

      {/* Collapsible panels */}
      {panel === 'upload' && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-3">Upload Session Recording</h2>
          <p className="text-gray-400 text-sm mb-4">
            Upload audio to auto-transcribe and generate wiki entries
          </p>
          <AudioUploader campaignId={campaignId} />
        </div>
      )}

      {panel === 'create' && (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Create Wiki Entry</h2>
          <WikiEntryForm
            campaignId={campaignId}
            userId={userId}
            onDone={() => setPanel('none')}
          />
        </div>
      )}

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/campaigns/${campaignId}/wiki`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !activeType
              ? 'bg-blue-600 text-white'
              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
          }`}
        >
          All ({entries.length})
        </Link>
        {entriesByType.map((group) => (
          <Link
            key={group.type}
            href={`/campaigns/${campaignId}/wiki?type=${group.type}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeType === group.type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            {typeIcons[group.type]} {typeLabels[group.type]} ({group._count})
          </Link>
        ))}
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-12 text-center">
          <p className="text-gray-300 text-lg">No wiki entries yet</p>
          <p className="text-gray-500 text-sm mt-2">
            Upload audio to generate entries automatically, or create one manually
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/campaigns/${campaignId}/wiki/${entry.id}`}
              className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 hover:bg-gray-800 transition-colors"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">{typeIcons[entry.type]}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-gray-500">{typeLabels[entry.type]}</p>
                </div>
              </div>
              {entry.excerpt && (
                <p className="text-sm text-gray-400 line-clamp-2 mb-2">
                  {entry.excerpt}
                </p>
              )}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { WikiEntryType } from '@prisma/client'

const typeIcons: Record<WikiEntryType, string> = {
  SESSION_RECAP: '\u{1F4DC}',
  CHARACTER: '\u{1F464}',
  LOCATION: '\u{1F5FA}\uFE0F',
  EVENT: '\u{2694}\uFE0F',
  ITEM: '\u{1F48E}',
  NPC: '\u{1F3AD}',
  FACTION: '\u{1F3F0}',
  LORE: '\u{1F4DA}',
  QUEST: '\u{1F3AF}',
  OTHER: '\u{1F4DD}',
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

const typeOrder: WikiEntryType[] = [
  'SESSION_RECAP',
  'CHARACTER',
  'NPC',
  'LOCATION',
  'FACTION',
  'QUEST',
  'EVENT',
  'ITEM',
  'LORE',
  'OTHER',
]

interface WikiSidebarEntry {
  id: string
  title: string
  slug: string
  type: WikiEntryType
  parentId: string | null
  createdAt: Date
}

interface WikiSidebarProps {
  campaignId: string
  campaignName: string
  entries: WikiSidebarEntry[]
  activeEntryId?: string
  onSettingsClick: () => void
  onUploadClick: () => void
  onCreateClick: () => void
}

export default function WikiSidebar({
  campaignId,
  campaignName,
  entries,
  activeEntryId,
  onSettingsClick,
  onUploadClick,
  onCreateClick,
}: WikiSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Group entries by type
  const grouped = new Map<WikiEntryType, WikiSidebarEntry[]>()
  for (const entry of entries) {
    const list = grouped.get(entry.type) || []
    list.push(entry)
    grouped.set(entry.type, list)
  }

  const toggleGroup = (type: string) => {
    setCollapsed((prev) => ({ ...prev, [type]: !prev[type] }))
  }

  return (
    <aside className="w-64 flex-shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-gray-800">
        <Link
          href="/campaigns"
          className="text-xs text-gray-500 hover:text-gray-400 mb-1 block"
        >
          &larr; All Campaigns
        </Link>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white truncate flex-1">
            {campaignName}
          </h2>
          <button
            onClick={onSettingsClick}
            className="text-gray-400 hover:text-white ml-2 text-lg"
            title="Campaign Settings"
          >
            &#9881;&#65039;
          </button>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-3 border-b border-gray-800 flex gap-2">
        <button
          onClick={onUploadClick}
          className="flex-1 text-xs px-2 py-1.5 rounded bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors"
        >
          Upload Audio
        </button>
        <button
          onClick={onCreateClick}
          className="flex-1 text-xs px-2 py-1.5 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors"
        >
          New Page
        </button>
      </div>

      {/* Entries tree */}
      <nav className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-4">
            No entries yet
          </p>
        ) : (
          typeOrder
            .filter((type) => grouped.has(type))
            .map((type) => {
              const items = grouped.get(type)!
              const isCollapsed = collapsed[type]

              return (
                <div key={type} className="mb-1">
                  <button
                    onClick={() => toggleGroup(type)}
                    className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wider"
                  >
                    <span className="text-[10px]">{isCollapsed ? '\u25B6' : '\u25BC'}</span>
                    <span>{typeIcons[type]}</span>
                    <span>{typeLabels[type]}</span>
                    <span className="text-gray-600 ml-auto">{items.length}</span>
                  </button>

                  {!isCollapsed && (
                    <div className="ml-2">
                      {items.map((entry) => (
                        <Link
                          key={entry.id}
                          href={`/campaigns/${campaignId}?entry=${entry.id}`}
                          className={`block px-2 py-1 text-sm rounded truncate transition-colors ${
                            entry.id === activeEntryId
                              ? 'bg-blue-600/20 text-blue-300'
                              : 'text-gray-400 hover:text-white hover:bg-gray-800'
                          }`}
                        >
                          {entry.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            })
        )}
      </nav>
    </aside>
  )
}

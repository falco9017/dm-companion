'use client'

import { useState, useRef, useEffect } from 'react'
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

const wikiTypeOrder: WikiEntryType[] = [
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
  onUpdateWikiClick: () => void
}

export default function WikiSidebar({
  campaignId,
  campaignName,
  entries,
  activeEntryId,
  onSettingsClick,
  onUploadClick,
  onCreateClick,
  onUpdateWikiClick,
}: WikiSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

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

  // Split entries into recaps and wiki
  const recaps = entries
    .filter((e) => e.type === 'SESSION_RECAP')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const wikiEntries = entries.filter((e) => e.type !== 'SESSION_RECAP')

  // Group wiki entries by type
  const grouped = new Map<WikiEntryType, WikiSidebarEntry[]>()
  for (const entry of wikiEntries) {
    const list = grouped.get(entry.type) || []
    list.push(entry)
    grouped.set(entry.type, list)
  }

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
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
          <div className="relative ml-2" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-800 transition-colors"
              title="Campaign options"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor">
                <circle cx="8" cy="3" r="1.5" />
                <circle cx="8" cy="8" r="1.5" />
                <circle cx="8" cy="13" r="1.5" />
              </svg>
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-40 bg-gray-800 border border-gray-700 rounded-lg shadow-xl z-10 py-1">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onSettingsClick()
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                >
                  Settings
                </button>
              </div>
            )}
          </div>
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
        <button
          onClick={onUpdateWikiClick}
          className="flex-1 text-xs px-2 py-1.5 rounded bg-purple-600 text-white hover:bg-purple-700 transition-colors"
        >
          Update Wiki
        </button>
      </div>

      {/* Entries */}
      <nav className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="text-gray-500 text-xs text-center py-4">
            No entries yet
          </p>
        ) : (
          <>
            {/* Session Recaps section */}
            {recaps.length > 0 && (
              <div className="mb-2">
                <button
                  onClick={() => toggleGroup('_recaps')}
                  className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wider"
                >
                  <span className="text-[10px]">{collapsed['_recaps'] ? '\u25B6' : '\u25BC'}</span>
                  <span>{typeIcons.SESSION_RECAP}</span>
                  <span>Session Recaps</span>
                  <span className="text-gray-600 ml-auto">{recaps.length}</span>
                </button>

                {!collapsed['_recaps'] && (
                  <div className="ml-2">
                    {recaps.map((entry) => (
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
            )}

            {/* Campaign Wiki section */}
            {wikiEntries.length > 0 && (
              <div className="mb-1">
                <button
                  onClick={() => toggleGroup('_wiki')}
                  className="w-full flex items-center gap-1 px-2 py-1 text-xs font-semibold text-gray-400 hover:text-gray-300 uppercase tracking-wider"
                >
                  <span className="text-[10px]">{collapsed['_wiki'] ? '\u25B6' : '\u25BC'}</span>
                  <span>{typeIcons.LORE}</span>
                  <span>Campaign Wiki</span>
                  <span className="text-gray-600 ml-auto">{wikiEntries.length}</span>
                </button>

                {!collapsed['_wiki'] && (
                  <div className="ml-2">
                    {wikiTypeOrder
                      .filter((type) => grouped.has(type))
                      .map((type) => {
                        const items = grouped.get(type)!
                        const isCollapsed = collapsed[type]

                        return (
                          <div key={type} className="mb-1">
                            <button
                              onClick={() => toggleGroup(type)}
                              className="w-full flex items-center gap-1 px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-400"
                            >
                              <span className="text-[10px]">{isCollapsed ? '\u25B6' : '\u25BC'}</span>
                              <span>{typeIcons[type]}</span>
                              <span>{typeLabels[type]}</span>
                              <span className="text-gray-600 ml-auto">{items.length}</span>
                            </button>

                            {!isCollapsed && (
                              <div className="ml-4">
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
                      })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </nav>
    </aside>
  )
}

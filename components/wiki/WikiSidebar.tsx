'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { WikiEntryType } from '@prisma/client'
import {
  ScrollText, User, MapPin, Swords, Gem, Drama, Castle,
  BookOpen, Target, FileText, ChevronRight, ChevronDown,
  Upload, Plus, RefreshCw, ArrowLeft, X, MoreVertical, Settings,
} from 'lucide-react'

const typeIcons: Record<WikiEntryType, React.ReactNode> = {
  SESSION_RECAP: <ScrollText className="w-3.5 h-3.5" />,
  CHARACTER: <User className="w-3.5 h-3.5" />,
  LOCATION: <MapPin className="w-3.5 h-3.5" />,
  EVENT: <Swords className="w-3.5 h-3.5" />,
  ITEM: <Gem className="w-3.5 h-3.5" />,
  NPC: <Drama className="w-3.5 h-3.5" />,
  FACTION: <Castle className="w-3.5 h-3.5" />,
  LORE: <BookOpen className="w-3.5 h-3.5" />,
  QUEST: <Target className="w-3.5 h-3.5" />,
  OTHER: <FileText className="w-3.5 h-3.5" />,
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
  'CHARACTER', 'NPC', 'LOCATION', 'FACTION', 'QUEST',
  'EVENT', 'ITEM', 'LORE', 'OTHER',
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
  isOpen: boolean
  onClose: () => void
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
  isOpen,
  onClose,
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

  const recaps = entries
    .filter((e) => e.type === 'SESSION_RECAP')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  const wikiEntries = entries.filter((e) => e.type !== 'SESSION_RECAP')

  const grouped = new Map<WikiEntryType, WikiSidebarEntry[]>()
  for (const entry of wikiEntries) {
    const list = grouped.get(entry.type) || []
    list.push(entry)
    grouped.set(entry.type, list)
  }

  const toggleGroup = (key: string) => {
    setCollapsed((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  const sidebarContent = (
    <>
      {/* Header */}
      <div className="p-4 border-b border-border-theme">
        <div className="flex items-center justify-between mb-1">
          <Link
            href="/campaigns"
            className="text-xs text-text-muted hover:text-text-secondary flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            All Campaigns
          </Link>
          {/* Mobile close button */}
          <button
            onClick={onClose}
            className="md:hidden text-text-muted hover:text-text-primary p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-text-primary truncate flex-1">
            {campaignName}
          </h2>
          <div className="relative ml-2" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-white/5 transition-colors"
              title="Campaign options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-40 glass-card-elevated bg-surface-elevated rounded-lg shadow-xl z-10 py-1 border border-border-theme">
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    onSettingsClick()
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-text-secondary hover:bg-white/5 hover:text-text-primary transition-colors flex items-center gap-2"
                >
                  <Settings className="w-3.5 h-3.5" />
                  Settings
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="p-3 border-b border-border-theme flex gap-2">
        <button
          onClick={onUploadClick}
          className="flex-1 text-xs px-2 py-2 rounded-lg glass-card text-text-secondary hover:text-text-primary hover-glow transition-all flex items-center justify-center gap-1"
        >
          <Upload className="w-3 h-3" />
          Upload
        </button>
        <button
          onClick={onCreateClick}
          className="flex-1 text-xs px-2 py-2 rounded-lg btn-primary flex items-center justify-center gap-1"
        >
          <Plus className="w-3 h-3" />
          New Page
        </button>
        <button
          onClick={onUpdateWikiClick}
          className="flex-1 text-xs px-2 py-2 rounded-lg bg-accent-purple/20 text-accent-purple-light hover:bg-accent-purple/30 transition-colors flex items-center justify-center gap-1"
        >
          <RefreshCw className="w-3 h-3" />
          Update
        </button>
      </div>

      {/* Entries */}
      <nav className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="text-text-muted text-xs text-center py-4">
            No entries yet
          </p>
        ) : (
          <>
            {/* Session Recaps */}
            {recaps.length > 0 && (
              <div className="mb-2">
                <button
                  onClick={() => toggleGroup('_recaps')}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary uppercase tracking-wider transition-colors"
                >
                  {collapsed['_recaps'] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {typeIcons.SESSION_RECAP}
                  <span>Session Recaps</span>
                  <span className="text-text-muted ml-auto text-[10px]">{recaps.length}</span>
                </button>

                {!collapsed['_recaps'] && (
                  <div className="ml-2">
                    {recaps.map((entry) => (
                      <Link
                        key={entry.id}
                        href={`/campaigns/${campaignId}?entry=${entry.id}`}
                        onClick={onClose}
                        className={`block px-3 py-1.5 text-sm rounded-lg truncate transition-all ${
                          entry.id === activeEntryId
                            ? 'sidebar-active text-accent-purple-light font-medium'
                            : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                        }`}
                      >
                        {entry.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Campaign Wiki */}
            {wikiEntries.length > 0 && (
              <div className="mb-1">
                <button
                  onClick={() => toggleGroup('_wiki')}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary uppercase tracking-wider transition-colors"
                >
                  {collapsed['_wiki'] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>Campaign Wiki</span>
                  <span className="text-text-muted ml-auto text-[10px]">{wikiEntries.length}</span>
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
                              className="w-full flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-text-muted hover:text-text-secondary transition-colors"
                            >
                              {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                              {typeIcons[type]}
                              <span>{typeLabels[type]}</span>
                              <span className="text-text-muted ml-auto text-[10px]">{items.length}</span>
                            </button>

                            {!isCollapsed && (
                              <div className="ml-5">
                                {items.map((entry) => (
                                  <Link
                                    key={entry.id}
                                    href={`/campaigns/${campaignId}?entry=${entry.id}`}
                                    onClick={onClose}
                                    className={`block px-3 py-1.5 text-sm rounded-lg truncate transition-all ${
                                      entry.id === activeEntryId
                                        ? 'sidebar-active text-accent-purple-light font-medium'
                                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
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
    </>
  )

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-72 md:w-64 flex-shrink-0
          bg-surface border-r border-border-theme
          flex flex-col h-full overflow-hidden
          transform transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        {sidebarContent}
      </aside>
    </>
  )
}

'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { WikiEntryType } from '@prisma/client'
import {
  ScrollText, User, MapPin, Swords, Gem, Drama, Castle,
  BookOpen, Target, FileText, ChevronRight, ChevronDown,
  Plus, ArrowLeft, X, Settings, RefreshCw,
} from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'

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
  dateFormat: string
  onSettingsClick: () => void
  onUploadClick: () => void
  onCreateClick: () => void
  onUpdateWikiClick: () => void
  onCreateSessionClick: () => void
  onNavigate: (href: string) => void
  isOpen: boolean
  onClose: () => void
  desktopWidth?: number
  onWidthChange?: (w: number) => void
  desktopHidden?: boolean
}

function formatDate(date: Date, format: string): string {
  const d = new Date(date)
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const yearFull = String(d.getFullYear())
  const yearShort = yearFull.slice(-2)

  switch (format) {
    case 'MM/DD/YY':
      return `${month}/${day}/${yearShort}`
    case 'YYYY-MM-DD':
      return `${yearFull}-${month}-${day}`
    case 'DD.MM.YY':
    default:
      return `${day}.${month}.${yearShort}`
  }
}

function DropdownMenu({ items, onClose }: { items: { label: string; onClick: () => void }[]; onClose: () => void }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  return (
    <div ref={ref} className="absolute right-0 top-full mt-1 z-50 bg-surface-elevated border border-border-theme rounded-lg shadow-lg py-1 min-w-[160px]">
      {items.map((item) => (
        <button
          key={item.label}
          onClick={() => { item.onClick(); onClose() }}
          className="w-full text-left px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors"
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export default function WikiSidebar({
  campaignId,
  campaignName,
  entries,
  activeEntryId,
  dateFormat,
  onSettingsClick,
  onUploadClick,
  onCreateClick,
  onUpdateWikiClick,
  onCreateSessionClick,
  onNavigate,
  isOpen,
  onClose,
  desktopWidth,
  onWidthChange,
  desktopHidden,
}: WikiSidebarProps) {
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})
  const [sessionsDropdown, setSessionsDropdown] = useState(false)
  const { t } = useI18n()
  const widthRef = useRef(desktopWidth ?? 256)

  useEffect(() => {
    widthRef.current = desktopWidth ?? 256
  }, [desktopWidth])

  const handleDragStart = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    const startX = e.clientX
    const startWidth = widthRef.current

    const onMove = (ev: MouseEvent) => {
      const delta = ev.clientX - startX
      const newWidth = Math.min(480, Math.max(180, startWidth + delta))
      onWidthChange?.(newWidth)
    }

    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }, [onWidthChange])

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
          <button
            onClick={() => onNavigate('/campaigns')}
            className="text-xs text-text-muted hover:text-text-secondary flex items-center gap-1 transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            {t('sidebar.allCampaigns')}
          </button>
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
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={onSettingsClick}
              className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-white/5 transition-colors"
              title={t('sidebar.campaignSettings')}
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Entries */}
      <nav className="flex-1 overflow-y-auto p-2">
        {entries.length === 0 ? (
          <p className="text-text-muted text-xs text-center py-4">
            {t('sidebar.noEntries')}
          </p>
        ) : (
          <>
            {/* Sessions section */}
            <div className="mb-2">
              <div className="flex items-center justify-between px-2 py-1.5">
                <button
                  onClick={() => toggleGroup('_sessions')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary uppercase tracking-wider transition-colors"
                >
                  {collapsed['_sessions'] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  {typeIcons.SESSION_RECAP}
                  <span>{t('sidebar.sessions')}</span>
                  <span className="text-text-muted text-[10px]">{recaps.length}</span>
                </button>
                <div className="relative">
                  <button
                    onClick={() => setSessionsDropdown(!sessionsDropdown)}
                    className="text-text-muted hover:text-text-primary p-0.5 rounded hover:bg-white/5 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  {sessionsDropdown && (
                    <DropdownMenu
                      items={[
                        { label: t('sidebar.newSession'), onClick: onCreateSessionClick },
                        { label: t('sidebar.uploadAudio'), onClick: onUploadClick },
                      ]}
                      onClose={() => setSessionsDropdown(false)}
                    />
                  )}
                </div>
              </div>

              {!collapsed['_sessions'] && recaps.length > 0 && (
                <div className="ml-2">
                  {recaps.map((entry) => (
                    <button
                      key={entry.id}
                      onClick={() => { onNavigate(`/campaigns/${campaignId}?entry=${entry.id}`) }}
                      className={`w-full text-left block px-3 py-1.5 text-sm rounded-lg truncate transition-all ${
                        entry.id === activeEntryId
                          ? 'sidebar-active text-accent-purple-light font-medium'
                          : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                      }`}
                    >
                      {formatDate(entry.createdAt, dateFormat)} - {entry.title}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Wiki section */}
            <div className="mb-1">
              <div className="flex items-center justify-between px-2 py-1.5">
                <button
                  onClick={() => toggleGroup('_wiki')}
                  className="flex items-center gap-1.5 text-xs font-semibold text-text-secondary hover:text-text-primary uppercase tracking-wider transition-colors"
                >
                  {collapsed['_wiki'] ? <ChevronRight className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{t('sidebar.wiki')}</span>
                  <span className="text-text-muted text-[10px]">{wikiEntries.length}</span>
                </button>
                <div className="flex items-center gap-0.5">
                  <button
                    onClick={onCreateClick}
                    className="text-text-muted hover:text-text-primary p-0.5 rounded hover:bg-white/5 transition-colors"
                    title={t('sidebar.newWikiPage')}
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={onUpdateWikiClick}
                    className="text-text-muted hover:text-text-primary p-0.5 rounded hover:bg-white/5 transition-colors"
                    title={t('sidebar.updateWikiAI')}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {!collapsed['_wiki'] && wikiEntries.length > 0 && (
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
                            <span>{t(`wiki.type.${type}`)}</span>
                            <span className="text-text-muted ml-auto text-[10px]">{items.length}</span>
                          </button>

                          {!isCollapsed && (
                            <div className="ml-5">
                              {items.map((entry) => (
                                <button
                                  key={entry.id}
                                  onClick={() => { onNavigate(`/campaigns/${campaignId}?entry=${entry.id}`) }}
                                  className={`w-full text-left block px-3 py-1.5 text-sm rounded-lg truncate transition-all ${
                                    entry.id === activeEntryId
                                      ? 'sidebar-active text-accent-purple-light font-medium'
                                      : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                                  }`}
                                >
                                  {entry.title}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                </div>
              )}
            </div>
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
        style={desktopWidth ? { width: `${desktopWidth}px` } : undefined}
        className={`
          fixed md:relative inset-y-0 left-0 z-40
          w-72 md:w-auto flex-shrink-0
          bg-surface border-r border-border-theme
          flex flex-col h-full overflow-hidden
          transform transition-transform duration-200 ease-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          ${desktopHidden ? 'md:hidden' : ''}
        `}
      >
        {sidebarContent}
        {/* Resize handle — desktop only */}
        <div
          className="absolute right-0 top-0 bottom-0 w-2 cursor-col-resize hidden md:block z-10 group/resize"
          onMouseDown={handleDragStart}
        >
          <div className="absolute inset-y-0 right-0 w-px bg-transparent group-hover/resize:bg-accent-purple/50 transition-colors duration-150" />
        </div>
      </aside>
    </>
  )
}

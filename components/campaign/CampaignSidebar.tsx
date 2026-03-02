'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  LayoutDashboard, Swords, Mic, BookOpen, Users,
  Settings, LogOut, ChevronDown, Sun, Moon, X, Check,
} from 'lucide-react'
import { signOut } from 'next-auth/react'
import { useTheme } from '@/components/ThemeProvider'
import { useI18n } from '@/lib/i18n-context'

export type ViewState = 'dashboard' | 'live' | 'sessions' | 'wiki' | 'party'

interface CampaignSidebarProps {
  currentView: ViewState
  onNavigate: (view: ViewState) => void
  isOpen: boolean
  onClose: () => void
  campaign: { name: string }
  campaigns: { id: string; name: string }[]
  campaignId: string
  userRole: 'DM' | 'PLAYER'
}

export default function CampaignSidebar({
  currentView,
  onNavigate,
  isOpen,
  onClose,
  campaign,
  campaigns,
  campaignId,
  userRole,
}: CampaignSidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const { t } = useI18n()
  const router = useRouter()
  const [campaignDropdownOpen, setCampaignDropdownOpen] = useState(false)

  const navItems: Array<{ id: ViewState; label: string; icon: typeof LayoutDashboard; isLive?: boolean; dmOnly?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Session', icon: Swords, isLive: true, dmOnly: true },
    { id: 'sessions', label: t('tabs.sessions'), icon: Mic },
    { id: 'wiki', label: t('tabs.campaignData'), icon: BookOpen, dmOnly: true },
    { id: 'party', label: t('tabs.party'), icon: Users },
  ]

  const visibleNavItems = navItems.filter((item) => !item.dmOnly || userRole === 'DM')

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`fixed md:static inset-y-0 left-0 w-64 bg-card border-r border-border flex flex-col z-50 transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Logo & Campaign Selector */}
        <div className="p-6 border-b border-border relative">
          <button
            onClick={onClose}
            className="absolute top-6 right-4 md:hidden text-muted-foreground hover:text-foreground"
          >
            <X className="w-5 h-5" />
          </button>
          <Link href="/campaigns">
            <h1 className="font-serif text-2xl font-semibold text-primary tracking-wide mb-6">
              MYSTIC QUEST
            </h1>
          </Link>

          {/* Campaign selector */}
          <div className="relative">
            <button
              onClick={() => setCampaignDropdownOpen(!campaignDropdownOpen)}
              className="w-full flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2 hover:border-primary transition-colors"
            >
              <div className="flex flex-col items-start min-w-0">
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                  Current Campaign
                </span>
                <span className="text-sm font-medium text-foreground truncate w-full text-left">
                  {campaign.name}
                </span>
              </div>
              <ChevronDown className={`w-4 h-4 text-muted-foreground flex-shrink-0 transition-transform ${campaignDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {campaignDropdownOpen && campaigns.length > 1 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-lg shadow-lg z-10 max-h-48 overflow-y-auto">
                {campaigns.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setCampaignDropdownOpen(false)
                      if (c.id !== campaignId) {
                        router.push(`/campaigns/${c.id}`)
                      }
                    }}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-accent transition-colors flex items-center gap-2 first:rounded-t-lg last:rounded-b-lg"
                  >
                    <span className="truncate flex-1">{c.name}</span>
                    {c.id === campaignId && <Check className="w-3.5 h-3.5 text-primary flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id

            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id)
                  onClose()
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive
                    ? item.isLive
                      ? 'bg-red-900/10 text-red-500 border border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50'
                      : 'bg-accent text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive && item.isLive ? 'text-red-500 dark:text-red-400' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {item.isLive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            )
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          {userRole === 'DM' && (
            <Link
              href={`/campaigns/${campaignId}/settings`}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            >
              <Settings className="w-5 h-5" />
              <span className="font-medium text-sm">{t('sidebar.campaignSettings')}</span>
            </Link>
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/signin' })}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">{t('nav.signOut')}</span>
          </button>
        </div>
      </div>
    </>
  )
}

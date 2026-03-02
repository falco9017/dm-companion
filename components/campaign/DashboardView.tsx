'use client'

import { Play, Upload, BookOpen, Clock, ChevronRight, Users } from 'lucide-react'
import type { WikiEntryType } from '@prisma/client'
import type { CharacterSheetData } from '@/types/character-sheet'
import type { ViewState } from './CampaignSidebar'

interface WikiTreeEntry {
  id: string
  title: string
  slug: string
  type: WikiEntryType
  parentId: string | null
  createdAt: Date
}

interface PartySheet {
  id: string
  wikiEntryId: string
  data: CharacterSheetData
  pdfBlobUrl: string | null
  wikiEntry: { id: string; title: string }
  assignedPlayer: { id: string; name: string | null; email: string } | null
  assignedPlayerId: string | null
}

interface DashboardViewProps {
  campaign: { name: string; description: string | null }
  wikiTree: WikiTreeEntry[]
  partySheets: PartySheet[]
  onNavigate: (view: ViewState) => void
}

export default function DashboardView({
  campaign,
  wikiTree,
  partySheets,
  onNavigate,
}: DashboardViewProps) {
  const recentSessions = wikiTree
    .filter((e) => e.type === 'SESSION_RECAP')
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3)

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-foreground">
          Welcome back, DM.
        </h1>
        <p className="text-muted-foreground">
          {campaign.description || `Your adventure in ${campaign.name} awaits. What would you like to do today?`}
        </p>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={() => onNavigate('live')}
          className="flex flex-col items-start p-6 bg-red-50/50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 rounded-2xl hover:bg-red-100/50 dark:hover:bg-red-950/40 transition-all group text-left"
        >
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400 mb-4 group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-lg text-foreground mb-1">Start Live Session</h3>
          <p className="text-sm text-muted-foreground">Open the combat tracker and party overview.</p>
        </button>

        <button
          onClick={() => onNavigate('sessions')}
          className="flex flex-col items-start p-6 bg-card border border-border rounded-2xl hover:border-primary hover:bg-accent transition-all group text-left"
        >
          <div className="p-3 bg-background rounded-xl text-primary mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-lg text-foreground mb-1">Upload Audio</h3>
          <p className="text-sm text-muted-foreground">Transcribe and auto-generate wiki updates.</p>
        </button>

        <button
          onClick={() => onNavigate('wiki')}
          className="flex flex-col items-start p-6 bg-card border border-border rounded-2xl hover:border-primary hover:bg-accent transition-all group text-left"
        >
          <div className="p-3 bg-background rounded-xl text-primary mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-serif font-medium text-lg text-foreground mb-1">Campaign Wiki</h3>
          <p className="text-sm text-muted-foreground">Browse characters, locations, and lore.</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-foreground">Recent Sessions</h2>
            <button
              onClick={() => onNavigate('sessions')}
              className="text-sm text-primary hover:underline"
            >
              View All
            </button>
          </div>

          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {recentSessions.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No sessions recorded yet. Upload audio to get started.</p>
              </div>
            ) : (
              recentSessions.map((session, i) => (
                <div
                  key={session.id}
                  className={`flex flex-col sm:flex-row sm:items-center gap-4 p-4 hover:bg-accent transition-colors cursor-pointer ${
                    i < recentSessions.length - 1 ? 'border-b border-border' : ''
                  }`}
                  onClick={() => onNavigate('sessions')}
                >
                  <div className="hidden sm:flex p-2 bg-background rounded-lg text-muted-foreground">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground">{session.title}</h4>
                    <p className="text-sm text-muted-foreground">
                      {new Date(session.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground hidden sm:block" />
                </div>
              ))
            )}
          </div>
        </div>

        {/* Party Snapshot */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-foreground">Party Snapshot</h2>
          <div className="bg-card border border-border rounded-2xl p-4 space-y-4">
            {partySheets.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No character sheets yet.</p>
              </div>
            ) : (
              partySheets.slice(0, 4).map((sheet) => {
                const data = sheet.data
                const charClass = data?.class
                const charLevel = data?.level
                return (
                  <div
                    key={sheet.id}
                    className="flex items-center justify-between p-3 bg-background rounded-xl border border-border"
                  >
                    <div>
                      <h4 className="font-medium text-foreground">{sheet.wikiEntry.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        {charClass ? `Lvl ${charLevel} ${charClass}` : 'Unknown class'}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400">
                        {data?.hitPoints?.current ?? '?'}/{data?.hitPoints?.maximum ?? '?'} HP
                      </span>
                    </div>
                  </div>
                )
              })
            )}
            <button
              onClick={() => onNavigate('party')}
              className="w-full py-2 text-sm text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors"
            >
              View Full Party
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

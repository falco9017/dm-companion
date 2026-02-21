'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { ArrowLeft, Users, User, Plus, FileUp } from 'lucide-react'
import type { CharacterSheetData } from '@/types/character-sheet'
import CharacterSheetBoard from '@/components/character-sheet/CharacterSheetBoard'
import PartyOverview from './PartyOverview'
import { createPlayerCharacter } from '@/actions/campaign-members'
import CharacterPdfUploadDialog from '@/components/wiki/CharacterPdfUploadDialog'

interface PartySheet {
  id: string
  data: CharacterSheetData
  assignedPlayerId: string | null
  assignedPlayer: { id: string; name: string | null; email: string } | null
  wikiEntry: { id: string; title: string }
}

interface PlayerCampaignViewProps {
  campaignId: string
  userId: string
  campaign: { name: string; description: string | null }
  allSheets: PartySheet[]
  mySheetId: string | null
}

export default function PlayerCampaignView({
  campaignId,
  userId,
  campaign,
  allSheets,
  mySheetId,
}: PlayerCampaignViewProps) {
  const [activeTab, setActiveTab] = useState<'character' | 'party'>(mySheetId ? 'character' : 'party')
  const [, setShowSheet] = useState(!!mySheetId)
  const [characterName, setCharacterName] = useState('')
  const [creating, startCreate] = useTransition()
  const [createError, setCreateError] = useState('')
  const [pdfOpen, setPdfOpen] = useState(false)
  const [currentMySheetId, setCurrentMySheetId] = useState(mySheetId)
  const [currentMyWikiEntryId, setCurrentMyWikiEntryId] = useState<string | null>(
    allSheets.find((s) => s.id === mySheetId)?.wikiEntry.id ?? null
  )

  const mySheet = allSheets.find((s) => s.id === currentMySheetId)

  const handleCreateCharacter = (e: React.FormEvent) => {
    e.preventDefault()
    if (!characterName.trim()) return
    setCreateError('')
    startCreate(async () => {
      try {
        const result = await createPlayerCharacter(campaignId, userId, characterName.trim())
        setCurrentMySheetId(result.sheet.id)
        setCurrentMyWikiEntryId(result.wikiEntry.id)
        setActiveTab('character')
        setShowSheet(true)
      } catch (err) {
        setCreateError(err instanceof Error ? err.message : 'Failed to create character')
      }
    })
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/campaigns"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-sm font-bold text-foreground">{campaign.name}</h1>
            <p className="text-[11px] text-muted-foreground">Player View</p>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex gap-1 bg-card rounded-lg p-0.5 border border-border">
          <button
            onClick={() => setActiveTab('character')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'character'
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            My Character
          </button>
          <button
            onClick={() => setActiveTab('party')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${
              activeTab === 'party'
                ? 'bg-primary/20 text-primary'
                : 'text-muted-foreground hover:text-muted-foreground'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Party ({allSheets.length})
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'party' && (
          <div className="max-w-2xl mx-auto p-4 sm:p-6">
            <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
              <Users className="w-4 h-4 text-primary" />
              The Party
            </h2>
            <PartyOverview sheets={allSheets} mySheetId={currentMySheetId} />
          </div>
        )}

        {activeTab === 'character' && (
          <>
            {currentMySheetId && mySheet ? (
              <CharacterSheetBoard
                key={currentMySheetId}
                characterSheetId={currentMySheetId}
                userId={userId}
                campaignId={campaignId}
                initialData={mySheet.data}
                pdfBlobUrl={null}
                onBack={() => setActiveTab('party')}
              />
            ) : (
              /* No character yet — create or import */
              <div className="max-w-md mx-auto p-6 sm:p-8 space-y-6">
                <div className="text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center">
                    <User className="w-8 h-8 text-primary" />
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-2">Create Your Character</h2>
                  <p className="text-muted-foreground text-sm">
                    The DM hasn&apos;t assigned a character to you yet. You can create one now and the DM
                    can review it, or wait until they assign an existing one.
                  </p>
                </div>

                {/* Create blank */}
                <form onSubmit={handleCreateCharacter} className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-muted-foreground mb-1">
                      Character Name *
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Aldric the Bold"
                      value={characterName}
                      onChange={(e) => setCharacterName(e.target.value)}
                      required
                      className="flex w-full rounded-md border border-input bg-transparent px-4 py-2.5 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    />
                  </div>
                  {createError && (
                    <p className="text-red-400 text-sm">{createError}</p>
                  )}
                  <button
                    type="submit"
                    disabled={creating}
                    className="w-full bg-primary text-primary-foreground px-4 py-2.5 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    {creating ? 'Creating…' : 'Create Blank Character Sheet'}
                  </button>
                </form>

                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-border-theme" />
                  <span className="text-muted-foreground text-xs">or</span>
                  <div className="flex-1 h-px bg-border-theme" />
                </div>

                <button
                  onClick={() => setPdfOpen(true)}
                  className="w-full px-4 py-2.5 rounded-lg bg-card border border-border text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <FileUp className="w-4 h-4" />
                  Import from PDF
                </button>
                <p className="text-muted-foreground text-xs text-center">
                  PDF import requires a character name first — create a blank sheet above, then use the import button on the sheet.
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* PDF import modal — only usable after character is created */}
      {currentMyWikiEntryId && (
        <CharacterPdfUploadDialog
          campaignId={campaignId}
          userId={userId}
          wikiEntryId={currentMyWikiEntryId}
          wikiEntryTitle={mySheet?.wikiEntry.title ?? ''}
          isOpen={pdfOpen}
          onClose={() => setPdfOpen(false)}
        />

      )}
    </div>
  )
}

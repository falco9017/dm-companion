'use client'

import { useCallback } from 'react'
import { useRouter } from 'next/navigation'
import CharacterSheetBoard from '@/components/character-sheet/CharacterSheetBoard'
import PartyMemberCard from './PartyMemberCard'
import CharacterClaimDialog from './CharacterClaimDialog'
import type { CharacterSheetData } from '@/types/character-sheet'
import { useI18n } from '@/lib/i18n-context'

interface PartySheet {
  id: string
  wikiEntryId: string
  data: CharacterSheetData
  pdfBlobUrl: string | null
  wikiEntry: { id: string; title: string }
  assignedPlayer: { id: string; name: string | null; email: string } | null
  assignedPlayerId: string | null
}

interface PlayerCharacterSheet {
  id: string
  data: CharacterSheetData
  pdfBlobUrl: string | null
  wikiEntryId: string
}

interface UnclaimedEntry {
  id: string
  title: string
  characterSheet: { id: string; assignedPlayerId: string | null } | null
}

interface PartyViewProps {
  campaignId: string
  userId: string
  playerCharacterSheet: PlayerCharacterSheet | null
  partySheets: PartySheet[]
  unclaimedCharacters: UnclaimedEntry[]
}

export default function PartyView({
  campaignId,
  userId,
  playerCharacterSheet,
  partySheets,
  unclaimedCharacters,
}: PartyViewProps) {
  const { t } = useI18n()
  const router = useRouter()

  const handleBack = useCallback(() => {
    // no-op — we don't navigate away from party tab
  }, [])

  if (!playerCharacterSheet) {
    return (
      <CharacterClaimDialog
        campaignId={campaignId}
        userId={userId}
        unclaimedCharacters={unclaimedCharacters}
      />
    )
  }

  const otherSheets = partySheets.filter((s) => s.assignedPlayerId !== userId)

  return (
    <div className="flex-1 flex overflow-hidden">
      {/* Main: player's own character sheet */}
      <div className="flex-1 overflow-auto min-w-0">
        <CharacterSheetBoard
          characterSheetId={playerCharacterSheet.id}
          userId={userId}
          campaignId={campaignId}
          initialData={playerCharacterSheet.data}
          pdfBlobUrl={playerCharacterSheet.pdfBlobUrl}
          onBack={handleBack}
          onUnsavedChange={() => {}}
        />
      </div>

      {/* Sidebar: other party members */}
      {otherSheets.length > 0 && (
        <div className="w-64 flex-shrink-0 border-l overflow-y-auto p-3 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">
            {t('party.title')}
          </h3>
          {otherSheets.map((sheet) => (
            <PartyMemberCard
              key={sheet.id}
              characterName={sheet.wikiEntry.title}
              playerName={sheet.assignedPlayer?.name || sheet.assignedPlayer?.email || null}
              data={sheet.data}
            />
          ))}
        </div>
      )}
    </div>
  )
}

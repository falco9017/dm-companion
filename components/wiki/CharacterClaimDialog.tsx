'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { UserPlus, FileText, Plus } from 'lucide-react'
import { createPlayerCharacter, claimCharacter } from '@/actions/campaign-members'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { useI18n } from '@/lib/i18n-context'

interface UnclaimedEntry {
  id: string
  title: string
  characterSheet: { id: string; assignedPlayerId: string | null } | null
}

interface CharacterClaimDialogProps {
  campaignId: string
  userId: string
  unclaimedCharacters: UnclaimedEntry[]
}

export default function CharacterClaimDialog({ campaignId, userId, unclaimedCharacters }: CharacterClaimDialogProps) {
  const { t } = useI18n()
  const router = useRouter()
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [claiming, setClaimingId] = useState<string | null>(null)
  const [pdfLoading, setPdfLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await createPlayerCharacter(campaignId, userId, newName.trim())
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to create character')
    } finally {
      setCreating(false)
    }
  }

  async function handleClaim(wikiEntryId: string) {
    setClaimingId(wikiEntryId)
    try {
      await claimCharacter(campaignId, userId, wikiEntryId)
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Failed to claim character')
    } finally {
      setClaimingId(null)
    }
  }

  async function handlePdfImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setPdfLoading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('campaignId', campaignId)
      const res = await fetch('/api/character-sheet/process', { method: 'POST', body: formData })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Import failed')
      }
      router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Import failed')
    } finally {
      setPdfLoading(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center">
          <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-primary/10 flex items-center justify-center">
            <UserPlus className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-lg font-bold">{t('party.noCharacter')}</h2>
          <p className="text-sm text-muted-foreground mt-1">Choose or create your character to get started.</p>
        </div>

        {/* Claim existing */}
        {unclaimedCharacters.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-semibold">{t('party.claimExisting')}</h3>
            <div className="space-y-1.5">
              {unclaimedCharacters.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 rounded-lg border bg-card gap-3">
                  <span className="text-sm font-medium">{entry.title}</span>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleClaim(entry.id)}
                    disabled={claiming === entry.id}
                  >
                    {claiming === entry.id ? 'Claiming...' : 'Claim'}
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Create new */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t('party.createNew')}</h3>
          <div className="flex gap-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Character name..."
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              <Plus className="w-4 h-4 mr-1.5" />
              {creating ? 'Creating...' : 'Create'}
            </Button>
          </div>
        </div>

        {/* Import from PDF */}
        <div className="space-y-2">
          <h3 className="text-sm font-semibold">{t('party.importPdf')}</h3>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handlePdfImport}
          />
          <Button
            variant="outline"
            className="w-full gap-2"
            onClick={() => fileInputRef.current?.click()}
            disabled={pdfLoading}
          >
            <FileText className="w-4 h-4" />
            {pdfLoading ? 'Importing...' : 'Import from PDF'}
          </Button>
        </div>
      </div>
    </div>
  )
}

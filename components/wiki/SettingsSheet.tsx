'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateCampaign, deleteCampaign } from '@/actions/campaigns'
import { AlertTriangle, Mic } from 'lucide-react'
import { useI18n } from '@/lib/i18n-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

interface SettingsSheetProps {
  campaignId: string
  userId: string
  campaign: {
    name: string
    description: string | null
    language: string
  }
  isOpen: boolean
  onClose: () => void
  onVoiceProfilesClick?: () => void
  voiceProfileCount?: number
}

export default function SettingsSheet({
  campaignId,
  userId,
  campaign,
  isOpen,
  onClose,
  onVoiceProfilesClick,
  voiceProfileCount = 0,
}: SettingsSheetProps) {
  const router = useRouter()
  const [name, setName] = useState(campaign.name)
  const [description, setDescription] = useState(campaign.description || '')
  const [language, setLanguage] = useState(campaign.language)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const { t } = useI18n()

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateCampaign(campaignId, userId, { name, description, language })
      router.refresh()
      toast.success(t('profile.saved'))
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      await deleteCampaign(campaignId, userId)
    } catch {
      setDeleting(false)
    }
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t('settings.title')}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSave} className="space-y-5 mt-6">
            <div className="space-y-2">
              <Label htmlFor="settings-name">{t('settings.name')}</Label>
              <Input
                id="settings-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-desc">{t('settings.description')}</Label>
              <Textarea
                id="settings-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="settings-lang">{t('settings.language')}</Label>
              <select
                id="settings-lang"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="en">English</option>
                <option value="it">Italian</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
              </select>
            </div>

            <Button type="submit" disabled={saving} className="w-full">
              {saving ? t('common.saving') : t('settings.saveChanges')}
            </Button>
          </form>

          {/* Voice Profiles section */}
          <div className="mt-6">
            <div className="flex items-center justify-between p-4 rounded-lg bg-muted border">
              <div className="flex items-center gap-3">
                <Mic className="w-5 h-5 text-primary" />
                <div>
                  <h3 className="text-sm font-semibold">{t('settings.voiceProfiles')}</h3>
                  <p className="text-xs text-muted-foreground">{t('voiceProfiles.settingsHint')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {voiceProfileCount > 0 && (
                  <Badge variant="secondary">{voiceProfileCount}</Badge>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => { onClose(); onVoiceProfilesClick?.() }}
                >
                  {t('voiceProfiles.manage')}
                </Button>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
              <h3 className="text-sm font-bold text-destructive mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                {t('settings.dangerZone')}
              </h3>
              <p className="text-muted-foreground text-xs mb-3">{t('settings.dangerText')}</p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => setConfirmDelete(true)}
                disabled={deleting}
              >
                {deleting ? t('common.deleting') : t('settings.deleteCampaign')}
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={confirmDelete}
        onOpenChange={setConfirmDelete}
        title={t('settings.deleteCampaign')}
        description="Are you sure you want to delete this campaign? This action cannot be undone."
        confirmLabel={t('settings.deleteCampaign')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
        onConfirm={handleDelete}
      />
    </>
  )
}

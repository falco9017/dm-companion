'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, AlertTriangle, Mic, Trash2, Play, Pause, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { upload } from '@vercel/blob/client'
import { updateCampaign, deleteCampaign } from '@/actions/campaigns'
import { getVoiceProfiles, createVoiceProfile, deleteVoiceProfile } from '@/actions/voice-profiles'
import VoiceRecorder from '@/components/voice/VoiceRecorder'
import { useI18n } from '@/lib/i18n-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

interface VoiceProfile {
  id: string
  name: string
  role: string
  blobUrl: string
}

function ProfilePlayButton({ blobUrl }: { blobUrl: string }) {
  const [playing, setPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  const toggle = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio(blobUrl)
      audioRef.current.onended = () => setPlaying(false)
    }
    if (playing) {
      audioRef.current.pause()
      setPlaying(false)
    } else {
      audioRef.current.currentTime = 0
      audioRef.current.play()
      setPlaying(true)
    }
  }, [blobUrl, playing])

  return (
    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={toggle} title="Play">
      {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
    </Button>
  )
}

interface CampaignSettingsProps {
  campaignId: string
  userId: string
  campaign: {
    name: string
    description: string | null
    language: string
  }
}

export default function CampaignSettings({ campaignId, userId, campaign }: CampaignSettingsProps) {
  const router = useRouter()
  const { t } = useI18n()

  // General settings
  const [name, setName] = useState(campaign.name)
  const [description, setDescription] = useState(campaign.description || '')
  const [language, setLanguage] = useState(campaign.language)
  const [saving, setSaving] = useState(false)

  // Delete
  const [deleting, setDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Voice profiles
  const [profiles, setProfiles] = useState<VoiceProfile[]>([])
  const [profilesLoading, setProfilesLoading] = useState(true)
  const [profileError, setProfileError] = useState('')
  const [profileName, setProfileName] = useState('')
  const [profileRole, setProfileRole] = useState('PLAYER')
  const [profileSaving, setProfileSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    getVoiceProfiles(campaignId, userId)
      .then((p) => setProfiles(p))
      .catch(() => setProfileError('Failed to load voice profiles'))
      .finally(() => setProfilesLoading(false))
  }, [campaignId, userId])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateCampaign(campaignId, userId, { name, description, language })
      router.refresh()
      toast.success(t('profile.saved'))
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

  const handleRecordingComplete = async (blob: Blob) => {
    if (!profileName.trim()) {
      setProfileError(t('voiceProfiles.nameRequired'))
      return
    }

    setProfileSaving(true)
    setProfileError('')

    try {
      const timestamp = Date.now()
      const ext = blob.type.includes('webm') ? 'webm' : 'ogg'
      const pathname = `voice-profiles/${campaignId}/${timestamp}-${profileName.trim()}.${ext}`

      const result = await upload(pathname, blob, {
        access: 'public',
        handleUploadUrl: '/api/voice-profile/upload',
      })

      const profile = await createVoiceProfile(
        campaignId,
        userId,
        profileName.trim(),
        profileRole,
        result.url,
        result.pathname
      )

      setProfiles((prev) => [...prev, profile])
      setProfileName('')
      setProfileRole('PLAYER')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save voice profile')
    } finally {
      setProfileSaving(false)
    }
  }

  const handleDeleteProfile = async (profileId: string) => {
    try {
      await deleteVoiceProfile(profileId, userId)
      setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
    setDeleteTarget(null)
  }

  return (
    <div className="h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div>
          <Link
            href={`/campaigns/${campaignId}`}
            className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1.5 mb-4 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t('settings.backToCampaign')}
          </Link>
          <h1 className="text-2xl font-bold">{t('settings.title')}</h1>
        </div>

        {/* General section */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">{t('settings.general')}</h2>
          <form onSubmit={handleSave} className="space-y-4">
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

            <Button type="submit" disabled={saving}>
              {saving ? t('common.saving') : t('settings.saveChanges')}
            </Button>
          </form>
        </section>

        {/* Voice Profiles section */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold">{t('voiceProfiles.title')}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{t('voiceProfiles.description')}</p>

          {/* Add new profile form */}
          <div className="rounded-lg border p-4 space-y-3">
            <h3 className="text-sm font-semibold">{t('voiceProfiles.addProfile')}</h3>
            <div className="flex gap-2">
              <Input
                placeholder={t('voiceProfiles.namePlaceholder')}
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="flex-1"
              />
              <select
                value={profileRole}
                onChange={(e) => setProfileRole(e.target.value)}
                className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="PLAYER">{t('voiceProfiles.rolePlayer')}</option>
                <option value="DM">{t('voiceProfiles.roleDM')}</option>
              </select>
            </div>
            <VoiceRecorder onRecordingComplete={handleRecordingComplete} disabled={profileSaving || !profileName.trim()} />
            {profileSaving && <p className="text-xs text-muted-foreground">{t('common.saving')}</p>}
          </div>

          {profileError && (
            <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
              {profileError}
            </p>
          )}

          {/* Profiles list */}
          <div>
            <h3 className="text-sm font-semibold mb-3">
              {t('voiceProfiles.enrolled')} ({profiles.length})
            </h3>

            {profilesLoading ? (
              <p className="text-muted-foreground text-sm">{t('voiceProfiles.loading')}</p>
            ) : profiles.length === 0 ? (
              <div className="text-center py-6">
                <Mic className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                <p className="text-muted-foreground text-sm">{t('voiceProfiles.emptyState')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-muted border"
                  >
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      {profile.role === 'DM' ? (
                        <Shield className="w-4 h-4 text-primary" />
                      ) : (
                        <User className="w-4 h-4 text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">{profile.name}</span>
                        <Badge variant="secondary" className="text-[10px]">{profile.role}</Badge>
                      </div>
                    </div>
                    <ProfilePlayButton blobUrl={profile.blobUrl} />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => setDeleteTarget(profile.id)}
                      title={t('voiceProfiles.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Danger Zone */}
        <section>
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4">
            <h3 className="text-sm font-bold text-destructive mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4" />
              {t('settings.dangerZone')}
            </h3>
            <p className="text-muted-foreground text-xs mb-3">{t('settings.dangerText')}</p>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setConfirmDelete(true)}
              disabled={deleting}
            >
              {deleting ? t('common.deleting') : t('settings.deleteCampaign')}
            </Button>
          </div>
        </section>
      </div>

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

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('voiceProfiles.delete')}
        description={t('voiceProfiles.confirmDelete')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
        onConfirm={() => deleteTarget && handleDeleteProfile(deleteTarget)}
      />
    </div>
  )
}

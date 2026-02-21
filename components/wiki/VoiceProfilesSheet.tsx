'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, Trash2, Play, Pause, Shield, User } from 'lucide-react'
import { upload } from '@vercel/blob/client'
import { getVoiceProfiles, createVoiceProfile, deleteVoiceProfile } from '@/actions/voice-profiles'
import VoiceRecorder from '@/components/voice/VoiceRecorder'
import { useI18n } from '@/lib/i18n-context'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

interface VoiceProfile {
  id: string
  name: string
  role: string
  blobUrl: string
}

interface VoiceProfilesSheetProps {
  campaignId: string
  userId: string
  isOpen: boolean
  onClose: () => void
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

export default function VoiceProfilesSheet({
  campaignId,
  userId,
  isOpen,
  onClose,
}: VoiceProfilesSheetProps) {
  const { t } = useI18n()
  const [profiles, setProfiles] = useState<VoiceProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('PLAYER')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    getVoiceProfiles(campaignId, userId)
      .then((p) => setProfiles(p))
      .catch(() => setError('Failed to load voice profiles'))
      .finally(() => setLoading(false))
  }, [isOpen, campaignId, userId])

  const handleRecordingComplete = async (blob: Blob) => {
    if (!name.trim()) {
      setError(t('voiceProfiles.nameRequired'))
      return
    }

    setSaving(true)
    setError('')

    try {
      const timestamp = Date.now()
      const ext = blob.type.includes('webm') ? 'webm' : 'ogg'
      const pathname = `voice-profiles/${campaignId}/${timestamp}-${name.trim()}.${ext}`

      const result = await upload(pathname, blob, {
        access: 'public',
        handleUploadUrl: '/api/voice-profile/upload',
      })

      const profile = await createVoiceProfile(
        campaignId,
        userId,
        name.trim(),
        role,
        result.url,
        result.pathname
      )

      setProfiles((prev) => [...prev, profile])
      setName('')
      setRole('PLAYER')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save voice profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (profileId: string) => {
    try {
      await deleteVoiceProfile(profileId, userId)
      setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete')
    }
    setDeleteTarget(null)
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Mic className="w-5 h-5 text-primary" />
              <SheetTitle>{t('voiceProfiles.title')}</SheetTitle>
            </div>
            <SheetDescription>{t('voiceProfiles.description')}</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Add new profile form */}
            <div>
              <h3 className="text-sm font-semibold mb-3">{t('voiceProfiles.addProfile')}</h3>
              <div className="flex gap-2 mb-3">
                <Input
                  placeholder={t('voiceProfiles.namePlaceholder')}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="flex-1"
                />
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="flex h-9 rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                >
                  <option value="PLAYER">{t('voiceProfiles.rolePlayer')}</option>
                  <option value="DM">{t('voiceProfiles.roleDM')}</option>
                </select>
              </div>
              <VoiceRecorder onRecordingComplete={handleRecordingComplete} disabled={saving || !name.trim()} />
              {saving && <p className="text-xs text-muted-foreground mt-2">{t('common.saving')}</p>}
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Profiles list */}
            <div>
              <h3 className="text-sm font-semibold mb-3">
                {t('voiceProfiles.enrolled')} ({profiles.length})
              </h3>

              {loading ? (
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
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title={t('voiceProfiles.delete')}
        description={t('voiceProfiles.confirmDelete')}
        confirmLabel={t('common.delete')}
        cancelLabel={t('common.cancel')}
        variant="destructive"
        onConfirm={() => deleteTarget && handleDelete(deleteTarget)}
      />
    </>
  )
}

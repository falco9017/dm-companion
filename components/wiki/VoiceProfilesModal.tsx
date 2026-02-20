'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Mic, X, Trash2, Play, Pause, Shield, User } from 'lucide-react'
import { upload } from '@vercel/blob/client'
import { getVoiceProfiles, createVoiceProfile, deleteVoiceProfile } from '@/actions/voice-profiles'
import VoiceRecorder from '@/components/voice/VoiceRecorder'
import { useI18n } from '@/lib/i18n-context'

interface VoiceProfile {
  id: string
  name: string
  role: string
  blobUrl: string
}

interface VoiceProfilesModalProps {
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
    <button
      onClick={toggle}
      className="p-1.5 rounded text-text-muted hover:text-text-primary transition-colors"
      title="Play"
    >
      {playing ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
    </button>
  )
}

export default function VoiceProfilesModal({
  campaignId,
  userId,
  isOpen,
  onClose,
}: VoiceProfilesModalProps) {
  const { t } = useI18n()
  const [profiles, setProfiles] = useState<VoiceProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('PLAYER')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    getVoiceProfiles(campaignId, userId)
      .then((p) => setProfiles(p))
      .catch(() => setError('Failed to load voice profiles'))
      .finally(() => setLoading(false))
  }, [isOpen, campaignId, userId])

  if (!isOpen) return null

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
      setError(err instanceof Error ? err.message : 'Failed to save voice profile')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (profileId: string) => {
    if (!confirm(t('voiceProfiles.confirmDelete'))) return

    try {
      await deleteVoiceProfile(profileId, userId)
      setProfiles((prev) => prev.filter((p) => p.id !== profileId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl w-full max-w-xl mx-3 max-h-[90vh] overflow-y-auto border border-border-theme">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-theme">
          <div className="flex items-center gap-2">
            <Mic className="w-5 h-5 text-accent-purple-light" />
            <h2 className="text-xl font-bold text-text-primary">{t('voiceProfiles.title')}</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Add new profile form */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              {t('voiceProfiles.addProfile')}
            </h3>

            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder={t('voiceProfiles.namePlaceholder')}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg input-dark text-sm"
              />
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="px-3 py-2 rounded-lg input-dark text-sm"
              >
                <option value="PLAYER">{t('voiceProfiles.rolePlayer')}</option>
                <option value="DM">{t('voiceProfiles.roleDM')}</option>
              </select>
            </div>

            <VoiceRecorder onRecordingComplete={handleRecordingComplete} disabled={saving || !name.trim()} />

            {saving && (
              <p className="text-xs text-text-muted mt-2">{t('common.saving')}</p>
            )}
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Profiles list */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">
              {t('voiceProfiles.enrolled')} ({profiles.length})
            </h3>

            {loading ? (
              <p className="text-text-muted text-sm">{t('voiceProfiles.loading')}</p>
            ) : profiles.length === 0 ? (
              <div className="text-center py-6">
                <Mic className="w-8 h-8 text-text-muted mx-auto mb-2 opacity-50" />
                <p className="text-text-muted text-sm">{t('voiceProfiles.emptyState')}</p>
              </div>
            ) : (
              <div className="space-y-2">
                {profiles.map((profile) => (
                  <div
                    key={profile.id}
                    className="flex items-center gap-3 p-3 rounded-lg bg-surface-elevated border border-border-theme"
                  >
                    <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
                      {profile.role === 'DM' ? (
                        <Shield className="w-4 h-4 text-accent-purple-light" />
                      ) : (
                        <User className="w-4 h-4 text-accent-purple-light" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {profile.name}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple-light">
                          {profile.role}
                        </span>
                      </div>
                    </div>

                    <ProfilePlayButton blobUrl={profile.blobUrl} />

                    <button
                      onClick={() => handleDelete(profile.id)}
                      className="p-1.5 rounded text-text-muted hover:text-red-400 transition-colors"
                      title={t('voiceProfiles.delete')}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Help text */}
          <p className="text-text-muted text-xs border-t border-border-theme pt-4">
            {t('voiceProfiles.description')}
          </p>
        </div>
      </div>
    </div>
  )
}

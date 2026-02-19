'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Users, X, UserPlus, Trash2, Shield, User } from 'lucide-react'
import {
  inviteMember,
  getCampaignMembers,
  removeMember,
  assignCharacterToPlayer,
} from '@/actions/campaign-members'

interface Member {
  id: string
  email: string
  status: 'PENDING' | 'ACCEPTED'
  role: 'DM' | 'PLAYER'
  user: { id: string; name: string | null; email: string; image: string | null } | null
}

interface CharacterSheet {
  id: string
  assignedPlayerId: string | null
  wikiEntry: { id: string; title: string }
}

interface PlayersModalProps {
  campaignId: string
  userId: string
  characterSheets: CharacterSheet[]
  isOpen: boolean
  onClose: () => void
}

export default function PlayersModal({
  campaignId,
  userId,
  characterSheets,
  isOpen,
  onClose,
}: PlayersModalProps) {
  const router = useRouter()
  const [members, setMembers] = useState<Member[]>([])
  const [inviteEmail, setInviteEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [inviting, setInviting] = useState(false)
  const [error, setError] = useState('')
  const [isPending, startTransition] = useTransition()

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    getCampaignMembers(campaignId, userId)
      .then((m) => setMembers(m as Member[]))
      .catch(() => setError('Failed to load members'))
      .finally(() => setLoading(false))
  }, [isOpen, campaignId, userId])

  if (!isOpen) return null

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviting(true)
    setError('')
    try {
      const m = await inviteMember(campaignId, userId, inviteEmail.trim())
      setMembers((prev) => [...prev, m as unknown as Member])
      setInviteEmail('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    if (!confirm('Remove this player from the campaign?')) return
    startTransition(async () => {
      try {
        await removeMember(campaignId, userId, memberId)
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to remove')
      }
    })
  }

  const handleAssign = async (characterSheetId: string, playerId: string | '') => {
    startTransition(async () => {
      try {
        await assignCharacterToPlayer(campaignId, userId, characterSheetId, playerId || null)
        router.refresh()
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to assign')
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-surface rounded-xl w-full max-w-xl mx-3 max-h-[90vh] overflow-y-auto border border-border-theme">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border-theme">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent-purple-light" />
            <h2 className="text-xl font-bold text-text-primary">Players</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary text-xl transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Invite form */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Invite a Player</h3>
            <form onSubmit={handleInvite} className="flex gap-2">
              <input
                type="email"
                placeholder="player@email.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                required
                className="flex-1 px-3 py-2 rounded-lg input-dark text-sm"
              />
              <button
                type="submit"
                disabled={inviting}
                className="btn-primary px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 shrink-0"
              >
                <UserPlus className="w-4 h-4" />
                {inviting ? 'Inviting…' : 'Invite'}
              </button>
            </form>
            <p className="text-text-muted text-xs mt-1.5">
              The player will get access when they sign in with this Google account.
            </p>
          </div>

          {error && (
            <p className="text-red-400 text-sm bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          {/* Members list */}
          <div>
            <h3 className="text-sm font-semibold text-text-secondary mb-3">Campaign Members</h3>
            {loading ? (
              <p className="text-text-muted text-sm">Loading…</p>
            ) : members.length === 0 ? (
              <p className="text-text-muted text-sm">No players invited yet.</p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-surface-elevated border border-border-theme"
                  >
                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-accent-purple/20 flex items-center justify-center shrink-0">
                      {member.user?.image ? (
                        <Image src={member.user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-accent-purple-light" />
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Name / email + status */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-text-primary truncate">
                          {member.user?.name || member.email}
                        </span>
                        {member.status === 'PENDING' && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                            Pending
                          </span>
                        )}
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-accent-purple/20 text-accent-purple-light flex items-center gap-0.5">
                          <Shield className="w-2.5 h-2.5" /> Player
                        </span>
                      </div>
                      {member.user?.name && (
                        <p className="text-xs text-text-muted truncate">{member.email}</p>
                      )}

                      {/* Character assignment */}
                      {member.status === 'ACCEPTED' && member.user && (
                        <div className="mt-2">
                          <label className="text-xs text-text-muted block mb-1">Assigned character</label>
                          <select
                            defaultValue={
                              characterSheets.find((s) => s.assignedPlayerId === member.user!.id)?.id ?? ''
                            }
                            onChange={(e) => handleAssign(e.target.value, member.user!.id)}
                            disabled={isPending || !characterSheets.some((s) => !s.assignedPlayerId || s.assignedPlayerId === member.user!.id)}
                            className="w-full px-2 py-1 rounded input-dark text-xs"
                          >
                            <option value="">— None —</option>
                            {characterSheets
                              .filter((s) => !s.assignedPlayerId || s.assignedPlayerId === member.user!.id)
                              .map((s) => (
                                <option key={s.id} value={s.id}>
                                  {s.wikiEntry.title}
                                </option>
                              ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Remove */}
                    <button
                      onClick={() => handleRemove(member.id)}
                      disabled={isPending}
                      className="p-1 rounded text-text-muted hover:text-red-400 transition-colors shrink-0"
                      title="Remove player"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Info note */}
          <p className="text-text-muted text-xs border-t border-border-theme pt-4">
            Players see only their character sheet and the party overview. Wiki notes and session recaps remain DM-only.
          </p>
        </div>
      </div>
    </div>
  )
}

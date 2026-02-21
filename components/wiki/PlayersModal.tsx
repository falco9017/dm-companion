'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Users, UserPlus, Trash2, Shield, User } from 'lucide-react'
import {
  inviteMember,
  getCampaignMembers,
  removeMember,
  assignCharacterToPlayer,
} from '@/actions/campaign-members'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { toast } from 'sonner'

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
  const [removeTarget, setRemoveTarget] = useState<string | null>(null)

  useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    getCampaignMembers(campaignId, userId)
      .then((m) => setMembers(m as Member[]))
      .catch(() => setError('Failed to load members'))
      .finally(() => setLoading(false))
  }, [isOpen, campaignId, userId])

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
      toast.error(err instanceof Error ? err.message : 'Failed to invite')
    } finally {
      setInviting(false)
    }
  }

  const handleRemove = async (memberId: string) => {
    startTransition(async () => {
      try {
        await removeMember(campaignId, userId, memberId)
        setMembers((prev) => prev.filter((m) => m.id !== memberId))
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to remove')
      }
    })
    setRemoveTarget(null)
  }

  const handleAssign = async (characterSheetId: string, playerId: string | '') => {
    startTransition(async () => {
      try {
        await assignCharacterToPlayer(campaignId, userId, characterSheetId, playerId || null)
        router.refresh()
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Failed to assign')
      }
    })
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <SheetContent side="right" className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              <SheetTitle>Players</SheetTitle>
            </div>
          </SheetHeader>

          <div className="space-y-6 mt-6">
            {/* Invite form */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Invite a Player</h3>
              <form onSubmit={handleInvite} className="flex gap-2">
                <Input
                  type="email"
                  placeholder="player@email.com"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  className="flex-1"
                />
                <Button type="submit" disabled={inviting} size="sm">
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  {inviting ? 'Inviting...' : 'Invite'}
                </Button>
              </form>
              <p className="text-muted-foreground text-xs mt-1.5">
                The player will get access when they sign in with this Google account.
              </p>
            </div>

            {error && (
              <p className="text-destructive text-sm bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* Members list */}
            <div>
              <h3 className="text-sm font-semibold mb-3">Campaign Members</h3>
              {loading ? (
                <p className="text-muted-foreground text-sm">Loading...</p>
              ) : members.length === 0 ? (
                <p className="text-muted-foreground text-sm">No players invited yet.</p>
              ) : (
                <div className="space-y-2">
                  {members.map((member) => (
                    <div
                      key={member.id}
                      className="flex items-start gap-3 p-3 rounded-lg bg-muted border"
                    >
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                        {member.user?.image ? (
                          <Image src={member.user.image} alt="" width={32} height={32} className="w-8 h-8 rounded-full" />
                        ) : (
                          <User className="w-4 h-4 text-primary" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium truncate">
                            {member.user?.name || member.email}
                          </span>
                          {member.status === 'PENDING' && (
                            <Badge variant="outline" className="text-[10px] bg-amber-500/20 text-amber-600 dark:text-amber-300 border-amber-500/30">
                              Pending
                            </Badge>
                          )}
                          <Badge variant="secondary" className="text-[10px] gap-0.5">
                            <Shield className="w-2.5 h-2.5" /> Player
                          </Badge>
                        </div>
                        {member.user?.name && (
                          <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                        )}

                        {member.status === 'ACCEPTED' && member.user && (
                          <div className="mt-2">
                            <label className="text-xs text-muted-foreground block mb-1">Assigned character</label>
                            <select
                              defaultValue={
                                characterSheets.find((s) => s.assignedPlayerId === member.user!.id)?.id ?? ''
                              }
                              onChange={(e) => handleAssign(e.target.value, member.user!.id)}
                              disabled={isPending || !characterSheets.some((s) => !s.assignedPlayerId || s.assignedPlayerId === member.user!.id)}
                              className="w-full px-2 py-1 rounded-md border border-input bg-transparent text-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            >
                              <option value="">-- None --</option>
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

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-muted-foreground hover:text-destructive shrink-0"
                        onClick={() => setRemoveTarget(member.id)}
                        disabled={isPending}
                        title="Remove player"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <p className="text-muted-foreground text-xs border-t pt-4">
              Players see only their character sheet and the party overview. Wiki notes and session recaps remain DM-only.
            </p>
          </div>
        </SheetContent>
      </Sheet>

      <ConfirmDialog
        open={!!removeTarget}
        onOpenChange={(open) => !open && setRemoveTarget(null)}
        title="Remove Player"
        description="Remove this player from the campaign?"
        confirmLabel="Remove"
        cancelLabel="Cancel"
        variant="destructive"
        onConfirm={() => removeTarget && handleRemove(removeTarget)}
      />
    </>
  )
}

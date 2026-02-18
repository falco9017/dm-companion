import { prisma } from './db'

export type CampaignRole = 'DM' | 'PLAYER'

export interface CampaignAccess {
  role: CampaignRole
  userId: string
  campaignId: string
  /** The CampaignMember row — only present for PLAYER role */
  memberId?: string
}

/**
 * Returns the user's access level for a campaign, or null if they have no access.
 * DM = campaign owner. PLAYER = accepted CampaignMember row.
 */
export async function getCampaignAccess(
  campaignId: string,
  userId: string
): Promise<CampaignAccess | null> {
  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: {
      ownerId: true,
      members: {
        where: { userId, status: 'ACCEPTED' },
        select: { id: true, role: true },
      },
    },
  })

  if (!campaign) return null

  if (campaign.ownerId === userId) {
    return { role: 'DM', userId, campaignId }
  }

  const membership = campaign.members[0]
  if (membership) {
    return {
      role: membership.role as CampaignRole,
      userId,
      campaignId,
      memberId: membership.id,
    }
  }

  return null
}

export function isDM(access: CampaignAccess): boolean {
  return access.role === 'DM'
}

export function isPlayer(access: CampaignAccess): boolean {
  return access.role === 'PLAYER'
}

/**
 * Returns the character sheet assigned to the player, or null.
 */
export async function getPlayerCharacterSheet(campaignId: string, userId: string) {
  return prisma.characterSheet.findFirst({
    where: { campaignId, assignedPlayerId: userId },
    include: {
      wikiEntry: { select: { id: true, title: true } },
    },
  })
}

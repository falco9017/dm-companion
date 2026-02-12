import { auth } from '@/lib/auth'
import { getCampaign } from '@/actions/campaigns'
import { getWikiEntries, getWikiEntriesByType } from '@/actions/wiki'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { WikiEntryType } from '@prisma/client'

const typeIcons: Record<WikiEntryType, string> = {
  SESSION_RECAP: '📜',
  CHARACTER: '👤',
  LOCATION: '🗺️',
  EVENT: '⚔️',
  ITEM: '💎',
  NPC: '🎭',
  FACTION: '🏰',
  LORE: '📚',
  QUEST: '🎯',
  OTHER: '📝',
}

const typeLabels: Record<WikiEntryType, string> = {
  SESSION_RECAP: 'Session Recaps',
  CHARACTER: 'Characters',
  LOCATION: 'Locations',
  EVENT: 'Events',
  ITEM: 'Items',
  NPC: 'NPCs',
  FACTION: 'Factions',
  LORE: 'Lore',
  QUEST: 'Quests',
  OTHER: 'Other',
}

export default async function WikiPage({
  params,
  searchParams,
}: {
  params: Promise<{ campaignId: string }>
  searchParams: Promise<{ type?: WikiEntryType }>
}) {
  const { campaignId } = await params
  const { type } = await searchParams
  const session = await auth()
  const campaign = await getCampaign(campaignId, session!.user.id)

  if (!campaign) {
    notFound()
  }

  const entriesByType = await getWikiEntriesByType(campaignId, session!.user.id)
  const entries = await getWikiEntries(campaignId, session!.user.id, type ? { type } : undefined)

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="text-purple-300 hover:text-purple-200 text-sm mb-2 inline-block"
        >
          ← Back to Campaign
        </Link>
        <h1 className="text-3xl font-bold text-white">Campaign Wiki</h1>
      </div>

      {/* Type filters */}
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/campaigns/${campaignId}/wiki`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            !type
              ? 'bg-purple-600 text-white'
              : 'bg-white/10 text-slate-300 hover:bg-white/20'
          }`}
        >
          All ({entries.length})
        </Link>
        {entriesByType.map((group) => (
          <Link
            key={group.type}
            href={`/campaigns/${campaignId}/wiki?type=${group.type}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              type === group.type
                ? 'bg-purple-600 text-white'
                : 'bg-white/10 text-slate-300 hover:bg-white/20'
            }`}
          >
            {typeIcons[group.type]} {typeLabels[group.type]} ({group._count})
          </Link>
        ))}
      </div>

      {/* Entries list */}
      {entries.length === 0 ? (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-12 text-center">
          <p className="text-slate-300 text-lg">No wiki entries yet</p>
          <p className="text-slate-400 text-sm mt-2">
            Upload and process audio files to generate wiki entries automatically
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {entries.map((entry) => (
            <Link
              key={entry.id}
              href={`/campaigns/${campaignId}/wiki/${entry.id}`}
              className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-4 hover:bg-white/20 transition-colors"
            >
              <div className="flex items-start gap-2 mb-2">
                <span className="text-2xl">{typeIcons[entry.type]}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white truncate">
                    {entry.title}
                  </h3>
                  <p className="text-xs text-slate-400">{typeLabels[entry.type]}</p>
                </div>
              </div>
              {entry.excerpt && (
                <p className="text-sm text-slate-300 line-clamp-2 mb-2">
                  {entry.excerpt}
                </p>
              )}
              {entry.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {entry.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

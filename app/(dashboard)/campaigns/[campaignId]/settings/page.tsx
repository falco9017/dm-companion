import { auth } from '@/lib/auth'
import { getCampaign, updateCampaign, deleteCampaign } from '@/actions/campaigns'
import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'

export default async function SettingsPage({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  const { campaignId } = await params
  const session = await auth()
  const campaign = await getCampaign(campaignId, session!.user.id)

  if (!campaign) {
    notFound()
  }

  async function handleUpdate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    await updateCampaign(campaignId, session!.user.id, {
      name,
      description,
    })

    redirect(`/campaigns/${campaignId}`)
  }

  async function handleDelete() {
    'use server'
    await deleteCampaign(campaignId, session!.user.id)
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <Link
          href={`/campaigns/${campaignId}`}
          className="text-purple-300 hover:text-purple-200 text-sm mb-2 inline-block"
        >
          ← Back to Campaign
        </Link>
        <h1 className="text-3xl font-bold text-white">Campaign Settings</h1>
      </div>

      {/* Update Form */}
      <form action={handleUpdate} className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-8">
        <h2 className="text-xl font-bold text-white mb-4">General Settings</h2>
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              defaultValue={campaign.name}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={campaign.description || ''}
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>

      {/* Delete Form */}
      <form action={handleDelete} className="bg-red-500/10 backdrop-blur-sm rounded-lg border border-red-500/30 p-8">
        <h2 className="text-xl font-bold text-red-300 mb-2">Danger Zone</h2>
        <p className="text-slate-300 text-sm mb-4">
          Deleting a campaign is permanent and will remove all audio files, wiki entries, and chat history.
        </p>
        <button
          type="submit"
          className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          onClick={(e) => {
            if (!confirm('Are you sure you want to delete this campaign? This action cannot be undone.')) {
              e.preventDefault()
            }
          }}
        >
          Delete Campaign
        </button>
      </form>
    </div>
  )
}

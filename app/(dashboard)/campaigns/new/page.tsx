import { auth } from '@/lib/auth'
import { createCampaign } from '@/actions/campaigns'
import { redirect } from 'next/navigation'

export default async function NewCampaignPage() {
  const session = await auth()

  async function handleCreate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string

    const campaign = await createCampaign(session!.user.id, name, description)
    redirect(`/campaigns/${campaign.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-3xl font-bold text-white mb-6">Create New Campaign</h1>

      <form action={handleCreate} className="bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 p-8">
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
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="The Dragon's Lair"
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
              className="w-full px-4 py-2 rounded-lg bg-black/30 border border-purple-500/30 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="A thrilling adventure through ancient ruins..."
            />
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Create Campaign
            </button>
            <a
              href="/campaigns"
              className="px-6 py-3 rounded-lg border border-purple-500/30 text-slate-300 hover:bg-white/10 transition-colors"
            >
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}

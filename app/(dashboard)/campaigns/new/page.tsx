import { auth } from '@/lib/auth'
import { createCampaign } from '@/actions/campaigns'
import { redirect } from 'next/navigation'

export default async function NewCampaignPage() {
  const session = await auth()

  async function handleCreate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const language = formData.get('language') as string || 'en'

    const campaign = await createCampaign(session!.user.id, name, description, language)
    redirect(`/campaigns/${campaign.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-white mb-6">Create New Campaign</h1>

      <form action={handleCreate} className="bg-gray-800/50 rounded-lg border border-gray-700 p-8">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="The Dragon's Lair"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-300 mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="A thrilling adventure through ancient ruins..."
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-gray-300 mb-2">
              Language
            </label>
            <select
              id="language"
              name="language"
              defaultValue="en"
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="it">Italian</option>
            </select>
            <p className="text-gray-500 text-xs mt-1">
              Wiki entries, summaries, and chat will use this language.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              type="submit"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
            >
              Create Campaign
            </button>
            <a
              href="/campaigns"
              className="px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
            >
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}

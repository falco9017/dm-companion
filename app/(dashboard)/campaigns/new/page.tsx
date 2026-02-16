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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 text-glow">Create New Campaign</h1>

      <form action={handleCreate} className="glass-card rounded-xl p-6 sm:p-8 bg-surface">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
              Campaign Name *
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg input-dark"
              placeholder="The Dragon's Lair"
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-3 rounded-lg input-dark"
              placeholder="A thrilling adventure through ancient ruins..."
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-text-secondary mb-2">
              Language
            </label>
            <select
              id="language"
              name="language"
              defaultValue="en"
              className="w-full px-4 py-3 rounded-lg input-dark"
            >
              <option value="en">English</option>
              <option value="it">Italian</option>
            </select>
            <p className="text-text-muted text-xs mt-1">
              Wiki entries, summaries, and chat will use this language.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 btn-primary px-6 py-3 rounded-lg"
            >
              Create Campaign
            </button>
            <a
              href="/campaigns"
              className="px-6 py-3 rounded-lg border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors text-center"
            >
              Cancel
            </a>
          </div>
        </div>
      </form>
    </div>
  )
}

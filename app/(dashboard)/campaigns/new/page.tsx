import { auth } from '@/lib/auth'
import { createCampaign, getCampaigns } from '@/actions/campaigns'
import { getUserProfile } from '@/actions/profile'
import { getEffectiveTier, getLimits } from '@/lib/subscription'
import { t, type Locale } from '@/lib/i18n'
import { redirect } from 'next/navigation'
import Link from 'next/link'

export default async function NewCampaignPage() {
  const session = await auth()
  const userId = session!.user.id

  const [profile, tier, campaigns] = await Promise.all([
    getUserProfile(userId),
    getEffectiveTier(userId),
    getCampaigns(userId),
  ])

  const limits = getLimits(tier)
  if (limits.maxCampaigns !== Infinity && campaigns.length >= limits.maxCampaigns) {
    redirect('/campaigns')
  }

  const locale = (profile.uiLanguage === 'it' ? 'it' : 'en') as Locale

  async function handleCreate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const language = formData.get('language') as string || 'en'

    const campaign = await createCampaign(userId, name, description, language)
    redirect(`/campaigns/${campaign.id}`)
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
      <h1 className="text-2xl sm:text-3xl font-bold text-text-primary mb-6 text-glow">{t(locale, 'campaigns.new.title')}</h1>

      <form action={handleCreate} className="rounded-xl p-6 sm:p-8 bg-surface border border-border-theme">
        <div className="space-y-6">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-text-secondary mb-2">
              {t(locale, 'campaigns.new.name')}
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-3 rounded-lg input-dark"
              placeholder={t(locale, 'campaigns.new.namePlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="description" className="block text-sm font-medium text-text-secondary mb-2">
              {t(locale, 'campaigns.new.description')}
            </label>
            <textarea
              id="description"
              name="description"
              rows={4}
              className="w-full px-4 py-3 rounded-lg input-dark"
              placeholder={t(locale, 'campaigns.new.descPlaceholder')}
            />
          </div>

          <div>
            <label htmlFor="language" className="block text-sm font-medium text-text-secondary mb-2">
              {t(locale, 'campaigns.new.language')}
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
              {t(locale, 'campaigns.new.languageHint')}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              type="submit"
              className="flex-1 btn-primary px-6 py-3 rounded-lg"
            >
              {t(locale, 'campaigns.create')}
            </button>
            <Link
              href="/campaigns"
              className="px-6 py-3 rounded-lg border border-border-theme text-text-secondary hover:text-text-primary hover:bg-white/5 transition-colors text-center"
            >
              {t(locale, 'common.cancel')}
            </Link>
          </div>
        </div>
      </form>
    </div>
  )
}

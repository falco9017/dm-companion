import { auth } from '@/lib/auth'
import { createCampaign, getCampaigns } from '@/actions/campaigns'
import { getUserProfile } from '@/actions/profile'
import { getEffectiveTier, getLimits } from '@/lib/subscription'
import { t, type Locale } from '@/lib/i18n'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

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

  const locale = (profile.uiLanguage || 'en') as Locale

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
      <h1 className="text-2xl sm:text-3xl font-bold mb-6">{t(locale, 'campaigns.new.title')}</h1>

      <Card>
        <CardContent className="p-6 sm:p-8">
          <form action={handleCreate} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">{t(locale, 'campaigns.new.name')}</Label>
              <Input
                type="text"
                id="name"
                name="name"
                required
                placeholder={t(locale, 'campaigns.new.namePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t(locale, 'campaigns.new.description')}</Label>
              <Textarea
                id="description"
                name="description"
                rows={4}
                placeholder={t(locale, 'campaigns.new.descPlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">{t(locale, 'campaigns.new.language')}</Label>
              <select
                id="language"
                name="language"
                defaultValue="en"
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="en">English</option>
                <option value="it">Italian</option>
                <option value="fr">Français</option>
                <option value="de">Deutsch</option>
                <option value="es">Español</option>
              </select>
              <p className="text-muted-foreground text-xs">
                {t(locale, 'campaigns.new.languageHint')}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button type="submit" className="flex-1">
                {t(locale, 'campaigns.create')}
              </Button>
              <Button asChild variant="outline">
                <Link href="/campaigns">{t(locale, 'common.cancel')}</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

import { auth, signOut } from '@/lib/auth'
import { getUserProfile } from '@/actions/profile'
import { getCampaigns } from '@/actions/campaigns'
import { getEffectiveTier } from '@/lib/subscription'
import { t, type Locale } from '@/lib/i18n'
import SettingsForm from './SettingsForm'
import ChangePasswordForm from './ChangePasswordForm'
import SubscriptionSection from './SubscriptionSection'
import BackButton from './BackButton'
import { EmailVerificationBanner } from '../EmailVerificationBanner'
import { LogOut } from 'lucide-react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'

export default async function ProfilePage() {
  const session = await auth()
  const [profile, effectiveTier, campaigns] = await Promise.all([
    getUserProfile(session!.user.id),
    getEffectiveTier(session!.user.id),
    getCampaigns(session!.user.id),
  ])
  const locale = (profile.uiLanguage || 'en') as Locale

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/signin' })
  }

  const showEmailBanner = !profile.emailVerified && !!profile.password

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-6">
      {showEmailBanner && (
        <EmailVerificationBanner email={profile.email} />
      )}
      <div>
        <BackButton />
        <h1 className="text-2xl sm:text-3xl font-bold">{t(locale, 'profile.title')}</h1>
      </div>

      {/* Profile header card */}
      <Card>
        <CardContent className="p-6 sm:p-8">
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              {profile.image && <AvatarImage src={profile.image} alt="" />}
              <AvatarFallback className="text-lg">
                {(profile.name || profile.email || '?')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-lg font-semibold">{profile.name || t(locale, 'profile.noName')}</p>
              <p className="text-sm text-muted-foreground">{profile.email}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {t(locale, 'profile.memberSince')} {new Date(profile.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Settings section */}
      <Card>
        <CardHeader>
          <CardTitle>{t(locale, 'profile.settings')}</CardTitle>
        </CardHeader>
        <CardContent>
          <SettingsForm
            userId={session!.user.id}
            name={profile.name || ''}
            uiLanguage={profile.uiLanguage}
            dateFormat={profile.dateFormat}
          />
        </CardContent>
      </Card>

      {/* Account section */}
      <Card>
        <CardHeader>
          <CardTitle>{t(locale, 'profile.account')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Current plan */}
          <SubscriptionSection
            userId={session!.user.id}
            subscriptionTier={effectiveTier}
            subscriptionStatus={profile.subscriptionStatus || null}
            campaignCount={campaigns.length}
          />

          {/* Change password (credentials users only) */}
          {profile.password && (
            <>
              <Separator />
              <div>
                <h3 className="text-sm font-semibold mb-4">Change password</h3>
                <ChangePasswordForm />
              </div>
            </>
          )}

          {/* Sign out */}
          <Separator />
          <form action={handleSignOut}>
            <Button variant="outline" type="submit" className="w-full">
              <LogOut className="w-4 h-4 mr-2" />
              {t(locale, 'nav.signOut')}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

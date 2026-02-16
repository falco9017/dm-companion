import { auth, signOut } from '@/lib/auth'
import { getUserProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'
import ProfileForm from './ProfileForm'

export default async function ProfilePage() {
  const session = await auth()
  const profile = await getUserProfile(session!.user.id)

  async function handleSignOut() {
    'use server'
    await signOut({ redirectTo: '/signin' })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <h1 className="text-3xl font-bold text-white">Profile</h1>

      {/* Profile card */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-8">
        <div className="flex items-center gap-4 mb-6">
          {profile.image && (
            <img
              src={profile.image}
              alt=""
              className="w-16 h-16 rounded-full"
            />
          )}
          <div>
            <p className="text-lg font-semibold text-white">{profile.name || 'No name set'}</p>
            <p className="text-sm text-gray-400">{profile.email}</p>
            <p className="text-xs text-gray-500 mt-1">
              Member since {new Date(profile.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <ProfileForm
          userId={session!.user.id}
          name={profile.name || ''}
          uiLanguage={profile.uiLanguage}
        />
      </div>

      {/* Sign out */}
      <form action={handleSignOut}>
        <button
          type="submit"
          className="w-full px-6 py-3 rounded-lg border border-gray-700 text-gray-300 hover:bg-gray-800 transition-colors"
        >
          Sign Out
        </button>
      </form>
    </div>
  )
}

import { auth, signOut } from '@/lib/auth'
import { getUserProfile, updateUserProfile } from '@/actions/profile'
import { redirect } from 'next/navigation'

export default async function ProfilePage() {
  const session = await auth()
  const profile = await getUserProfile(session!.user.id)

  async function handleUpdate(formData: FormData) {
    'use server'
    const name = formData.get('name') as string
    const uiLanguage = formData.get('uiLanguage') as string || 'en'

    await updateUserProfile(session!.user.id, { name, uiLanguage })
    redirect('/profile')
  }

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

        <form action={handleUpdate} className="space-y-5">
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
              Display Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              defaultValue={profile.name || ''}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your name"
            />
          </div>

          <div>
            <label htmlFor="uiLanguage" className="block text-sm font-medium text-gray-300 mb-1">
              UI Language
            </label>
            <select
              id="uiLanguage"
              name="uiLanguage"
              defaultValue={profile.uiLanguage}
              className="w-full px-4 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="en">English</option>
              <option value="it">Italian</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Save Changes
          </button>
        </form>
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

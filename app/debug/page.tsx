import { auth } from '@/lib/auth'

export default async function DebugPage() {
  const session = await auth()

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Debug Page</h1>

      <div className="bg-gray-800 p-4 rounded">
        <h2 className="text-xl mb-2">Session Status:</h2>
        <pre className="text-sm overflow-auto">
          {JSON.stringify(session, null, 2)}
        </pre>
      </div>

      <div className="mt-4">
        {session ? (
          <p className="text-green-400">✓ User is authenticated</p>
        ) : (
          <p className="text-red-400">✗ User is not authenticated</p>
        )}
      </div>
    </div>
  )
}

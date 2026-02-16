import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            DM Companion
          </h1>
          <p className="text-2xl text-gray-400 font-medium">
            Your Ultimate Campaign Management Tool
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="text-lg text-gray-300">
            For Dungeon Masters & Players
          </div>
        </div>

        <div className="mt-8 p-6 bg-gray-800/50 rounded-lg border border-gray-700 max-w-md">
          <p className="text-white/90 mb-4">
            Upload audio from your sessions, auto-transcribe with AI, and create a searchable campaign wiki
          </p>
          <Link
            href="/signin"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}

import Link from 'next/link'

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <main className="flex flex-col items-center gap-8 text-center px-6">
        <div className="flex flex-col items-center gap-4">
          <h1 className="text-6xl font-bold text-white tracking-tight">
            DM Companion
          </h1>
          <p className="text-2xl text-purple-300 font-medium">
            Your Ultimate Campaign Management Tool
          </p>
        </div>

        <div className="flex flex-col items-center gap-2 mt-4">
          <div className="text-lg text-slate-300">
            For Dungeon Masters & Players
          </div>
        </div>

        <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 max-w-md">
          <p className="text-white/90 mb-4">
            Upload audio from your sessions, auto-transcribe with AI, and create a searchable campaign wiki
          </p>
          <Link
            href="/signin"
            className="inline-block bg-purple-600 hover:bg-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
          >
            Get Started
          </Link>
        </div>
      </main>
    </div>
  );
}

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
          <div className="text-sm text-slate-400">
            Coming soon...
          </div>
        </div>

        <div className="mt-8 p-6 bg-white/10 backdrop-blur-sm rounded-lg border border-purple-500/30 max-w-md">
          <p className="text-white/90">
            Hello World! 🎲
          </p>
          <p className="text-sm text-slate-300 mt-2">
            Infrastructure setup in progress
          </p>
        </div>
      </main>
    </div>
  );
}

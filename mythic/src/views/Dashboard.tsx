import { Play, Upload, Users, BookOpen, Clock, ChevronRight } from 'lucide-react';

export function Dashboard() {
  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <header className="space-y-2">
        <h1 className="font-serif text-3xl md:text-4xl font-medium text-text-main">Welcome back, DM.</h1>
        <p className="text-text-muted">Your party awaits in Barovia. What would you like to do today?</p>
      </header>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button className="flex flex-col items-start p-6 bg-red-50/50 border border-red-200 dark:bg-red-950/20 dark:border-red-900/30 rounded-2xl hover:bg-red-100/50 dark:hover:bg-red-950/40 transition-all group">
          <div className="p-3 bg-red-100 dark:bg-red-900/50 rounded-xl text-red-600 dark:text-red-400 mb-4 group-hover:scale-110 transition-transform">
            <Play className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-lg text-text-main mb-1">Start Live Session</h3>
          <p className="text-sm text-text-muted text-left">Open the combat tracker and party overview.</p>
        </button>

        <button className="flex flex-col items-start p-6 bg-surface border border-border rounded-2xl hover:border-primary hover:bg-surface-hover transition-all group">
          <div className="p-3 bg-background rounded-xl text-primary mb-4 group-hover:scale-110 transition-transform">
            <Upload className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-lg text-text-main mb-1">Upload Audio</h3>
          <p className="text-sm text-text-muted text-left">Transcribe and auto-generate wiki updates.</p>
        </button>

        <button className="flex flex-col items-start p-6 bg-surface border border-border rounded-2xl hover:border-primary hover:bg-surface-hover transition-all group">
          <div className="p-3 bg-background rounded-xl text-primary mb-4 group-hover:scale-110 transition-transform">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="font-medium text-lg text-text-main mb-1">Prep Next Session</h3>
          <p className="text-sm text-text-muted text-left">Review notes and build encounters with AI.</p>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-2xl text-text-main">Recent Activity</h2>
            <button className="text-sm text-primary hover:underline">View All</button>
          </div>
          
          <div className="bg-surface border border-border rounded-2xl overflow-hidden">
            {[
              { title: 'Session 14 Transcribed', desc: 'Audio processing complete. 3 new NPCs identified.', time: '2 hours ago', icon: Clock },
              { title: 'Wiki Updated: Vallaki', desc: 'Added notes about the Burgomaster from last session.', time: 'Yesterday', icon: BookOpen },
              { title: 'Character Sheet Updated', desc: 'Ireena leveled up to Level 5.', time: '2 days ago', icon: Users },
            ].map((item, i) => (
              <div key={i} className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 border-b border-border last:border-0 hover:bg-surface-hover transition-colors cursor-pointer">
                <div className="hidden sm:flex p-2 bg-background rounded-lg text-text-muted">
                  <item.icon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 sm:mb-0">
                    <div className="sm:hidden p-1.5 bg-background rounded-md text-text-muted">
                      <item.icon className="w-4 h-4" />
                    </div>
                    <h4 className="font-medium text-text-main">{item.title}</h4>
                  </div>
                  <p className="text-sm text-text-muted">{item.desc}</p>
                </div>
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto mt-2 sm:mt-0">
                  <span className="text-xs text-text-muted">{item.time}</span>
                  <ChevronRight className="w-4 h-4 text-text-muted hidden sm:block" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Party Snapshot */}
        <div className="space-y-4">
          <h2 className="font-serif text-2xl text-text-main">Party Snapshot</h2>
          <div className="bg-surface border border-border rounded-2xl p-4 space-y-4">
            {[
              { name: 'Grog', class: 'Barbarian', level: 5, hp: '55/55' },
              { name: 'Vex', class: 'Ranger', level: 5, hp: '42/42' },
              { name: 'Scanlan', class: 'Bard', level: 5, hp: '38/38' },
              { name: 'Keyleth', class: 'Druid', level: 5, hp: '45/45' },
            ].map((char, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-background rounded-xl border border-border">
                <div>
                  <h4 className="font-medium text-text-main">{char.name}</h4>
                  <p className="text-xs text-text-muted">Lvl {char.level} {char.class}</p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-mono text-emerald-600 dark:text-emerald-400">{char.hp} HP</span>
                </div>
              </div>
            ))}
            <button className="w-full py-2 text-sm text-primary border border-primary/30 rounded-xl hover:bg-primary/10 transition-colors">
              View Full Party
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

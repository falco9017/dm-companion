import { Shield, Heart, Sword, Skull, Plus, Settings2, Users } from 'lucide-react';
import { useState } from 'react';

export function LiveSession() {
  const [showParty, setShowParty] = useState(false);

  return (
    <div className="h-full flex flex-col">
      {/* Top Bar */}
      <header className="flex items-center justify-between p-4 border-b border-border bg-surface">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
            </span>
            <h1 className="font-serif text-lg md:text-xl font-medium text-text-main truncate max-w-[150px] md:max-w-none">Session 15: The Amber Temple</h1>
          </div>
          <span className="text-sm text-text-muted font-mono hidden sm:inline">02:14:35</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowParty(!showParty)}
            className="lg:hidden p-2 bg-background text-text-muted rounded-lg hover:text-text-main transition-colors"
          >
            <Users className="w-5 h-5" />
          </button>
          <button className="px-3 md:px-4 py-2 bg-background text-text-main text-sm rounded-lg hover:bg-surface-hover border border-border transition-colors">
            End Session
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Left: Combat Tracker */}
        <div className="flex-1 border-r border-border flex flex-col bg-background">
          <div className="p-4 border-b border-border flex items-center justify-between bg-surface">
            <h2 className="font-serif text-lg text-text-main flex items-center gap-2">
              <Sword className="w-5 h-5 text-primary" />
              Combat Tracker
            </h2>
            <div className="flex gap-2">
              <button className="p-2 text-text-muted hover:text-text-main bg-background border border-border rounded-lg">
                <Plus className="w-4 h-4" />
              </button>
              <button className="p-2 text-text-muted hover:text-text-main bg-background border border-border rounded-lg">
                <Settings2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {/* Active Turn */}
            <div className="flex items-center gap-3 md:gap-4 p-3 md:p-4 bg-surface-hover border border-primary rounded-xl shadow-[0_0_15px_rgba(212,175,55,0.1)]">
              <div className="w-10 h-10 md:w-12 md:h-12 shrink-0 rounded-full bg-background border border-border flex items-center justify-center font-serif text-lg md:text-xl text-primary">
                21
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-medium text-base md:text-lg text-text-main truncate">Vex</h3>
                  <span className="text-[10px] md:text-xs px-2 py-0.5 bg-primary/10 text-primary rounded-full whitespace-nowrap">Active Turn</span>
                </div>
                <p className="text-xs md:text-sm text-text-muted">Ranger</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs md:text-sm items-end sm:items-center">
                <div className="flex items-center gap-1 text-text-muted">
                  <Shield className="w-3 h-3 md:w-4 md:h-4" /> 17
                </div>
                <div className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
                  <Heart className="w-3 h-3 md:w-4 md:h-4" /> 42/42
                </div>
              </div>
            </div>

            {/* Other Turns */}
            {[
              { init: 18, name: 'Vampire Spawn 1', type: 'Monster', hp: '35/60', ac: 15, isEnemy: true },
              { init: 14, name: 'Grog', type: 'Barbarian', hp: '55/55', ac: 15, isEnemy: false },
              { init: 12, name: 'Vampire Spawn 2', type: 'Monster', hp: '60/60', ac: 15, isEnemy: true },
              { init: 8, name: 'Keyleth', type: 'Druid', hp: '45/45', ac: 14, isEnemy: false },
            ].map((entity, i) => (
              <div key={i} className={`flex items-center gap-3 md:gap-4 p-3 rounded-xl border ${entity.isEnemy ? 'bg-red-50/50 border-red-200 dark:bg-red-950/10 dark:border-red-900/20' : 'bg-surface border-border'}`}>
                <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-background border border-border flex items-center justify-center font-serif text-base md:text-lg text-text-muted">
                  {entity.init}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-medium text-sm md:text-base truncate ${entity.isEnemy ? 'text-red-600 dark:text-red-400' : 'text-text-main'}`}>{entity.name}</h3>
                  <p className="text-[10px] md:text-xs text-text-muted">{entity.type}</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-1 sm:gap-4 text-xs md:text-sm items-end sm:items-center">
                  <div className="flex items-center gap-1 text-text-muted">
                    <Shield className="w-3 h-3 md:w-4 md:h-4" /> {entity.ac}
                  </div>
                  <div className={`flex items-center gap-1 ${entity.isEnemy ? 'text-red-600 dark:text-red-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    <Heart className="w-3 h-3 md:w-4 md:h-4" /> {entity.hp}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-border bg-surface">
            <button className="w-full py-3 bg-primary text-white dark:text-[#0a0a0a] font-medium rounded-xl hover:bg-primary-hover transition-colors">
              Next Turn
            </button>
          </div>
        </div>

        {/* Right: Party Overview (Drawer on mobile, Sidebar on desktop) */}
        <div className={`absolute lg:static inset-y-0 right-0 w-80 bg-surface border-l border-border flex flex-col transform transition-transform duration-300 z-30 ${showParty ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}`}>
          <div className="p-4 border-b border-border flex justify-between items-center">
            <h2 className="font-serif text-lg text-text-main">Party Overview</h2>
            <button 
              onClick={() => setShowParty(false)}
              className="lg:hidden p-1 text-text-muted hover:text-text-main"
            >
              <Plus className="w-5 h-5 rotate-45" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {[
              { name: 'Grog', pp: 12, pi: 10, conditions: [] },
              { name: 'Vex', pp: 18, pi: 14, conditions: ['Hunter\'s Mark'] },
              { name: 'Scanlan', pp: 14, pi: 16, conditions: ['Inspiration'] },
              { name: 'Keyleth', pp: 16, pi: 15, conditions: [] },
            ].map((char, i) => (
              <div key={i} className="bg-background border border-border rounded-xl p-3 space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium text-text-main">{char.name}</h3>
                  <button className="text-xs text-primary hover:underline">Sheet</button>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs text-text-muted">
                  <div className="bg-surface p-1.5 rounded text-center border border-border">
                    <span className="block text-text-main font-mono">{char.pp}</span>
                    Pass. Perc
                  </div>
                  <div className="bg-surface p-1.5 rounded text-center border border-border">
                    <span className="block text-text-main font-mono">{char.pi}</span>
                    Pass. Inv
                  </div>
                </div>
                {char.conditions.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {char.conditions.map((cond, j) => (
                      <span key={j} className="text-[10px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 rounded border dark:border-blue-900/50">
                        {cond}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

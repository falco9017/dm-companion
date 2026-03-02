import { Upload, Plus, FileText, User, Shield, Heart } from 'lucide-react';

export function Party() {
  const characters = [
    { name: 'Grog Strongjaw', player: 'Travis', class: 'Barbarian', race: 'Goliath', level: 5, ac: 15, hp: 55 },
    { name: 'Vex\'ahlia', player: 'Laura', class: 'Ranger', race: 'Half-Elf', level: 5, ac: 17, hp: 42 },
    { name: 'Scanlan Shorthalt', player: 'Sam', class: 'Bard', race: 'Gnome', level: 5, ac: 14, hp: 38 },
    { name: 'Keyleth', player: 'Marisha', class: 'Druid', race: 'Half-Elf', level: 5, ac: 14, hp: 45 },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-medium text-[#f5f5f5] mb-2">Party & Characters</h1>
          <p className="text-[#a3a3a3]">Manage player character sheets and permissions.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-[#141414] border border-[#2a2a2a] text-[#f5f5f5] font-medium rounded-xl hover:border-[#D4AF37] transition-colors">
            <Upload className="w-4 h-4 text-[#D4AF37]" />
            Import PDF
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0a0a0a] font-medium rounded-xl hover:bg-[#F3E5AB] transition-colors">
            <Plus className="w-4 h-4" />
            New Character
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {characters.map((char, i) => (
          <div key={i} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 flex gap-6 hover:border-[#D4AF37] transition-colors cursor-pointer group">
            <div className="w-24 h-24 rounded-xl bg-[#0a0a0a] border border-[#2a2a2a] flex items-center justify-center">
              <User className="w-8 h-8 text-[#a3a3a3] group-hover:text-[#D4AF37] transition-colors" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h2 className="font-serif text-2xl font-medium text-[#f5f5f5]">{char.name}</h2>
                <span className="text-xs text-[#a3a3a3]">Played by {char.player}</span>
              </div>
              <p className="text-sm text-[#D4AF37] mb-4">Level {char.level} {char.race} {char.class}</p>
              
              <div className="flex gap-4">
                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[#a3a3a3]" />
                  <span className="font-mono text-[#f5f5f5]">{char.ac}</span>
                </div>
                <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-lg px-3 py-1.5 flex items-center gap-2">
                  <Heart className="w-4 h-4 text-emerald-400" />
                  <span className="font-mono text-[#f5f5f5]">{char.hp}</span>
                </div>
                <div className="ml-auto flex items-center text-sm text-[#a3a3a3] hover:text-[#f5f5f5]">
                  <FileText className="w-4 h-4 mr-1" /> Sheet
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

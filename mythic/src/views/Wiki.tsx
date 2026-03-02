import { Search, Filter, MapPin, User, Book } from 'lucide-react';

export function Wiki() {
  const categories = [
    { id: 'all', label: 'All Entries' },
    { id: 'locations', label: 'Locations', icon: MapPin },
    { id: 'npcs', label: 'NPCs', icon: User },
    { id: 'lore', label: 'Lore & Items', icon: Book },
  ];

  const entries = [
    { title: 'Strahd von Zarovich', type: 'NPC', tags: ['Vampire', 'BBEG'], desc: 'The ancient vampire lord and ruler of Barovia. He resides in Castle Ravenloft.' },
    { title: 'Vallaki', type: 'Location', tags: ['Town'], desc: 'A large town in the center of Barovia, ruled by Baron Vargas Vallakovich.' },
    { title: 'Ireena Kolyana', type: 'NPC', tags: ['Ally'], desc: 'The adopted daughter of the late Burgomaster of the Village of Barovia. Strahd is obsessed with her.' },
    { title: 'The Sunsword', type: 'Item', tags: ['Artifact', 'Weapon'], desc: 'A unique blade of light that is said to be the key to defeating Strahd.' },
    { title: 'Old Bonegrinder', type: 'Location', tags: ['Windmill'], desc: 'An old windmill currently occupied by a coven of night hags.' },
    { title: 'Madam Eva', type: 'NPC', tags: ['Vistani', 'Seer'], desc: 'The wise leader of the Vistani camp at Tser Pool. She performed a Tarokka reading for the party.' },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto h-full flex flex-col">
      <header className="mb-8">
        <h1 className="font-serif text-4xl font-medium text-[#f5f5f5] mb-2">Campaign Wiki</h1>
        <p className="text-[#a3a3a3]">Auto-generated from your session transcripts. Shareable with players.</p>
      </header>

      {/* Search and Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#a3a3a3]" />
          <input 
            type="text" 
            placeholder="Search the wiki..." 
            className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-10 pr-4 py-3 text-[#f5f5f5] placeholder-[#a3a3a3] focus:outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <button key={cat.id} className={`flex items-center gap-2 px-4 py-2 rounded-xl border whitespace-nowrap transition-colors ${cat.id === 'all' ? 'bg-[#D4AF37] text-[#0a0a0a] border-[#D4AF37]' : 'bg-[#141414] text-[#a3a3a3] border-[#2a2a2a] hover:border-[#D4AF37] hover:text-[#f5f5f5]'}`}>
              {cat.icon && <cat.icon className="w-4 h-4" />}
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto pb-8">
        {entries.map((entry, i) => (
          <div key={i} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 hover:border-[#D4AF37] transition-all cursor-pointer group flex flex-col">
            <div className="flex justify-between items-start mb-3">
              <h3 className="font-serif text-xl font-medium text-[#f5f5f5] group-hover:text-[#D4AF37] transition-colors">{entry.title}</h3>
              <span className="text-xs px-2 py-1 bg-[#2a2a2a] text-[#a3a3a3] rounded-md">{entry.type}</span>
            </div>
            <p className="text-sm text-[#a3a3a3] mb-4 flex-1 line-clamp-3">{entry.desc}</p>
            <div className="flex flex-wrap gap-2 mt-auto">
              {entry.tags.map(tag => (
                <span key={tag} className="text-xs px-2 py-1 bg-[#0a0a0a] border border-[#2a2a2a] text-[#a3a3a3] rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

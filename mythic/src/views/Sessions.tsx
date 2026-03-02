import { Upload, Play, FileText, Mic, MoreVertical, Clock } from 'lucide-react';

export function Sessions() {
  return (
    <div className="p-8 max-w-6xl mx-auto flex flex-col h-full">
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-4xl font-medium text-[#f5f5f5] mb-2">Sessions & Audio</h1>
          <p className="text-[#a3a3a3]">Upload session recordings to generate transcripts, summaries, and wiki updates.</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37] text-[#0a0a0a] font-medium rounded-xl hover:bg-[#F3E5AB] transition-colors">
          <Upload className="w-4 h-4" />
          Upload Audio
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Left: Session List */}
        <div className="lg:col-span-1 border border-[#2a2a2a] bg-[#141414] rounded-2xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-[#2a2a2a] bg-[#1a1a1a]">
            <h2 className="font-medium text-[#f5f5f5]">Past Sessions</h2>
          </div>
          <div className="flex-1 overflow-y-auto">
            {[
              { num: 14, title: 'The Feast of St. Andral', date: 'Oct 12, 2023', duration: '3h 45m', status: 'Processed' },
              { num: 13, title: 'Arrival in Vallaki', date: 'Oct 5, 2023', duration: '4h 12m', status: 'Processed' },
              { num: 12, title: 'Old Bonegrinder', date: 'Sep 28, 2023', duration: '3h 30m', status: 'Processed' },
              { num: 11, title: 'Madam Eva\'s Reading', date: 'Sep 21, 2023', duration: '4h 05m', status: 'Processed' },
            ].map((session, i) => (
              <div key={i} className={`p-4 border-b border-[#2a2a2a] cursor-pointer transition-colors ${i === 0 ? 'bg-[#1a1a1a] border-l-2 border-l-[#D4AF37]' : 'hover:bg-[#1a1a1a]'}`}>
                <div className="flex justify-between items-start mb-1">
                  <h3 className="font-medium text-[#f5f5f5]">Session {session.num}</h3>
                  <span className="text-xs text-[#a3a3a3]">{session.date}</span>
                </div>
                <p className="text-sm text-[#D4AF37] mb-2">{session.title}</p>
                <div className="flex items-center gap-3 text-xs text-[#a3a3a3]">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {session.duration}</span>
                  <span className="flex items-center gap-1 text-emerald-400"><FileText className="w-3 h-3" /> {session.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Session Detail */}
        <div className="lg:col-span-2 border border-[#2a2a2a] bg-[#141414] rounded-2xl flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#2a2a2a]">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="font-serif text-2xl text-[#f5f5f5]">Session 14: The Feast of St. Andral</h2>
                <p className="text-[#a3a3a3]">Recorded on October 12, 2023</p>
              </div>
              <button className="p-2 text-[#a3a3a3] hover:text-[#f5f5f5] rounded-lg">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            {/* Audio Player Mock */}
            <div className="bg-[#0a0a0a] border border-[#2a2a2a] rounded-xl p-4 flex items-center gap-4">
              <button className="w-10 h-10 rounded-full bg-[#D4AF37] text-[#0a0a0a] flex items-center justify-center hover:bg-[#F3E5AB] transition-colors">
                <Play className="w-5 h-5 ml-1" />
              </button>
              <div className="flex-1">
                <div className="h-2 bg-[#2a2a2a] rounded-full overflow-hidden">
                  <div className="h-full bg-[#D4AF37] w-1/3"></div>
                </div>
                <div className="flex justify-between mt-2 text-xs text-[#a3a3a3] font-mono">
                  <span>01:15:22</span>
                  <span>03:45:00</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3">AI Summary</h3>
              <div className="bg-[#1a1a1a] p-4 rounded-xl text-sm text-[#f5f5f5] leading-relaxed border border-[#2a2a2a]">
                The party arrived at St. Andral's church only to find the holy bones missing. After interrogating the altar boy, Yeska, they discovered the coffin maker, Henrik van der Voort, had paid him to steal them. The party confronted Henrik, leading to a massive battle with six vampire spawn hidden in his shop.
              </div>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-[#a3a3a3] uppercase tracking-wider mb-3 flex items-center gap-2">
                <Mic className="w-4 h-4" /> Transcript
              </h3>
              <div className="space-y-4">
                {[
                  { speaker: 'DM', text: 'You kick open the door to the upstairs storage room. The smell of dust and old wood fills your nose. In the corner, you see several large wooden crates.' },
                  { speaker: 'Player 1 (Grog)', text: 'I walk up to the nearest crate and smash it open with my axe.' },
                  { speaker: 'DM', text: 'Roll an attack with advantage since it\'s an inanimate object.' },
                  { speaker: 'Player 1 (Grog)', text: 'That\'s a 22.' },
                  { speaker: 'DM', text: 'The crate shatters. Inside, dirt spills out onto the floor. And rising from the dirt, hissing, is a pale figure with elongated fangs. Roll initiative.' },
                ].map((line, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-24 shrink-0 text-right">
                      <span className={`text-xs font-medium ${line.speaker === 'DM' ? 'text-[#D4AF37]' : 'text-blue-400'}`}>
                        {line.speaker}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm text-[#f5f5f5]">{line.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

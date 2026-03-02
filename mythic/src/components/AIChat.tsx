import { X, Send, Sparkles, Book, Swords } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AIChatProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AIChat({ isOpen, onClose }: AIChatProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="fixed top-0 right-0 w-96 h-screen bg-[#141414]/95 backdrop-blur-xl border-l border-[#2a2a2a] shadow-2xl flex flex-col z-50"
        >
          {/* Header */}
          <div className="p-4 border-b border-[#2a2a2a] flex items-center justify-between">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <Sparkles className="w-5 h-5" />
              <h2 className="font-serif text-lg font-semibold">Mythic Oracle</h2>
            </div>
            <button 
              onClick={onClose}
              className="p-2 text-[#a3a3a3] hover:text-[#f5f5f5] rounded-lg hover:bg-[#2a2a2a] transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-6">
            <div className="flex flex-col gap-2">
              <div className="bg-[#2a2a2a] text-[#f5f5f5] p-3 rounded-2xl rounded-tl-sm text-sm max-w-[85%]">
                Greetings, Dungeon Master. I have access to the Curse of Strahd campaign data, the latest session transcripts, and the core D&D rules. How can I assist your planning today?
              </div>
            </div>

            {/* Suggestions */}
            <div className="space-y-2">
              <p className="text-xs text-[#a3a3a3] uppercase tracking-wider font-semibold px-1">Suggestions</p>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-left transition-all group">
                <div className="p-2 rounded-lg bg-[#2a2a2a] group-hover:bg-[#D4AF37]/20 text-[#D4AF37]">
                  <Swords className="w-4 h-4" />
                </div>
                <span className="text-sm text-[#a3a3a3] group-hover:text-[#f5f5f5]">Generate an encounter for 4 level 5 players in the Svalich Woods.</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-xl border border-[#2a2a2a] hover:border-[#D4AF37] hover:bg-[#D4AF37]/5 text-left transition-all group">
                <div className="p-2 rounded-lg bg-[#2a2a2a] group-hover:bg-[#D4AF37]/20 text-[#D4AF37]">
                  <Book className="w-4 h-4" />
                </div>
                <span className="text-sm text-[#a3a3a3] group-hover:text-[#f5f5f5]">Summarize the key events from Session 14.</span>
              </button>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#2a2a2a] bg-[#0a0a0a]">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask the Oracle..." 
                className="w-full bg-[#141414] border border-[#2a2a2a] rounded-xl pl-4 pr-12 py-3 text-sm text-[#f5f5f5] placeholder-[#a3a3a3] focus:outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#a3a3a3] hover:text-[#D4AF37] transition-colors">
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { useState } from 'react';
import { Sparkles, Menu } from 'lucide-react';
import { Sidebar } from './components/Sidebar';
import { AIChat } from './components/AIChat';
import { Dashboard } from './views/Dashboard';
import { LiveSession } from './views/LiveSession';
import { Sessions } from './views/Sessions';
import { Wiki } from './views/Wiki';
import { Party } from './views/Party';
import { ViewState } from './types';

export default function App() {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'live': return <LiveSession />;
      case 'sessions': return <Sessions />;
      case 'wiki': return <Wiki />;
      case 'party': return <Party />;
      case 'planning': return <div className="p-8 text-text-muted">Planning view coming soon...</div>;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="flex h-screen bg-background text-text-main overflow-hidden">
      <Sidebar 
        currentView={currentView} 
        onNavigate={setCurrentView} 
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />
      
      <main className="flex-1 relative flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b border-border bg-surface">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 text-text-muted hover:text-text-main"
          >
            <Menu className="w-6 h-6" />
          </button>
          <h1 className="font-serif text-xl font-semibold text-primary tracking-wide">
            MYTHIC
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        <div className="flex-1 overflow-y-auto">
          {renderView()}
        </div>
        
        {/* Global Floating AI Button */}
        {!isAIChatOpen && (
          <button 
            onClick={() => setIsAIChatOpen(true)}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 p-4 bg-primary text-white dark:text-[#0a0a0a] rounded-full shadow-[0_0_20px_rgba(184,134,11,0.3)] dark:shadow-[0_0_30px_rgba(212,175,55,0.3)] hover:scale-105 hover:bg-primary-hover transition-all z-40 flex items-center gap-2 font-medium"
          >
            <Sparkles className="w-5 h-5" />
            <span className="hidden md:inline">Ask Oracle</span>
          </button>
        )}
      </main>

      <AIChat isOpen={isAIChatOpen} onClose={() => setIsAIChatOpen(false)} />
    </div>
  );
}

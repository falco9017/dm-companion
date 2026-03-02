import { 
  LayoutDashboard, 
  Swords, 
  Mic, 
  BookOpen, 
  Users, 
  Map, 
  Settings, 
  LogOut,
  ChevronDown,
  Sun,
  Moon,
  X
} from 'lucide-react';
import { ViewState } from '../types';
import { useTheme } from './ThemeProvider';

interface SidebarProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ currentView, onNavigate, isOpen, onClose }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  
  const navItems: Array<{ id: ViewState; label: string; icon: any; isLive?: boolean }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live', label: 'Live Session', icon: Swords, isLive: true },
    { id: 'sessions', label: 'Sessions & Audio', icon: Mic },
    { id: 'wiki', label: 'Campaign Wiki', icon: BookOpen },
    { id: 'party', label: 'Party & Characters', icon: Users },
    { id: 'planning', label: 'Planning', icon: Map },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={onClose}
        />
      )}
      
      <div className={`fixed md:static inset-y-0 left-0 w-64 bg-surface border-r border-border flex flex-col z-50 transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        {/* Logo & Campaign Selector */}
        <div className="p-6 border-b border-border relative">
          <button 
            onClick={onClose}
            className="absolute top-6 right-4 md:hidden text-text-muted hover:text-text-main"
          >
            <X className="w-5 h-5" />
          </button>
          <h1 className="font-serif text-2xl font-semibold text-primary tracking-wide mb-6">
            MYTHIC
          </h1>
          
          <button className="w-full flex items-center justify-between bg-background border border-border rounded-lg px-3 py-2 hover:border-primary transition-colors">
            <div className="flex flex-col items-start">
              <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">Current Campaign</span>
              <span className="text-sm font-medium text-text-main">Curse of Strahd</span>
            </div>
            <ChevronDown className="w-4 h-4 text-text-muted" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  onClose();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? item.isLive 
                      ? 'bg-red-900/10 text-red-500 border border-red-900/30 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50' 
                      : 'bg-surface-hover text-primary'
                    : 'text-text-muted hover:bg-surface-hover hover:text-text-main'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive && item.isLive ? 'text-red-500 dark:text-red-400' : ''}`} />
                <span className="font-medium text-sm">{item.label}</span>
                {item.isLive && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-border space-y-1">
          <button 
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-main transition-colors"
          >
            {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            <span className="font-medium text-sm">{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-main transition-colors">
            <Settings className="w-5 h-5" />
            <span className="font-medium text-sm">Settings</span>
          </button>
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-text-muted hover:bg-surface-hover hover:text-text-main transition-colors">
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Log Out</span>
          </button>
        </div>
      </div>
    </>
  );
}

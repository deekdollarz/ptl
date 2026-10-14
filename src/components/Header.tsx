import React from 'react';
import { 
  Smartphone, 
  Clock, 
  MessageSquare, 
  ScrollText, 
  Activity, 
  Zap, 
  Plus, 
  Download, 
  Radio, 
  Sparkles, 
  ChevronRight, 
  Flame, 
  Palette 
} from 'lucide-react';
import { TimelineEvent, PhoneStats } from '../types/timeline';
import { HypnoticThemeConfig, HypnoticThemeId, HYPNOTIC_THEMES } from '../types/theme';

interface HeaderProps {
  stats: PhoneStats;
  eventsCount: number;
  onOpenSimulator: () => void;
  onOpenAddModal: () => void;
  onSimulateDay: () => void;
  onExportData: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentTheme?: HypnoticThemeConfig;
  onSelectTheme?: (id: HypnoticThemeId) => void;
  layoutMode?: 'split' | 'timeline' | 'phone';
  setLayoutMode?: (mode: 'split' | 'timeline' | 'phone') => void;
}

export const Header: React.FC<HeaderProps> = ({
  stats,
  eventsCount,
  onOpenSimulator,
  onOpenAddModal,
  onSimulateDay,
  onExportData,
  activeTab,
  setActiveTab,
  currentTheme = HYPNOTIC_THEMES['cyber-neon'],
  onSelectTheme,
}) => {
  const activeTheme = currentTheme || HYPNOTIC_THEMES['cyber-neon'];

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  return (
    <header className="bg-slate-950/95 border-b border-slate-800/80 sticky top-0 z-30 shadow-2xl backdrop-blur-xl">
      {/* Top Banner / Hypnotic Palette Bar & Last App Accessed */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border-b border-slate-800/70 px-4 py-2 text-xs relative overflow-hidden">
        {/* Subtle chromatic streak */}
        <div 
          className="absolute inset-0 opacity-20 pointer-events-none bg-gradient-to-r"
          style={{ backgroundImage: `linear-gradient(to right, ${activeTheme.primaryColor}, ${activeTheme.accentColor})` }}
        />

        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 relative z-10">
          {/* Hypnotic Palette Switcher */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 font-bold uppercase tracking-wider text-[11px] text-white">
              <Palette className="w-3.5 h-3.5" style={{ color: activeTheme.primaryColor }} />
              <span className="hidden sm:inline">Hypnotic Vibe:</span>
            </span>

            <div className="flex items-center gap-1.5 bg-slate-950/90 px-2 py-1 rounded-xl border border-slate-800 shadow-inner">
              {(Object.keys(HYPNOTIC_THEMES) as HypnoticThemeId[]).map((themeKey) => {
                const themeItem = HYPNOTIC_THEMES[themeKey];
                const isSelected = activeTheme.id === themeKey;
                return (
                  <button
                    key={themeKey}
                    onClick={() => onSelectTheme && onSelectTheme(themeKey)}
                    className={`px-2.5 py-0.5 rounded-lg text-[11px] font-semibold transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'text-white shadow-md border'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'rgba(255,255,255,0.1)',
                            borderColor: themeItem.primaryColor,
                            boxShadow: `0 0 14px ${themeItem.primaryColor}66`,
                          }
                        : {}
                    }
                    title={themeItem.subtitle}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                      style={{ backgroundColor: themeItem.primaryColor, boxShadow: `0 0 8px ${themeItem.primaryColor}` }}
                    />
                    <span className="hidden md:inline">{themeItem.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Last App Accessed highlight with pulse indicator */}
          <div 
            className="flex items-center gap-2 bg-slate-950/90 px-3.5 py-1 rounded-full border shadow-inner transition-all"
            style={{ borderColor: `${activeTheme.primaryColor}40` }}
          >
            <span className="text-slate-400 text-[11px] font-medium">Last App:</span>
            <div className="flex items-center gap-1.5">
              <span 
                className="w-2.5 h-2.5 rounded-full inline-block animate-pulse"
                style={{ 
                  backgroundColor: stats.lastAppAccessed.color || activeTheme.primaryColor,
                  boxShadow: `0 0 10px ${stats.lastAppAccessed.color || activeTheme.primaryColor}`
                }}
              />
              <span className="font-bold text-white text-xs">
                {stats.lastAppAccessed.appName}
              </span>
              <span className="text-slate-400 text-[10px]">
                ({stats.lastAppAccessed.category})
              </span>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold border"
                style={{ 
                  backgroundColor: `${activeTheme.primaryColor}20`,
                  color: activeTheme.primaryColor,
                  borderColor: `${activeTheme.primaryColor}50`
                }}
              >
                {stats.lastAppAccessed.activeMinutesAgo === 0 
                  ? 'Just now' 
                  : `${stats.lastAppAccessed.activeMinutesAgo}m ago`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 flex flex-wrap items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xl transition-all duration-500 relative"
            style={{ 
              background: `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.accentColor})`,
              boxShadow: `0 0 24px ${activeTheme.primaryColor}77`
            }}
          >
            <Smartphone className="w-5 h-5 text-white animate-pulse" />
            <div 
              className="absolute -inset-1 rounded-2xl opacity-40 blur-sm pointer-events-none"
              style={{ background: `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.accentColor})` }}
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className={`text-xl font-black tracking-tight bg-gradient-to-r ${activeTheme.accentGradient} bg-clip-text text-transparent`}>
                Phone Timeline
              </h1>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase tracking-wider border shadow-sm flex items-center gap-1"
                style={{
                  backgroundColor: `${activeTheme.primaryColor}25`,
                  color: activeTheme.primaryColor,
                  borderColor: `${activeTheme.primaryColor}55`,
                  boxShadow: `0 0 10px ${activeTheme.primaryColor}33`
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-ping" style={{ backgroundColor: activeTheme.primaryColor }} />
                <span>Active Radar</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">Automatic recording for texts, scrolls & app switch history</p>
          </div>
        </div>

        {/* Action Buttons & Phone Simulator Launcher */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Eye-catching Phone Simulator Trigger */}
          <button
            onClick={onOpenSimulator}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition active:scale-95 shadow-md border hover:scale-105"
            style={{
              backgroundColor: 'rgba(255,255,255,0.06)',
              borderColor: activeTheme.primaryColor,
              color: '#ffffff',
              boxShadow: `0 0 15px ${activeTheme.primaryColor}44`,
            }}
            title="Open Interactive Phone Simulator Deck"
          >
            <Smartphone className="w-3.5 h-3.5" style={{ color: activeTheme.primaryColor }} />
            <span>Interactive Simulator</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl text-xs font-semibold transition active:scale-95 shadow-sm"
          >
            <Plus className="w-3.5 h-3.5 text-white" />
            <span>Log Event</span>
          </button>

          <button
            onClick={onSimulateDay}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black transition active:scale-95 shadow-lg text-slate-950"
            style={{
              background: `linear-gradient(135deg, ${activeTheme.primaryColor}, ${activeTheme.accentColor})`,
              boxShadow: `0 0 18px ${activeTheme.primaryColor}66`
            }}
            title="Populate authentic 24h phone timeline with morning texts, work apps, and social scrolls"
          >
            <Zap className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
            <span className="hidden sm:inline">Simulate Full Day</span>
            <span className="sm:hidden">Day Sim</span>
          </button>

          <button
            onClick={onExportData}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-xl text-xs font-medium transition active:scale-95"
            title="Export Timeline Activities JSON"
          >
            <Download className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Quick Metrics Bar with Hypnotic Neon Accents */}
      <div className="bg-slate-950/80 border-t border-slate-800/80 px-4 py-2.5">
        <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="flex items-center gap-2.5 px-2">
            <div 
              className="p-1.5 rounded-xl border shadow-sm"
              style={{
                backgroundColor: `${activeTheme.primaryColor}15`,
                borderColor: `${activeTheme.primaryColor}40`,
                color: activeTheme.primaryColor,
                boxShadow: `0 0 10px ${activeTheme.primaryColor}22`
              }}
            >
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 leading-none">Total Screen Time</p>
              <p className="text-sm font-black text-white mt-1 font-mono tracking-tight">{formatMinutes(stats.screenTimeMinutes)}</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2">
            <div 
              className="p-1.5 rounded-xl border shadow-sm"
              style={{
                backgroundColor: `${activeTheme.accentColor}15`,
                borderColor: `${activeTheme.accentColor}40`,
                color: activeTheme.accentColor,
                boxShadow: `0 0 10px ${activeTheme.accentColor}22`
              }}
            >
              <ScrollText className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 leading-none">Total Time Scrolled</p>
              <p className="text-sm font-black mt-1 font-mono tracking-tight" style={{ color: activeTheme.accentColor }}>
                {formatMinutes(stats.totalScrollMinutes)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2">
            <div className="p-1.5 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 leading-none">Texts Exchanged</p>
              <p className="text-sm font-black text-emerald-300 mt-1 font-mono">{stats.textsCount} msgs</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2">
            <div className="p-1.5 rounded-xl bg-amber-500/15 text-amber-400 border border-amber-500/30 shadow-sm">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 leading-none">App Switches</p>
              <p className="text-sm font-black text-amber-300 mt-1 font-mono">{stats.appSwitchesCount} times</p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 px-2 col-span-2 sm:col-span-1">
            <div className="p-1.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30 shadow-sm">
              <Flame className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[11px] text-slate-400 leading-none">Doomscroll Index</p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-sm font-black text-rose-400 font-mono">{Math.round(stats.doomscrollRatio * 100)}%</span>
                <span className="text-[10px] text-slate-400">
                  {stats.doomscrollRatio > 0.4 ? 'High Alert' : 'Mindful'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs navigation */}
      <div className="border-t border-slate-800/80 bg-slate-950 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-1.5 overflow-x-auto py-1.5 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'timeline'
                ? activeTheme.activeTabClass
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Timeline Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('scrolls')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'scrolls'
                ? activeTheme.activeTabClass
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5" />
            <span>Scroll Sessions Deep-Dive</span>
          </button>

          <button
            onClick={() => setActiveTab('texts')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'texts'
                ? activeTheme.activeTabClass
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Texts & Messages Log</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'analytics'
                ? activeTheme.activeTabClass
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>App Access & Screen Time</span>
          </button>

          <button
            onClick={() => setActiveTab('chat')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'chat'
                ? activeTheme.activeTabClass
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Gemini Timeline AI</span>
          </button>

          <button
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1.5 rounded-xl font-bold transition whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'images'
                ? activeTheme.activeTabClass
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Visual Memories (1K/2K/4K)</span>
          </button>
        </div>
      </div>
    </header>
  );
};


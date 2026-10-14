import React, { useState, useEffect } from 'react';
import { 
  Zap, 
  Play, 
  Square, 
  Plus, 
  MessageSquare, 
  ScrollText, 
  Smartphone, 
  Sparkles,
  Flame,
  Check
} from 'lucide-react';
import { TimelineEvent } from '../types/timeline';
import { HypnoticThemeConfig } from '../types/theme';

interface StreamlinedRecorderBarProps {
  onAddEvent: (event: TimelineEvent) => void;
  onOpenAddModal: () => void;
  onOpenSimulator: () => void;
  lastAppName: string;
  lightningTheme: 'cyan' | 'amber' | 'violet' | 'emerald';
  setLightningTheme: (theme: 'cyan' | 'amber' | 'violet' | 'emerald') => void;
  lightningActive: boolean;
  setLightningActive: (active: boolean) => void;
  triggerLightningSurge: () => void;
  currentTheme?: HypnoticThemeConfig;
}

export const StreamlinedRecorderBar: React.FC<StreamlinedRecorderBarProps> = ({
  onAddEvent,
  onOpenAddModal,
  onOpenSimulator,
  lastAppName,
  lightningTheme,
  setLightningTheme,
  lightningActive,
  setLightningActive,
  triggerLightningSurge,
  currentTheme,
}) => {
  // Live Timer Recorder state
  const [isRecordingLive, setIsRecordingLive] = useState(false);
  const [liveSeconds, setLiveSeconds] = useState(0);
  const [liveApp, setLiveApp] = useState('Instagram');
  const [liveSection, setLiveSection] = useState('Reels Explore Feed');
  const [liveActionType, setLiveActionType] = useState<'scroll' | 'app'>('scroll');

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecordingLive) {
      interval = setInterval(() => {
        setLiveSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecordingLive]);

  const handleStopLiveRecording = () => {
    if (!isRecordingLive) return;
    const now = new Date();
    const duration = Math.max(liveSeconds, 5);
    const startTime = new Date(now.getTime() - duration * 1000);

    triggerLightningSurge();

    if (liveActionType === 'scroll') {
      onAddEvent({
        id: 'scroll-' + Date.now(),
        type: 'scroll',
        timestamp: now.toISOString(),
        appName: liveApp,
        appColor: liveApp === 'Instagram' ? '#E1306C' : liveApp === 'TikTok' ? '#000000' : '#FF4500',
        category: 'Social',
        sectionName: liveSection,
        startTime: startTime.toISOString(),
        endTime: now.toISOString(),
        durationSeconds: duration,
        scrollDistanceEstimatedPx: duration * 140,
        scrollIntensity: duration > 1200 ? 'doomscroll' : duration > 300 ? 'heavy' : 'moderate',
        itemsBrowsedEstimated: Math.max(Math.round(duration / 4), 1),
        notes: `Recorded with streamlined live activity timer`,
      });
    } else {
      onAddEvent({
        id: 'app-' + Date.now(),
        type: 'app_access',
        timestamp: now.toISOString(),
        appName: liveApp,
        appColor: '#6366f1',
        category: 'Social',
        action: 'opened',
        previousApp: lastAppName,
        durationSeconds: duration,
      });
    }

    setIsRecordingLive(false);
    setLiveSeconds(0);
  };

  const handleQuickScroll = (appName: string, section: string, mins: number, color: string) => {
    const now = new Date();
    const durSec = mins * 60;
    const start = new Date(now.getTime() - durSec * 1000);

    triggerLightningSurge();

    onAddEvent({
      id: 'scroll-' + Date.now(),
      type: 'scroll',
      timestamp: now.toISOString(),
      appName,
      appColor: color,
      category: appName === 'TikTok' ? 'Entertainment' : 'Social',
      sectionName: section,
      startTime: start.toISOString(),
      endTime: now.toISOString(),
      durationSeconds: durSec,
      scrollDistanceEstimatedPx: durSec * 130,
      scrollIntensity: mins >= 20 ? 'doomscroll' : mins >= 10 ? 'heavy' : 'moderate',
      itemsBrowsedEstimated: mins * 12,
      notes: `Quick recorded ${mins}m ${section} session`,
    });
  };

  const handleQuickText = () => {
    const now = new Date();
    triggerLightningSurge();
    onAddEvent({
      id: 'text-' + Date.now(),
      type: 'text',
      timestamp: now.toISOString(),
      appName: 'iMessage',
      appColor: '#34C759',
      category: 'Messaging',
      direction: 'outgoing',
      contact: 'Sarah Miller',
      messageText: 'Just leaving now, see you in 15 mins!',
      messagingPlatform: 'iMessage',
      sentiment: 'casual',
    });
  };

  const formatSecs = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const themePrimary = currentTheme?.primaryColor || '#06b6d4';
  const themeAccent = currentTheme?.accentColor || '#ec4899';

  return (
    <div 
      className="bg-slate-950/80 border border-slate-800/80 hover:border-slate-700/80 rounded-2xl p-4 shadow-2xl backdrop-blur-xl relative overflow-hidden transition-all duration-300"
      style={{
        boxShadow: `0 0 30px -10px ${themePrimary}20`,
      }}
    >
      {/* Subtle background glow */}
      <div 
        className="absolute top-0 right-0 w-96 h-28 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ backgroundColor: themePrimary }}
      />

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 relative z-10">
        {/* Left: Streamlined Quick Activity Recorder */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 mr-2">
            <span 
              className="p-1.5 rounded-xl border flex items-center justify-center shadow-lg"
              style={{
                backgroundColor: `${themePrimary}20`,
                borderColor: `${themePrimary}50`,
                color: themePrimary,
                boxShadow: `0 0 12px ${themePrimary}40`
              }}
            >
              <Zap className="w-4 h-4 fill-current" />
            </span>
            <div>
              <h2 className="text-xs font-black text-white uppercase tracking-wider">Quick Recorder</h2>
              <p className="text-[10px] text-slate-400">1-click activity logging</p>
            </div>
          </div>

          {/* Quick presets */}
          <button
            onClick={() => handleQuickScroll('Instagram', 'Reels Explore Feed', 12, '#E1306C')}
            className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-pink-500/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 shadow-sm hover:shadow-pink-500/20"
            title="Log 12 mins of Instagram Reels scrolling"
          >
            <ScrollText className="w-3.5 h-3.5 text-pink-400" />
            <span>+12m Reels</span>
          </button>

          <button
            onClick={() => handleQuickScroll('TikTok', 'For You Page (FYP)', 25, '#000000')}
            className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-rose-500/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 shadow-sm hover:shadow-rose-500/20"
            title="Log 25 mins of TikTok FYP doomscrolling"
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>+25m TikTok</span>
          </button>

          <button
            onClick={() => handleQuickScroll('Reddit', 'r/technology Hot Threads', 15, '#FF4500')}
            className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-orange-500/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 shadow-sm hover:shadow-orange-500/20"
            title="Log 15 mins of Reddit browsing"
          >
            <ScrollText className="w-3.5 h-3.5 text-orange-400" />
            <span>+15m Reddit</span>
          </button>

          <button
            onClick={handleQuickText}
            className="px-2.5 py-1.5 bg-slate-900/90 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 hover:border-emerald-500/80 rounded-xl text-xs font-semibold transition flex items-center gap-1.5 active:scale-95 shadow-sm hover:shadow-emerald-500/20"
            title="Log an instant text message to Sarah"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>+Text Sarah</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 active:scale-95 border"
            style={{
              backgroundColor: `${themePrimary}15`,
              color: themePrimary,
              borderColor: `${themePrimary}50`,
            }}
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Custom Log</span>
          </button>
        </div>

        {/* Center / Right: Live Recording Timer & Lightning Strip Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Live Activity Stopwatch */}
          <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
            {isRecordingLive ? (
              <div className="flex items-center gap-2 px-2">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
                </span>
                <span className="text-xs font-mono font-bold text-rose-400">{formatSecs(liveSeconds)}</span>
                <span className="text-[10px] text-slate-400">Recording {liveApp}...</span>
                <button
                  onClick={handleStopLiveRecording}
                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1"
                >
                  <Square className="w-3 h-3 fill-white" />
                  <span>Stop & Save</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <select
                  value={liveApp}
                  onChange={(e) => {
                    setLiveApp(e.target.value);
                    if (e.target.value === 'Instagram') setLiveSection('Reels Explore Feed');
                    else if (e.target.value === 'TikTok') setLiveSection('For You Page (FYP)');
                    else if (e.target.value === 'Reddit') setLiveSection('r/technology Feed');
                  }}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Instagram">Instagram</option>
                  <option value="TikTok">TikTok</option>
                  <option value="Reddit">Reddit</option>
                  <option value="Messages">Messages</option>
                  <option value="Spotify">Spotify</option>
                </select>

                <button
                  onClick={() => setIsRecordingLive(true)}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition flex items-center gap-1 shadow-sm active:scale-95"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Start Live Timer</span>
                </button>
              </div>
            )}
          </div>

          {/* Lightning Border Visual Controls */}
          <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1.5 rounded-xl border border-slate-800/80 text-xs">
            <button
              onClick={() => setLightningActive(!lightningActive)}
              className={`flex items-center gap-1 font-semibold text-xs px-2 py-0.5 rounded-md transition ${
                lightningActive 
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40' 
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              title="Toggle lightning strike strip wrapping whole screen border"
            >
              <Zap className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
              <span>Lightning Strip: {lightningActive ? 'ON' : 'OFF'}</span>
            </button>

            {lightningActive && (
              <div className="flex items-center gap-1 border-l border-slate-800 pl-2">
                {(['cyan', 'amber', 'violet', 'emerald'] as const).map((th) => (
                  <button
                    key={th}
                    onClick={() => {
                      setLightningTheme(th);
                      triggerLightningSurge();
                    }}
                    className={`w-3.5 h-3.5 rounded-full border transition ${
                      lightningTheme === th ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                    }`}
                    style={{
                      backgroundColor:
                        th === 'cyan' ? '#38bdf8' : th === 'amber' ? '#fbbf24' : th === 'violet' ? '#c084fc' : '#34d399',
                    }}
                    title={`${th} lightning theme`}
                  />
                ))}

                <button
                  onClick={triggerLightningSurge}
                  className="ml-1 text-[10px] text-sky-300 hover:text-white underline font-mono"
                  title="Fire an instant lightning strike pulse around screen border"
                >
                  Surge!
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

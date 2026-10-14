import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { TimelineStream } from './components/TimelineStream';
import { ScrollAnalytics } from './components/ScrollAnalytics';
import { TextsView } from './components/TextsView';
import { AnalyticsView } from './components/AnalyticsView';
import { GeminiChatbot } from './components/GeminiChatbot';
import { ImageRecapStudio } from './components/ImageRecapStudio';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ManualAddModal } from './components/ManualAddModal';
import { LightningBorder } from './components/LightningBorder';
import { StreamlinedRecorderBar } from './components/StreamlinedRecorderBar';
import { ScreenTimeAlertBanner } from './components/ScreenTimeAlertBanner';
import { INITIAL_TIMELINE_EVENTS, INITIAL_IMAGE_RECAPS } from './data/mockTimeline';
import { TimelineEvent, PhoneStats, AttachedImageRecap } from './types/timeline';
import { HypnoticThemeId, HypnoticThemeConfig, HYPNOTIC_THEMES } from './types/theme';
import { Smartphone, Sparkles, MessageSquare, ScrollText, ArrowUp, Zap, Radio } from 'lucide-react';

export default function App() {
  const [events, setEvents] = useState<TimelineEvent[]>(() => {
    const saved = localStorage.getItem('phone_timeline_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved events:', e);
      }
    }
    return INITIAL_TIMELINE_EVENTS;
  });

  const [imageRecaps, setImageRecaps] = useState<AttachedImageRecap[]>(() => {
    const saved = localStorage.getItem('phone_timeline_image_recaps');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Failed to parse saved image recaps:', e);
      }
    }
    return INITIAL_IMAGE_RECAPS;
  });

  const [activeTab, setActiveTab] = useState<string>('timeline');
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEventForImage, setSelectedEventForImage] = useState<TimelineEvent | null>(null);

  // Hypnotic theme management (Cyber Shock, Cosmic Trance, Acid Emerald, Solar Magma)
  const [themeId, setThemeId] = useState<HypnoticThemeId>(() => {
    const saved = localStorage.getItem('phone_timeline_theme_id');
    if (saved && saved in HYPNOTIC_THEMES) return saved as HypnoticThemeId;
    return 'cyber-neon';
  });

  const currentTheme: HypnoticThemeConfig = useMemo(() => {
    return HYPNOTIC_THEMES[themeId] || HYPNOTIC_THEMES['cyber-neon'];
  }, [themeId]);

  // Lightning strike border states
  const [lightningActive, setLightningActive] = useState<boolean>(true);
  const [lightningTheme, setLightningTheme] = useState<'cyan' | 'amber' | 'violet' | 'emerald'>(
    currentTheme.lightningTheme
  );
  const [isSurging, setIsSurging] = useState<boolean>(false);

  const triggerLightningSurge = useCallback(() => {
    setIsSurging(true);
    setTimeout(() => {
      setIsSurging(false);
    }, 650);
  }, []);

  const handleSelectTheme = (id: HypnoticThemeId) => {
    setThemeId(id);
    localStorage.setItem('phone_timeline_theme_id', id);
    if (HYPNOTIC_THEMES[id]) {
      setLightningTheme(HYPNOTIC_THEMES[id].lightningTheme);
    }
    triggerLightningSurge();
  };

  // User-defined daily screen time alert threshold (in minutes)
  const [screenTimeThresholdMinutes, setScreenTimeThresholdMinutes] = useState<number>(() => {
    const saved = localStorage.getItem('phone_timeline_screen_time_threshold');
    if (saved) {
      const parsed = Number(saved);
      if (!isNaN(parsed) && parsed > 0) return parsed;
    }
    return 180; // default 3 hours
  });

  // Sync threshold to localStorage
  useEffect(() => {
    localStorage.setItem('phone_timeline_screen_time_threshold', String(screenTimeThresholdMinutes));
  }, [screenTimeThresholdMinutes]);

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('phone_timeline_events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('phone_timeline_image_recaps', JSON.stringify(imageRecaps));
  }, [imageRecaps]);

  // Derive phone statistics dynamically
  const stats: PhoneStats = useMemo(() => {
    let totalScrollSec = 0;
    let totalScreenSec = 0;
    let textsCount = 0;
    let appSwitches = 0;
    let doomCount = 0;
    let totalScrollSessions = 0;

    // Sort newest first
    const sorted = [...events].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    // Find the latest accessed app
    const latestAppEvent = sorted.find((e) => e.type === 'app_access' || e.type === 'scroll');

    const lastAppName = latestAppEvent ? latestAppEvent.appName : 'Home Screen';
    const lastAppCat = latestAppEvent ? latestAppEvent.category : 'System';
    const lastAppColor = latestAppEvent?.appColor || currentTheme.primaryColor;
    const lastAppTime = latestAppEvent ? new Date(latestAppEvent.timestamp) : new Date();

    const diffMinutes = Math.max(
      0,
      Math.floor((Date.now() - lastAppTime.getTime()) / (1000 * 60))
    );

    events.forEach((e) => {
      if (e.type === 'scroll') {
        const s = e as any;
        totalScrollSec += s.durationSeconds;
        totalScreenSec += s.durationSeconds;
        totalScrollSessions += 1;
        if (s.scrollIntensity === 'doomscroll' || s.durationSeconds > 1200) {
          doomCount += 1;
        }
      } else if (e.type === 'app_access') {
        const a = e as any;
        totalScreenSec += a.durationSeconds || 180;
        appSwitches += 1;
      } else if (e.type === 'text') {
        textsCount += 1;
        totalScreenSec += 45; // ~45s per text session
      }
    });

    return {
      screenTimeMinutes: Math.round(totalScreenSec / 60),
      totalScrollMinutes: Math.round(totalScrollSec / 60),
      textsCount,
      appSwitchesCount: appSwitches,
      doomscrollRatio: totalScrollSessions > 0 ? doomCount / totalScrollSessions : 0,
      lastAppAccessed: {
        appName: lastAppName,
        category: lastAppCat,
        timestamp: lastAppTime.toISOString(),
        activeMinutesAgo: diffMinutes,
        color: lastAppColor,
      },
    };
  }, [events, currentTheme]);

  const handleAddEvent = (event: TimelineEvent) => {
    setEvents((prev) => [event, ...prev]);
    triggerLightningSurge();
  };

  const handleDeleteEvent = (id: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== id));
  };

  const handleAddImageRecap = (recap: AttachedImageRecap) => {
    setImageRecaps((prev) => [recap, ...prev]);
    triggerLightningSurge();
  };

  const handleDeleteImageRecap = (id: string) => {
    setImageRecaps((prev) => prev.filter((img) => img.id !== id));
  };

  const handleSelectEventForImage = (event: TimelineEvent) => {
    setSelectedEventForImage(event);
    setActiveTab('images');
  };

  const handleSimulateDay = () => {
    setEvents(INITIAL_TIMELINE_EVENTS);
    setImageRecaps(INITIAL_IMAGE_RECAPS);
    triggerLightningSurge();
  };

  const handleTakeBreak = () => {
    handleAddEvent({
      id: 'sys-' + Date.now(),
      type: 'system',
      timestamp: new Date().toISOString(),
      appName: 'System',
      appColor: currentTheme.primaryColor,
      category: 'System',
      action: 'phone_locked',
      details: 'Screen locked for mindful break (Exceeded screen time target)',
    });
  };

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(events, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `phone-timeline-export-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white relative overflow-x-hidden">
      {/* Hypnotic Ambient Radial Glow Orbs in background */}
      <div 
        className="fixed top-12 left-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-35 animate-hypnotic-orb-1 -z-10"
        style={{ backgroundColor: currentTheme.primaryColor }}
      />
      <div 
        className="fixed bottom-12 right-1/4 w-[550px] h-[550px] rounded-full blur-[160px] pointer-events-none opacity-25 animate-hypnotic-orb-2 -z-10"
        style={{ backgroundColor: currentTheme.accentColor }}
      />

      {/* Bright Lightning Strike Border wrapping around the whole screen border */}
      <LightningBorder
        events={events}
        isSurging={isSurging}
        theme={lightningTheme}
        active={lightningActive}
      />

      {/* Header with Hypnotic Vibe Selector, Last App Accessed, and Quick Metrics */}
      <Header
        stats={stats}
        eventsCount={events.length}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onSimulateDay={handleSimulateDay}
        onExportData={handleExportData}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentTheme={currentTheme}
        onSelectTheme={handleSelectTheme}
      />

      {/* Streamlined Panoramic Timeline Command Center */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Screen Time Warning Notification Banner */}
        <ScreenTimeAlertBanner
          currentScreenTimeMinutes={stats.screenTimeMinutes}
          thresholdMinutes={screenTimeThresholdMinutes}
          onUpdateThreshold={setScreenTimeThresholdMinutes}
          totalScrollMinutes={stats.totalScrollMinutes}
          doomscrollRatio={stats.doomscrollRatio}
          onTakeBreak={handleTakeBreak}
          onOpenChat={() => setActiveTab('chat')}
        />

        {/* Streamlined Quick Activity Recorder Bar */}
        <StreamlinedRecorderBar
          onAddEvent={handleAddEvent}
          onOpenAddModal={() => setIsAddModalOpen(true)}
          onOpenSimulator={() => setIsSimulatorOpen(true)}
          lastAppName={stats.lastAppAccessed.appName}
          lightningTheme={lightningTheme}
          setLightningTheme={setLightningTheme}
          lightningActive={lightningActive}
          setLightningActive={setLightningActive}
          triggerLightningSurge={triggerLightningSurge}
          currentTheme={currentTheme}
        />

        {/* Active Tab Workspace - Full Panoramic Layout */}
        <div className="w-full">
          {activeTab === 'timeline' && (
            <TimelineStream
              events={events}
              imageRecaps={imageRecaps}
              onSelectEventForImage={handleSelectEventForImage}
              onDeleteEvent={handleDeleteEvent}
              currentTheme={currentTheme}
            />
          )}

          {activeTab === 'scrolls' && (
            <ScrollAnalytics
              events={events}
              onSelectEventForImage={handleSelectEventForImage}
            />
          )}

          {activeTab === 'texts' && (
            <TextsView
              events={events}
              onSelectEventForImage={handleSelectEventForImage}
              onOpenSimulator={() => setIsSimulatorOpen(true)}
            />
          )}

          {activeTab === 'analytics' && (
            <AnalyticsView
              events={events}
              stats={stats}
              currentTheme={currentTheme}
              targetDailyLimitMinutes={screenTimeThresholdMinutes}
            />
          )}

          {activeTab === 'chat' && (
            <GeminiChatbot
              events={events}
              stats={stats}
            />
          )}

          {activeTab === 'images' && (
            <ImageRecapStudio
              events={events}
              imageRecaps={imageRecaps}
              onAddImageRecap={handleAddImageRecap}
              onDeleteImageRecap={handleDeleteImageRecap}
              selectedEventForImage={selectedEventForImage}
              onClearSelectedEvent={() => setSelectedEventForImage(null)}
            />
          )}
        </div>
      </main>

      {/* Floating Action Pill for Quick Phone Simulator access */}
      <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2">
        <button
          onClick={() => setIsSimulatorOpen(true)}
          className="flex items-center gap-2 px-4 py-3 rounded-full font-bold text-xs sm:text-sm shadow-2xl transition-all hover:scale-105 active:scale-95 border"
          style={{
            background: `linear-gradient(135deg, ${currentTheme.primaryColor}, ${currentTheme.accentColor})`,
            color: '#ffffff',
            boxShadow: `0 0 25px ${currentTheme.primaryColor}88`,
            borderColor: 'rgba(255,255,255,0.3)',
          }}
          title="Open Interactive Phone Simulator Deck"
        >
          <Smartphone className="w-4 h-4 animate-bounce" />
          <span>Interactive Simulator 📱</span>
        </button>
      </div>

      {/* Interactive Phone Simulator Modal (Non-intrusive, opened only when requested) */}
      <PhoneSimulator
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        onAddEvent={handleAddEvent}
        lastAppName={stats.lastAppAccessed.appName}
      />

      {/* Manual Activity Log Modal */}
      <ManualAddModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddEvent={handleAddEvent}
      />

      {/* Hypnotic Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/90 py-6 text-center text-xs text-slate-500 relative">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="flex items-center gap-2 justify-center">
            <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: currentTheme.primaryColor }} />
            <span>Phone Timeline • Automatic recording for texts, scrolls, and app access durations</span>
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <span>Powered by Gemini 3.5 & Gemini 3 Pro</span>
            <span>•</span>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="hover:text-white flex items-center gap-1 transition"
            >
              <span>Back to Top</span>
              <ArrowUp className="w-3 h-3" />
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}

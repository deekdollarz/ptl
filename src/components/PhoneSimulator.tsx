import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Send, 
  ChevronLeft, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  Play, 
  Pause, 
  Flame, 
  Sparkles, 
  Wifi, 
  Battery, 
  Layers, 
  ArrowDown,
  RotateCcw,
  Smartphone,
  Music,
  FileText,
  Volume2,
  Lock,
  Globe,
  Plus
} from 'lucide-react';
import { TimelineEvent, TextEvent, ScrollEvent, AppAccessEvent } from '../types/timeline';

interface PhoneSimulatorProps {
  isOpen?: boolean;
  inline?: boolean;
  onClose?: () => void;
  onAddEvent: (event: TimelineEvent) => void;
  lastAppName: string;
}

type AppId = 'home' | 'instagram' | 'tiktok' | 'messages' | 'whatsapp' | 'reddit' | 'spotify' | 'notes';

export const PhoneSimulator: React.FC<PhoneSimulatorProps> = ({
  isOpen = true,
  inline = false,
  onClose,
  onAddEvent,
  lastAppName,
}) => {
  // Default to interactive Instagram feed rather than plain home screen
  const [currentApp, setCurrentApp] = useState<AppId>('instagram');
  const [activeMessageApp, setActiveMessageApp] = useState<'iMessage' | 'WhatsApp'>('iMessage');
  const [typedMessage, setTypedMessage] = useState('');
  const [isPlayingMusic, setIsPlayingMusic] = useState(true);
  const [likedPosts, setLikedPosts] = useState<Record<number, boolean>>({});

  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'me' | 'them'; text: string; time: string }>>([
    { sender: 'them', text: 'Hey! Are you still free for dinner around 7:30?', time: '7:15 PM' },
    { sender: 'me', text: 'Yeah absolutely, just finishing up work!', time: '7:18 PM' },
    { sender: 'them', text: 'Perfect! See you at the Italian place 🍝', time: '7:20 PM' },
  ]);

  // Real-time scroll detection tracking
  const [isScrolling, setIsScrolling] = useState(false);
  const [scrollSessionSeconds, setScrollSessionSeconds] = useState(0);
  const [scrollPixelDepth, setScrollPixelDepth] = useState(0);
  const scrollTimerRef = useRef<NodeJS.Timeout | null>(null);
  const scrollDebounceRef = useRef<NodeJS.Timeout | null>(null);
  const scrollStartTimeRef = useRef<Date | null>(null);
  const previousAppRef = useRef<string>('Home Screen');

  // Dynamic Island status indicator
  const [islandNotice, setIslandNotice] = useState<string | null>(null);
  const islandTimerRef = useRef<NodeJS.Timeout | null>(null);

  const showIslandNotice = (text: string, durationMs: number = 2200) => {
    setIslandNotice(text);
    if (islandTimerRef.current) clearTimeout(islandTimerRef.current);
    islandTimerRef.current = setTimeout(() => {
      setIslandNotice(null);
    }, durationMs);
  };

  // Clock
  const [timeStr, setTimeStr] = useState('9:41');
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 15000);
    return () => clearInterval(interval);
  }, []);

  // Scroll detection in feeds
  const handleScroll = (e: React.UIEvent<HTMLDivElement>, sectionName: string, appName: string, appColor: string) => {
    const target = e.currentTarget;
    setScrollPixelDepth(Math.round(target.scrollTop));

    if (!isScrolling) {
      setIsScrolling(true);
      scrollStartTimeRef.current = new Date();
      setScrollSessionSeconds(1);

      if (scrollTimerRef.current) clearInterval(scrollTimerRef.current);
      scrollTimerRef.current = setInterval(() => {
        setScrollSessionSeconds((prev) => prev + 1);
      }, 1000);
    }

    // Debounce end of scroll session
    if (scrollDebounceRef.current) clearTimeout(scrollDebounceRef.current);
    scrollDebounceRef.current = setTimeout(() => {
      commitScrollEvent(appName, sectionName, appColor);
    }, 1600);
  };

  const commitScrollEvent = (appName: string, sectionName: string, appColor: string) => {
    if (!scrollStartTimeRef.current) return;
    const endTime = new Date();
    const startTime = scrollStartTimeRef.current;
    const durationSeconds = Math.max(
      Math.round((endTime.getTime() - startTime.getTime()) / 1000),
      scrollSessionSeconds || 3
    );

    const isDoom = durationSeconds > 45 || scrollPixelDepth > 3000;
    const scrollIntensity: ScrollEvent['scrollIntensity'] = isDoom 
      ? 'doomscroll' 
      : durationSeconds > 20 
      ? 'heavy' 
      : durationSeconds > 8 
      ? 'moderate' 
      : 'light';

    const newScrollEvent: ScrollEvent = {
      id: 'scroll-' + Date.now(),
      type: 'scroll',
      timestamp: endTime.toISOString(),
      appName,
      appColor,
      category: appName === 'TikTok' ? 'Entertainment' : 'Social',
      sectionName,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      durationSeconds,
      scrollDistanceEstimatedPx: Math.max(scrollPixelDepth * 2, durationSeconds * 120),
      scrollIntensity,
      itemsBrowsedEstimated: Math.max(Math.round(durationSeconds / 3.5), 1),
      notes: `Recorded in phone simulator while scrolling ${sectionName}`,
    };

    onAddEvent(newScrollEvent);
    showIslandNotice(`Logged ${durationSeconds}s ${appName} scroll ⚡`);

    // Reset scroll state
    setIsScrolling(false);
    setScrollSessionSeconds(0);
    if (scrollTimerRef.current) clearInterval(scrollTimerRef.current);
    scrollStartTimeRef.current = null;
  };

  const openApp = (appId: AppId, appName: string, category: any, color: string) => {
    if (isScrolling) {
      commitScrollEvent(previousAppRef.current, 'Feed Section', '#6366f1');
    }

    const prevApp = previousAppRef.current;
    previousAppRef.current = appName;
    setCurrentApp(appId);

    const appEvent: AppAccessEvent = {
      id: 'app-' + Date.now(),
      type: 'app_access',
      timestamp: new Date().toISOString(),
      appName,
      appColor: color,
      category,
      action: 'opened',
      previousApp: prevApp,
      durationSeconds: 0,
    };
    onAddEvent(appEvent);
    showIslandNotice(`Opened ${appName}`);
  };

  const handleGoHome = () => {
    if (isScrolling) {
      commitScrollEvent(previousAppRef.current, 'Feed Section', '#6366f1');
    }
    const prevApp = previousAppRef.current;
    previousAppRef.current = 'Home Screen';
    setCurrentApp('home');

    onAddEvent({
      id: 'app-' + Date.now(),
      type: 'app_access',
      timestamp: new Date().toISOString(),
      appName: 'Home Screen',
      appColor: '#64748b',
      category: 'System',
      action: 'switched_from',
      previousApp: prevApp,
    });
  };

  const handleSendMessage = () => {
    if (!typedMessage.trim()) return;
    const now = new Date();
    const timeFormatted = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const sentText = typedMessage.trim();
    setChatMessages((prev) => [
      ...prev,
      { sender: 'me', text: sentText, time: timeFormatted },
    ]);

    const textEvt: TextEvent = {
      id: 'text-' + Date.now(),
      type: 'text',
      timestamp: now.toISOString(),
      appName: activeMessageApp === 'iMessage' ? 'Messages' : 'WhatsApp',
      appColor: activeMessageApp === 'iMessage' ? '#34C759' : '#25D366',
      category: 'Messaging',
      direction: 'outgoing',
      contact: 'Sarah Miller',
      messageText: sentText,
      messagingPlatform: activeMessageApp,
      sentiment: 'casual',
    };
    onAddEvent(textEvt);
    setTypedMessage('');
    showIslandNotice(`Sent to Sarah 💬`);

    // Simulated reply
    setTimeout(() => {
      const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      const replies = [
        'Awesome, talk to you soon!',
        'Sounds great, see you there! 😊',
        'Got it! Looking forward to it.',
        'Haha perfect! 🚀',
      ];
      const randomReply = replies[Math.floor(Math.random() * replies.length)];
      setChatMessages((prev) => [
        ...prev,
        { sender: 'them', text: randomReply, time: replyTime },
      ]);
      onAddEvent({
        id: 'text-' + Date.now(),
        type: 'text',
        timestamp: new Date().toISOString(),
        appName: activeMessageApp === 'iMessage' ? 'Messages' : 'WhatsApp',
        appColor: activeMessageApp === 'iMessage' ? '#34C759' : '#25D366',
        category: 'Messaging',
        direction: 'incoming',
        contact: 'Sarah Miller',
        messageText: randomReply,
        messagingPlatform: activeMessageApp,
        sentiment: 'positive',
      });
      showIslandNotice(`New message from Sarah 💬`);
    }, 2400);
  };

  const toggleLike = (id: number) => {
    setLikedPosts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // If used as modal and closed, return null
  if (!inline && !isOpen) return null;

  // The Pure Phone Device Mockup
  const phoneMarkup = (
    <div className="flex flex-col items-center max-w-sm w-full mx-auto">
      {/* Device Toolbar Header */}
      <div className="w-full flex flex-col gap-2 pb-3 px-1 text-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="font-bold text-white tracking-wide">Interactive Phone Simulator</span>
          </div>

          <div className="flex items-center gap-1.5">
            {!inline && onClose && (
              <button
                onClick={onClose}
                className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-1 border border-slate-700 transition"
                title="Close phone simulator"
              >
                <X className="w-3.5 h-3.5" />
                <span>Close</span>
              </button>
            )}
          </div>
        </div>

        {/* Quick App Jump Switcher Bar */}
        <div className="flex items-center gap-1 overflow-x-auto py-1 scrollbar-none text-[11px]">
          <button
            onClick={() => openApp('instagram', 'Instagram', 'Social', '#E1306C')}
            className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 shrink-0 ${
              currentApp === 'instagram'
                ? 'bg-gradient-to-r from-amber-500 via-rose-500 to-purple-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Heart className="w-3 h-3" />
            <span>Instagram</span>
          </button>

          <button
            onClick={() => openApp('tiktok', 'TikTok', 'Entertainment', '#000000')}
            className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 shrink-0 ${
              currentApp === 'tiktok'
                ? 'bg-rose-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>TikTok</span>
          </button>

          <button
            onClick={() => {
              setActiveMessageApp('iMessage');
              openApp('messages', 'Messages', 'Messaging', '#34C759');
            }}
            className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 shrink-0 ${
              currentApp === 'messages'
                ? 'bg-emerald-500 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <MessageCircle className="w-3 h-3" />
            <span>Messages</span>
          </button>

          <button
            onClick={() => {
              setActiveMessageApp('WhatsApp');
              openApp('whatsapp', 'WhatsApp', 'Messaging', '#25D366');
            }}
            className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 shrink-0 ${
              currentApp === 'whatsapp'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <MessageCircle className="w-3 h-3" />
            <span>WhatsApp</span>
          </button>

          <button
            onClick={() => openApp('reddit', 'Reddit', 'Social', '#FF4500')}
            className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 shrink-0 ${
              currentApp === 'reddit'
                ? 'bg-orange-600 text-white shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Layers className="w-3 h-3" />
            <span>Reddit</span>
          </button>

          <button
            onClick={() => openApp('spotify', 'Spotify', 'Entertainment', '#1DB954')}
            className={`px-2 py-0.5 rounded-lg font-bold transition flex items-center gap-1 shrink-0 ${
              currentApp === 'spotify'
                ? 'bg-emerald-500 text-black font-bold shadow-md'
                : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
            }`}
          >
            <Play className="w-3 h-3" />
            <span>Spotify</span>
          </button>

          <button
            onClick={handleGoHome}
            className={`px-2 py-0.5 rounded-lg font-bold transition shrink-0 ${
              currentApp === 'home'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            Home
          </button>
        </div>
      </div>

      {/* Realistic Smartphone Chassis with Hypnotic Glow */}
      <div className="w-[316px] sm:w-[328px] h-[640px] bg-slate-950 rounded-[48px] p-3 shadow-2xl border-[5px] border-slate-700/80 relative flex flex-col justify-between select-none ring-2 ring-cyan-500/30 shadow-[0_0_35px_rgba(0,245,255,0.25)]">
        {/* Dynamic Island Notch */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 min-w-28 max-w-[85%] h-6 bg-black rounded-full z-40 flex items-center justify-center px-3 shadow-md transition-all duration-300">
          {islandNotice ? (
            <span className="text-[10px] font-semibold text-sky-300 truncate animate-in fade-in">
              {islandNotice}
            </span>
          ) : isScrolling ? (
            <div className="flex items-center gap-1.5 text-[10px] text-purple-300 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping" />
              <span>Scrolling {scrollSessionSeconds}s</span>
            </div>
          ) : (
            <div className="w-full flex items-center justify-between">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-900 border border-slate-800" />
              <span className="w-2 h-2 rounded-full bg-indigo-950 border border-indigo-700" />
            </div>
          )}
        </div>

        {/* Status Bar */}
        <div className="pt-1 px-4 flex items-center justify-between text-white text-[11px] font-semibold z-30">
          <span>{timeStr}</span>
          <div className="flex items-center gap-1.5 text-slate-300 text-[10px]">
            <Wifi className="w-3 h-3" />
            <span className="font-bold">5G</span>
            <Battery className="w-3.5 h-3.5 text-white" />
          </div>
        </div>

        {/* Screen Content Container */}
        <div className="flex-1 bg-black rounded-[38px] overflow-hidden flex flex-col relative mt-2 text-white border border-slate-900">
          {/* ================= HOME SCREEN ================= */}
          {currentApp === 'home' && (
            <div className="p-4 flex flex-col h-full justify-between bg-gradient-to-b from-slate-900 via-slate-950 to-black">
              {/* Header Clock Widget */}
              <div className="text-center pt-8">
                <p className="text-5xl font-extralight tracking-tight text-white">{timeStr}</p>
                <p className="text-xs text-indigo-300 font-medium mt-1">Monday, October 6</p>
                <div className="mt-2 inline-flex items-center gap-1 bg-slate-900/80 px-2.5 py-1 rounded-full text-[10px] text-slate-300 border border-slate-800">
                  <span>Last active: <strong className="text-white">{lastAppName}</strong></span>
                </div>
              </div>

              {/* App Icons Grid */}
              <div className="grid grid-cols-4 gap-3 py-6">
                {/* Instagram */}
                <button
                  onClick={() => openApp('instagram', 'Instagram', 'Social', '#E1306C')}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition"
                >
                  <div className="w-13 h-13 rounded-2xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
                    <Heart className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] text-slate-200">Instagram</span>
                </button>

                {/* TikTok */}
                <button
                  onClick={() => openApp('tiktok', 'TikTok', 'Entertainment', '#000000')}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition"
                >
                  <div className="w-13 h-13 rounded-2xl bg-black border border-slate-700 flex items-center justify-center text-rose-500 shadow-lg group-hover:scale-105 transition">
                    <Flame className="w-6 h-6 text-rose-500" />
                  </div>
                  <span className="text-[11px] text-slate-200">TikTok</span>
                </button>

                {/* Messages */}
                <button
                  onClick={() => {
                    setActiveMessageApp('iMessage');
                    openApp('messages', 'Messages', 'Messaging', '#34C759');
                  }}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition"
                >
                  <div className="w-13 h-13 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition relative">
                    <MessageCircle className="w-6 h-6" />
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                      1
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-200">Messages</span>
                </button>

                {/* WhatsApp */}
                <button
                  onClick={() => {
                    setActiveMessageApp('WhatsApp');
                    openApp('whatsapp', 'WhatsApp', 'Messaging', '#25D366');
                  }}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition"
                >
                  <div className="w-13 h-13 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
                    <MessageCircle className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] text-slate-200">WhatsApp</span>
                </button>

                {/* Reddit */}
                <button
                  onClick={() => openApp('reddit', 'Reddit', 'Social', '#FF4500')}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition"
                >
                  <div className="w-13 h-13 rounded-2xl bg-orange-600 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
                    <Layers className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] text-slate-200">Reddit</span>
                </button>

                {/* Spotify */}
                <button
                  onClick={() => openApp('spotify', 'Spotify', 'Entertainment', '#1DB954')}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition"
                >
                  <div className="w-13 h-13 rounded-2xl bg-emerald-500 flex items-center justify-center text-black font-bold shadow-lg group-hover:scale-105 transition">
                    <Play className="w-5 h-5 fill-black" />
                  </div>
                  <span className="text-[11px] text-slate-200">Spotify</span>
                </button>

                {/* Notes */}
                <button
                  onClick={() => openApp('notes', 'Notes', 'Productivity', '#EAB308')}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition"
                >
                  <div className="w-13 h-13 rounded-2xl bg-amber-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
                    <FileText className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] text-slate-200">Notes</span>
                </button>

                {/* Browser */}
                <button
                  onClick={() => openApp('instagram', 'Chrome', 'Browser', '#3B82F6')}
                  className="flex flex-col items-center gap-1 group active:scale-95 transition"
                >
                  <div className="w-13 h-13 rounded-2xl bg-blue-500 flex items-center justify-center text-white shadow-lg group-hover:scale-105 transition">
                    <Globe className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] text-slate-200">Browser</span>
                </button>
              </div>

              {/* Bottom Dock */}
              <div className="bg-slate-800/60 backdrop-blur-md rounded-2xl p-2.5 flex justify-around border border-slate-700/40">
                <button 
                  onClick={() => {
                    setActiveMessageApp('iMessage');
                    openApp('messages', 'Messages', 'Messaging', '#34C759');
                  }}
                  className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-white shadow"
                >
                  <MessageCircle className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => openApp('instagram', 'Instagram', 'Social', '#E1306C')}
                  className="w-11 h-11 rounded-xl bg-gradient-to-tr from-amber-500 to-rose-600 flex items-center justify-center text-white shadow"
                >
                  <Heart className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => openApp('tiktok', 'TikTok', 'Entertainment', '#000000')}
                  className="w-11 h-11 rounded-xl bg-black border border-slate-700 flex items-center justify-center text-rose-500 shadow"
                >
                  <Flame className="w-5 h-5" />
                </button>
                <button 
                  onClick={() => openApp('spotify', 'Spotify', 'Entertainment', '#1DB954')}
                  className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center text-black shadow"
                >
                  <Play className="w-5 h-5 fill-black" />
                </button>
              </div>
            </div>
          )}

          {/* ================= INSTAGRAM APP ================= */}
          {currentApp === 'instagram' && (
            <div className="flex flex-col h-full bg-black">
              <div className="p-2.5 border-b border-slate-800 flex items-center justify-between text-xs bg-slate-950">
                <button onClick={handleGoHome} className="flex items-center gap-1 text-slate-400 hover:text-white">
                  <ChevronLeft className="w-4 h-4" /> Home
                </button>
                <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-rose-500 to-purple-500">
                  Instagram
                </span>
                <span className="text-[10px] text-purple-400 font-mono">
                  {isScrolling ? 'SCROLLING' : 'READY'}
                </span>
              </div>

              {/* Stories strip */}
              <div className="flex gap-2.5 p-2 border-b border-slate-900 overflow-x-auto scrollbar-none">
                {['Your Story', 'alex_wander', 'sarah.m', 'dev_team', 'tokyo_vibes'].map((user, i) => (
                  <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                    <div className="w-10 h-10 rounded-full p-0.5 bg-gradient-to-tr from-amber-400 to-rose-600">
                      <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[9px] font-bold">
                        {user.slice(0, 2).toUpperCase()}
                      </div>
                    </div>
                    <span className="text-[8px] text-slate-400 truncate max-w-10">{user}</span>
                  </div>
                ))}
              </div>

              {/* Scrollable Feed */}
              <div 
                onScroll={(e) => handleScroll(e, 'Reels Explore Feed', 'Instagram', '#E1306C')}
                className="flex-1 overflow-y-auto p-2 space-y-3 scrollbar-thin scrollbar-thumb-slate-700"
              >
                {[1, 2, 3, 4, 5].map((post) => (
                  <div key={post} className="bg-slate-900/90 rounded-2xl overflow-hidden border border-slate-800">
                    <div className="p-2 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <div className="w-5 h-5 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-[9px] font-bold">
                          U{post}
                        </div>
                        <span className="font-medium text-slate-200">wanderlust_explorer_{post}</span>
                      </div>
                      <span className="text-slate-500 text-[10px]">Follow</span>
                    </div>

                    <div className="h-36 bg-gradient-to-br from-indigo-950 via-slate-900 to-purple-950 flex flex-col items-center justify-center text-slate-300 text-xs p-3 text-center">
                      <p className="font-semibold">Kyoto Lantern Festival ✨</p>
                      <span className="text-[10px] text-slate-500 mt-1">Scroll down to log scrolling time</span>
                    </div>

                    <div className="p-2.5">
                      <div className="flex items-center justify-between text-slate-400 mb-1">
                        <div className="flex items-center gap-2.5">
                          <button onClick={() => toggleLike(post)}>
                            <Heart className={`w-4 h-4 transition ${likedPosts[post] ? 'text-rose-500 fill-rose-500' : 'text-slate-300'}`} />
                          </button>
                          <MessageCircle className="w-4 h-4 text-slate-300" />
                          <Share2 className="w-4 h-4 text-slate-300" />
                        </div>
                        <Bookmark className="w-4 h-4 text-slate-300" />
                      </div>
                      <p className="text-[10px] text-slate-300 mt-1">
                        <strong>{post * 1840 + (likedPosts[post] ? 1 : 0)} likes</strong> • Walking through traditional Japanese gardens at dusk 🏮
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TIKTOK APP ================= */}
          {currentApp === 'tiktok' && (
            <div className="flex flex-col h-full bg-black">
              <div className="p-2 border-b border-slate-900 flex items-center justify-between text-xs bg-black z-10">
                <button onClick={handleGoHome} className="flex items-center gap-1 text-slate-400 hover:text-white">
                  <ChevronLeft className="w-4 h-4" /> Home
                </button>
                <div className="flex items-center gap-3 text-xs font-bold">
                  <span className="text-slate-500">Following</span>
                  <span className="text-white border-b-2 border-white pb-0.5">For You</span>
                </div>
                <div className="w-6" />
              </div>

              {/* Full Bleed Video Feed */}
              <div 
                onScroll={(e) => handleScroll(e, 'For You Page (FYP)', 'TikTok', '#000000')}
                className="flex-1 overflow-y-auto space-y-2 p-2 scrollbar-thin scrollbar-thumb-slate-700"
              >
                {[1, 2, 3, 4].map((video) => (
                  <div key={video} className="h-52 bg-gradient-to-t from-black via-slate-950 to-zinc-900 rounded-2xl p-3 flex flex-col justify-between border border-slate-800 relative">
                    <div className="flex justify-between items-center text-[10px] text-slate-400">
                      <span className="font-semibold text-white">@viral_trends_{video}</span>
                      <span className="bg-rose-600 text-white px-1.5 py-0.5 rounded-full text-[9px] font-bold">FYP</span>
                    </div>

                    <div className="text-center text-xs font-semibold text-slate-200">
                      🔥 Daily Routine Hack #{video}: "How smart phone activity logging changes screen time habits"
                    </div>

                    <div className="flex items-end justify-between text-[11px] text-slate-300">
                      <span className="text-[10px] text-slate-400">♫ Viral Sound - Lofi Chill</span>
                      <div className="flex flex-col items-center gap-2">
                        <button onClick={() => toggleLike(100 + video)}>
                          <Heart className={`w-5 h-5 ${likedPosts[100 + video] ? 'fill-rose-500 text-rose-500' : 'text-white'}`} />
                        </button>
                        <span className="text-[9px]">{video * 24}k</span>
                        <MessageCircle className="w-5 h-5 text-white" />
                        <span className="text-[9px]">{video * 4}k</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= MESSAGES & WHATSAPP ================= */}
          {(currentApp === 'messages' || currentApp === 'whatsapp') && (
            <div className="flex flex-col h-full bg-slate-950">
              <div className={`p-2.5 border-b border-slate-800 flex items-center justify-between text-xs ${
                activeMessageApp === 'WhatsApp' ? 'bg-emerald-950/60' : 'bg-slate-900'
              }`}>
                <button onClick={handleGoHome} className="flex items-center gap-1 text-slate-400 hover:text-white">
                  <ChevronLeft className="w-4 h-4" /> Home
                </button>
                <div className="text-center">
                  <p className="font-semibold text-white leading-tight">Sarah Miller</p>
                  <p className="text-[9px] text-emerald-400">Online • {activeMessageApp}</p>
                </div>
                <div className="w-6" />
              </div>

              {/* Chat Thread */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 text-xs">
                {chatMessages.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`flex flex-col ${msg.sender === 'me' ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[82%] rounded-2xl px-3 py-1.5 text-xs ${
                        msg.sender === 'me'
                          ? activeMessageApp === 'WhatsApp'
                            ? 'bg-emerald-600 text-white rounded-br-sm'
                            : 'bg-blue-600 text-white rounded-br-sm'
                          : 'bg-slate-800 text-slate-200 rounded-bl-sm border border-slate-700'
                      }`}
                    >
                      {msg.text}
                    </div>
                    <span className="text-[8px] text-slate-500 mt-0.5 px-1">{msg.time}</span>
                  </div>
                ))}
              </div>

              {/* Quick Reply Chips */}
              <div className="px-2 py-1 flex gap-1 overflow-x-auto border-t border-slate-900 bg-slate-950">
                {['Sounds good!', 'See you soon! 🍕', 'Almost there!'].map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setTypedMessage(chip);
                    }}
                    className="text-[10px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full whitespace-nowrap transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Bar */}
              <div className="p-2 border-t border-slate-800 bg-slate-900 flex items-center gap-1.5">
                <input
                  type="text"
                  value={typedMessage}
                  onChange={(e) => setTypedMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 bg-slate-950 border border-slate-700 rounded-full px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                <button
                  onClick={handleSendMessage}
                  className="p-1.5 rounded-full bg-indigo-600 hover:bg-indigo-500 text-white transition active:scale-95"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* ================= SPOTIFY ================= */}
          {currentApp === 'spotify' && (
            <div className="flex flex-col h-full bg-gradient-to-b from-emerald-950 via-slate-950 to-black p-4 text-center justify-between">
              <div className="flex items-center justify-between text-xs">
                <button onClick={handleGoHome} className="flex items-center gap-1 text-slate-400 hover:text-white">
                  <ChevronLeft className="w-4 h-4" /> Home
                </button>
                <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">Now Playing</span>
                <div className="w-5" />
              </div>

              <div className="my-auto py-4">
                <div className="w-36 h-36 mx-auto rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 shadow-2xl flex items-center justify-center text-slate-950 mb-4 border border-emerald-400/30">
                  <Music className="w-14 h-14 text-slate-950" />
                </div>
                <h3 className="font-bold text-white text-base">Midnight Lofi Sessions</h3>
                <p className="text-xs text-slate-400 mt-1">ChillHop Beats • Daily Focus Mix</p>
              </div>

              <div className="space-y-3">
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-500 h-full w-2/3" />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>2:14</span>
                  <span>3:30</span>
                </div>
                <div className="flex items-center justify-center gap-4">
                  <button 
                    onClick={() => setIsPlayingMusic(!isPlayingMusic)}
                    className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition"
                  >
                    {isPlayingMusic ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ================= REDDIT ================= */}
          {currentApp === 'reddit' && (
            <div className="flex flex-col h-full bg-slate-950">
              <div className="p-2.5 border-b border-slate-800 flex items-center justify-between text-xs bg-orange-950/40">
                <button onClick={handleGoHome} className="flex items-center gap-1 text-slate-400 hover:text-white">
                  <ChevronLeft className="w-4 h-4" /> Home
                </button>
                <span className="font-bold text-orange-400">r/technology</span>
                <span className="text-[10px] text-slate-400">Hot</span>
              </div>

              <div 
                onScroll={(e) => handleScroll(e, 'r/technology Hot Threads', 'Reddit', '#FF4500')}
                className="flex-1 overflow-y-auto p-2 space-y-2 text-xs scrollbar-thin scrollbar-thumb-slate-700"
              >
                {[1, 2, 3, 4].map((thread) => (
                  <div key={thread} className="bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[9px] text-orange-400 font-bold">u/coder_trend_{thread} • 3h ago</span>
                    <h4 className="font-semibold text-slate-100 text-xs mt-1 leading-snug">
                      Phone Timeline: How tracking scroll duration and app switches creates genuine screen time mindfulness
                    </h4>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                      <span>▲ {thread * 420}</span>
                      <span>💬 {thread * 64} comments</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= NOTES ================= */}
          {currentApp === 'notes' && (
            <div className="flex flex-col h-full bg-slate-950">
              <div className="p-2.5 border-b border-slate-800 flex items-center justify-between text-xs bg-amber-950/40">
                <button onClick={handleGoHome} className="flex items-center gap-1 text-slate-400 hover:text-white">
                  <ChevronLeft className="w-4 h-4" /> Home
                </button>
                <span className="font-bold text-amber-400">Quick Notes</span>
                <div className="w-5" />
              </div>

              <div className="flex-1 p-3 space-y-2 text-xs">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <p className="font-bold text-slate-200">Daily Reflection</p>
                  <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                    - Keep social scrolls under 20 mins.<br />
                    - Check messages only after lunch.<br />
                    - Good progress today on digital well-being goals!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Home Indicator Bar */}
          <div 
            onClick={handleGoHome}
            className="w-full py-1.5 flex items-center justify-center cursor-pointer hover:bg-slate-800/40 transition shrink-0"
          >
            <div className="w-28 h-1 bg-slate-500 rounded-full hover:bg-white transition" />
          </div>
        </div>
      </div>
    </div>
  );

  // If inline (embedded in side-by-side split view):
  if (inline) {
    return phoneMarkup;
  }

  // If modal (floating focused drawer/modal):
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 z-50 p-2 rounded-full bg-slate-800 text-slate-300 hover:text-white border border-slate-700 shadow-xl transition"
        >
          <X className="w-5 h-5" />
        </button>
        {phoneMarkup}
      </div>
    </div>
  );
};

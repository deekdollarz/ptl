import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Clock, 
  MessageSquare, 
  ScrollText, 
  Smartphone, 
  Flame, 
  Sparkles, 
  ArrowUpRight, 
  ArrowDownLeft, 
  ShieldAlert, 
  Layers, 
  Calendar,
  ExternalLink,
  ChevronDown,
  Trash2,
  Image as ImageIcon
} from 'lucide-react';
import { TimelineEvent, ScrollEvent, TextEvent, AppAccessEvent, SystemEvent, AttachedImageRecap } from '../types/timeline';
import { HypnoticThemeConfig } from '../types/theme';

interface TimelineStreamProps {
  events: TimelineEvent[];
  imageRecaps: AttachedImageRecap[];
  onSelectEventForImage: (event: TimelineEvent) => void;
  onDeleteEvent: (id: string) => void;
  currentTheme?: HypnoticThemeConfig;
}

export const TimelineStream: React.FC<TimelineStreamProps> = ({
  events,
  imageRecaps,
  onSelectEventForImage,
  onDeleteEvent,
  currentTheme,
}) => {
  const [filterType, setFilterType] = useState<'all' | 'text' | 'scroll' | 'app_access' | 'system'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedApp, setSelectedApp] = useState<string>('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');

  // List of unique apps for filter
  const uniqueApps = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.appName));
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        if (filterType !== 'all' && e.type !== filterType) return false;
        if (selectedApp !== 'all' && e.appName !== selectedApp) return false;
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchApp = e.appName.toLowerCase().includes(q);
          const matchCategory = e.category.toLowerCase().includes(q);
          if (e.type === 'text') {
            const textEvt = e as TextEvent;
            return matchApp || matchCategory || textEvt.contact.toLowerCase().includes(q) || textEvt.messageText.toLowerCase().includes(q);
          }
          if (e.type === 'scroll') {
            const scrollEvt = e as ScrollEvent;
            return matchApp || matchCategory || scrollEvt.sectionName.toLowerCase().includes(q) || (scrollEvt.notes && scrollEvt.notes.toLowerCase().includes(q));
          }
          if (e.type === 'app_access') {
            const appEvt = e as AppAccessEvent;
            return matchApp || matchCategory || (appEvt.previousApp && appEvt.previousApp.toLowerCase().includes(q));
          }
          return matchApp || matchCategory;
        }
        return true;
      })
      .sort((a, b) => {
        const timeA = new Date(a.timestamp).getTime();
        const timeB = new Date(b.timestamp).getTime();
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [events, filterType, selectedApp, searchQuery, sortOrder]);

  const formatDuration = (seconds: number) => {
    if (seconds < 60) return `${seconds}s`;
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (secs === 0) return `${mins}m`;
    return `${mins}m ${secs}s`;
  };

  const formatTime = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoString;
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch {
      return '';
    }
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Controls */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm backdrop-blur space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search texts, app sections scrolled, contacts, keywords..."
              className="w-full bg-slate-950 border border-slate-700/70 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* App Dropdown & Sort */}
          <div className="flex items-center gap-2">
            <select
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="bg-slate-950 border border-slate-700/70 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            >
              <option value="all">All Apps ({uniqueApps.length})</option>
              {uniqueApps.map((app) => (
                <option key={app} value={app}>
                  {app}
                </option>
              ))}
            </select>

            <button
              onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
              className="px-3 py-2 bg-slate-950 border border-slate-700/70 rounded-xl text-xs text-slate-300 hover:text-white transition flex items-center gap-1.5"
            >
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>{sortOrder === 'newest' ? 'Newest First' : 'Oldest First'}</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs scrollbar-none">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              filterType === 'all'
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <span>All Activities</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full">{events.length}</span>
          </button>

          <button
            onClick={() => setFilterType('scroll')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              filterType === 'scroll'
                ? 'bg-purple-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <ScrollText className="w-3.5 h-3.5 text-purple-400" />
            <span>Scroll Sessions</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full">
              {events.filter((e) => e.type === 'scroll').length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('text')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              filterType === 'text'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
            <span>Texts & Messages</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full">
              {events.filter((e) => e.type === 'text').length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('app_access')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              filterType === 'app_access'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5 text-blue-400" />
            <span>App Opens & Switches</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full">
              {events.filter((e) => e.type === 'app_access').length}
            </span>
          </button>

          <button
            onClick={() => setFilterType('system')}
            className={`px-3 py-1.5 rounded-lg font-medium transition flex items-center gap-1.5 ${
              filterType === 'system'
                ? 'bg-slate-600 text-white shadow-sm'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>System & Unlocks</span>
            <span className="text-[10px] bg-black/30 px-1.5 py-0.5 rounded-full">
              {events.filter((e) => e.type === 'system').length}
            </span>
          </button>
        </div>
      </div>

      {/* Empty State */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-16 bg-slate-900/50 rounded-2xl border border-slate-800 p-8">
          <Clock className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No timeline events match your filter</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Try adjusting your search query, or use the Phone Simulator to interact with apps and generate live phone activity.
          </p>
        </div>
      )}

      {/* Main Chronological Timeline Stream */}
      <div className="relative pl-6 md:pl-8 space-y-5 before:content-[''] before:absolute before:left-2.5 md:before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-indigo-500 before:via-purple-500 before:to-slate-800">
        {filteredEvents.map((event) => {
          const matchedImage = imageRecaps.find((img) => img.eventId === event.id);

          return (
            <div 
              key={event.id} 
              className="relative group animate-timeline-enter"
            >
              {/* Timeline spine dot */}
              <div 
                className="absolute -left-6 md:-left-8 top-4 w-5 h-5 rounded-full border-2 border-slate-950 flex items-center justify-center shadow-md transition-transform group-hover:scale-110"
                style={{ backgroundColor: event.appColor || '#6366f1' }}
              >
                {event.type === 'scroll' && <ScrollText className="w-2.5 h-2.5 text-white" />}
                {event.type === 'text' && <MessageSquare className="w-2.5 h-2.5 text-white" />}
                {event.type === 'app_access' && <Smartphone className="w-2.5 h-2.5 text-white" />}
                {event.type === 'system' && <Layers className="w-2.5 h-2.5 text-white" />}
              </div>

              {/* Event Card */}
              <div className="bg-slate-900 border border-slate-800 hover:border-slate-700/80 rounded-2xl p-4 shadow-sm transition-all hover:shadow-md">
                {/* Card Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/60 pb-2.5 mb-3 text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="px-2 py-0.5 rounded-md font-bold text-[11px] text-white flex items-center gap-1 shadow-sm"
                      style={{ backgroundColor: event.appColor || '#4f46e5' }}
                    >
                      {event.appName}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {event.category}
                    </span>
                    {event.type === 'scroll' && (
                      <span className="bg-purple-950/80 text-purple-300 border border-purple-800/40 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <ScrollText className="w-3 h-3 text-purple-400" />
                        Scroll Session
                      </span>
                    )}
                    {event.type === 'text' && (
                      <span className="bg-emerald-950/80 text-emerald-300 border border-emerald-800/40 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <MessageSquare className="w-3 h-3 text-emerald-400" />
                        Text Message
                      </span>
                    )}
                    {event.type === 'app_access' && (
                      <span className="bg-blue-950/80 text-blue-300 border border-blue-800/40 text-[10px] px-2 py-0.5 rounded-full font-medium flex items-center gap-1">
                        <Smartphone className="w-3 h-3 text-blue-400" />
                        App Launch
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 text-slate-400 text-[11px]">
                    <span className="font-mono">{formatDate(event.timestamp)}</span>
                    <span>•</span>
                    <span className="font-mono text-white font-medium">{formatTime(event.timestamp)}</span>
                    <button
                      onClick={() => onDeleteEvent(event.id)}
                      className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete activity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* SCROLL EVENT CARD CONTENT */}
                {event.type === 'scroll' && (() => {
                  const s = event as ScrollEvent;
                  return (
                    <div className="space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <p className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                            App Section Scrolled
                          </p>
                          <h4 className="text-sm font-bold text-white mt-0.5 flex items-center gap-2">
                            <span>{s.sectionName}</span>
                            {s.scrollIntensity === 'doomscroll' && (
                              <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] px-2 py-0.5 rounded-md font-bold flex items-center gap-1">
                                <Flame className="w-3 h-3 text-rose-500" />
                                Doomscroll Loop
                              </span>
                            )}
                          </h4>
                        </div>

                        {/* Exact Duration Badge */}
                        <div className="bg-purple-950/60 border border-purple-800/50 rounded-xl px-3 py-1.5 flex items-center gap-2.5 sm:self-start">
                          <div>
                            <span className="text-[10px] text-purple-300 block leading-tight">Duration Scrolled</span>
                            <span className="text-base font-bold font-mono text-white">
                              {formatDuration(s.durationSeconds)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Time interval & Metrics */}
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Scroll Started</span>
                          <span className="font-mono text-slate-200">{formatTime(s.startTime)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Scroll Ended</span>
                          <span className="font-mono text-slate-200">{formatTime(s.endTime)}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Estimated Distance</span>
                          <span className="font-mono text-purple-300">
                            ~{(s.scrollDistanceEstimatedPx / 1000).toFixed(1)}k px
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Posts / Items Browsed</span>
                          <span className="font-mono text-indigo-300">
                            ~{s.itemsBrowsedEstimated} items
                          </span>
                        </div>
                      </div>

                      {s.notes && (
                        <p className="text-xs text-slate-300 italic bg-slate-950/40 px-3 py-1.5 rounded-lg border border-slate-800/50">
                          "{s.notes}"
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* TEXT EVENT CARD CONTENT */}
                {event.type === 'text' && (() => {
                  const t = event as TextEvent;
                  return (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`p-1.5 rounded-lg ${
                            t.direction === 'outgoing' 
                              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                              : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          }`}>
                            {t.direction === 'outgoing' ? (
                              <ArrowUpRight className="w-4 h-4" />
                            ) : (
                              <ArrowDownLeft className="w-4 h-4" />
                            )}
                          </div>
                          <div>
                            <span className="text-[11px] text-slate-400">
                              {t.direction === 'outgoing' ? 'Texted to' : 'Received from'}:
                            </span>
                            <h4 className="text-sm font-bold text-white leading-tight">
                              {t.contact}
                            </h4>
                          </div>
                        </div>

                        <span className="text-[10px] font-medium bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md border border-slate-700">
                          {t.messagingPlatform}
                        </span>
                      </div>

                      {/* Message Bubble */}
                      <div className={`p-3 rounded-2xl text-xs max-w-lg ${
                        t.direction === 'outgoing'
                          ? 'bg-blue-950/70 border border-blue-800/50 text-blue-100'
                          : 'bg-slate-950 border border-slate-800 text-slate-200'
                      }`}>
                        <p className="leading-relaxed whitespace-pre-wrap">{t.messageText}</p>
                      </div>
                    </div>
                  );
                })()}

                {/* APP ACCESS CARD CONTENT */}
                {event.type === 'app_access' && (() => {
                  const a = event as AppAccessEvent;
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-white font-semibold">
                            {a.action === 'opened' ? 'Launched App:' : 'Switched from:'}
                          </span>
                          <span className="text-indigo-300 font-bold text-sm">
                            {a.appName}
                          </span>
                          {a.previousApp && (
                            <span className="text-slate-400 text-xs">
                              (Previously in {a.previousApp})
                            </span>
                          )}
                        </div>

                        {a.durationSeconds && a.durationSeconds > 0 ? (
                          <span className="text-slate-300 bg-slate-950 px-2 py-0.5 rounded text-[11px] font-mono border border-slate-800">
                            Session: {formatDuration(a.durationSeconds)}
                          </span>
                        ) : null}
                      </div>

                      {a.subScreen && (
                        <p className="text-xs text-slate-400">
                          Viewed screen: <strong className="text-slate-300">{a.subScreen}</strong>
                        </p>
                      )}
                    </div>
                  );
                })()}

                {/* SYSTEM EVENT CARD CONTENT */}
                {event.type === 'system' && (() => {
                  const sys = event as SystemEvent;
                  return (
                    <div className="text-xs text-slate-300 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white">System:</span>
                        <span className="text-indigo-300 font-mono">{sys.action.replace('_', ' ').toUpperCase()}</span>
                        {sys.details && <span className="text-slate-400">— {sys.details}</span>}
                      </div>
                    </div>
                  );
                })()}

                {/* ATTACHED AI IMAGE RECAP (If generated) */}
                {matchedImage && (
                  <div className="mt-3 pt-3 border-t border-slate-800/80">
                    <div className="bg-slate-950 p-2.5 rounded-xl border border-indigo-900/40 flex flex-col sm:flex-row gap-3 items-center">
                      <img
                        src={matchedImage.imageUrl}
                        alt={matchedImage.title}
                        className="w-full sm:w-28 h-20 object-cover rounded-lg border border-slate-800 shadow"
                      />
                      <div className="flex-1 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider bg-pink-950 text-pink-300 px-2 py-0.5 rounded border border-pink-800/40 flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-pink-400" />
                            AI Visual Memory ({matchedImage.imageSize})
                          </span>
                          <span className="text-[10px] text-slate-400">{matchedImage.aspectRatio}</span>
                        </div>
                        <p className="font-medium text-slate-200 mt-1">{matchedImage.title}</p>
                        <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">{matchedImage.prompt}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Actions Footer */}
                <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-500 font-mono">
                    ID: {event.id}
                  </span>

                  <button
                    onClick={() => onSelectEventForImage(event)}
                    className="flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-medium text-xs transition"
                    title="Generate an AI visual memory for this specific moment using gemini-3-pro-image-preview"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                    <span>Create AI Visual Memory</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

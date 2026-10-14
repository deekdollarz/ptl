import React, { useMemo } from 'react';
import { 
  ScrollText, 
  Clock, 
  Flame, 
  TrendingUp, 
  Sparkles, 
  Activity, 
  ArrowRight,
  Filter,
  Layers,
  Info
} from 'lucide-react';
import { TimelineEvent, ScrollEvent } from '../types/timeline';

interface ScrollAnalyticsProps {
  events: TimelineEvent[];
  onSelectEventForImage: (event: TimelineEvent) => void;
}

export const ScrollAnalytics: React.FC<ScrollAnalyticsProps> = ({
  events,
  onSelectEventForImage,
}) => {
  // Extract all scroll events
  const scrollEvents = useMemo(() => {
    return (events.filter((e) => e.type === 'scroll') as ScrollEvent[]).sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [events]);

  // Aggregate metrics
  const { totalSeconds, longestSession, doomscrollCount, sectionBreakdown } = useMemo(() => {
    let totalSec = 0;
    let longest: ScrollEvent | null = null;
    let doomCount = 0;
    const sections: Record<string, { app: string; duration: number; count: number; color: string }> = {};

    scrollEvents.forEach((s) => {
      totalSec += s.durationSeconds;
      if (!longest || s.durationSeconds > longest.durationSeconds) {
        longest = s;
      }
      if (s.scrollIntensity === 'doomscroll' || s.durationSeconds > 1200) {
        doomCount += 1;
      }

      const key = `${s.appName}: ${s.sectionName}`;
      if (!sections[key]) {
        sections[key] = {
          app: s.appName,
          duration: 0,
          count: 0,
          color: s.appColor || '#6366f1',
        };
      }
      sections[key].duration += s.durationSeconds;
      sections[key].count += 1;
    });

    const breakdownArray = Object.entries(sections).map(([title, val]) => ({
      title,
      ...val,
    })).sort((a, b) => b.duration - a.duration);

    return {
      totalSeconds: totalSec,
      longestSession: longest as ScrollEvent | null,
      doomscrollCount: doomCount,
      sectionBreakdown: breakdownArray,
    };
  }, [scrollEvents]);

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
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="space-y-6">
      {/* Intro Header */}
      <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border border-purple-900/50 rounded-2xl p-6 shadow-lg">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                <ScrollText className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-white">Scroll Sessions Deep-Dive</h2>
            </div>
            <p className="text-xs text-slate-300 mt-1 max-w-xl">
              Track which exact app section was scrolled, how long you scrolled at it, and what time the scrolling occurred.
            </p>
          </div>

          <div className="bg-purple-900/40 border border-purple-700/40 rounded-xl px-4 py-2.5 text-right">
            <span className="text-[11px] text-purple-300 block">Total Scrolled Today</span>
            <span className="text-2xl font-black font-mono text-white">
              {formatDuration(totalSeconds)}
            </span>
          </div>
        </div>

        {/* Highlight Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-4 border-t border-purple-900/40 text-xs">
          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Total Scroll Sessions</span>
            <span className="text-base font-bold text-white mt-1 block">
              {scrollEvents.length} recorded sessions
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Longest Continuous Scroll</span>
            <span className="text-base font-bold text-purple-300 mt-1 block">
              {longestSession ? `${formatDuration(longestSession.durationSeconds)} (${longestSession.appName})` : 'None'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
            <span className="text-slate-400 block text-[11px]">Doomscroll Loops (&gt;20m)</span>
            <span className="text-base font-bold text-rose-400 mt-1 block flex items-center gap-1">
              <Flame className="w-4 h-4 text-rose-500" />
              {doomscrollCount} sessions detected
            </span>
          </div>
        </div>
      </div>

      {/* Breakdown by App Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm">
        <h3 className="font-bold text-white text-sm flex items-center gap-2 mb-4">
          <Layers className="w-4 h-4 text-indigo-400" />
          Time Spent by App Section
        </h3>

        <div className="space-y-3">
          {sectionBreakdown.map((item, idx) => {
            const percent = totalSeconds > 0 ? (item.duration / totalSeconds) * 100 : 0;
            return (
              <div key={idx} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full" 
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="font-semibold text-white">{item.title}</span>
                    <span className="text-slate-400 text-[11px]">({item.count} sessions)</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="text-purple-300 font-bold">{formatDuration(item.duration)}</span>
                    <span className="text-slate-500 text-[11px]">({Math.round(percent)}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${percent}%`, 
                      backgroundColor: item.color || '#a855f7' 
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Chronological List of Every Scroll Session */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-400" />
              Scroll Sessions History (Exact Times & Durations)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Verified records of when you scrolled each app section
            </p>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
            {scrollEvents.length} logs
          </span>
        </div>

        <div className="grid grid-cols-1 gap-3">
          {scrollEvents.map((s) => (
            <div 
              key={s.id}
              className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 hover:border-purple-800/50 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span 
                    className="text-xs font-bold px-2 py-0.5 rounded text-white shadow-sm"
                    style={{ backgroundColor: s.appColor || '#8b5cf6' }}
                  >
                    {s.appName}
                  </span>
                  <span className="text-sm font-bold text-white">
                    {s.sectionName}
                  </span>
                  {s.scrollIntensity === 'doomscroll' && (
                    <span className="bg-rose-950 text-rose-300 border border-rose-800/50 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                      <Flame className="w-3 h-3 text-rose-500" />
                      Doomscroll Alert
                    </span>
                  )}
                </div>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    <strong>Time Scrolled:</strong> {formatTime(s.startTime)} → {formatTime(s.endTime)}
                  </span>
                  <span>•</span>
                  <span>
                    Est. {s.itemsBrowsedEstimated} posts browsed
                  </span>
                  <span>•</span>
                  <span>
                    ~{(s.scrollDistanceEstimatedPx / 1000).toFixed(1)}k px distance
                  </span>
                </div>

                {s.notes && (
                  <p className="text-xs text-slate-400 italic">
                    "{s.notes}"
                  </p>
                )}
              </div>

              {/* Duration and Action */}
              <div className="flex items-center gap-3 md:self-center">
                <div className="bg-purple-950/70 border border-purple-800/60 rounded-xl px-4 py-2 text-center min-w-[110px]">
                  <span className="text-[10px] text-purple-300 block leading-tight">Duration</span>
                  <span className="text-base font-bold font-mono text-white">
                    {formatDuration(s.durationSeconds)}
                  </span>
                </div>

                <button
                  onClick={() => onSelectEventForImage(s)}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-pink-400 border border-slate-700 transition"
                  title="Generate an AI visual memory of this scroll session"
                >
                  <Sparkles className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

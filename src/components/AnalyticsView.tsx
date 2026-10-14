import React, { useState, useMemo } from 'react';
import { 
  Clock, 
  Smartphone, 
  TrendingUp, 
  Layers, 
  Flame, 
  Activity, 
  ArrowRight,
  Sparkles,
  BarChart2,
  BarChart3,
  Calendar,
  Grid,
  Zap
} from 'lucide-react';
import { TimelineEvent, PhoneStats, AppAccessEvent, ScrollEvent } from '../types/timeline';
import { HypnoticThemeConfig } from '../types/theme';
import { AnalyticsOverviewBarChart } from './AnalyticsOverviewBarChart';

interface AnalyticsViewProps {
  events: TimelineEvent[];
  stats: PhoneStats;
  currentTheme?: HypnoticThemeConfig;
  targetDailyLimitMinutes?: number;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ 
  events, 
  stats,
  currentTheme,
  targetDailyLimitMinutes = 180,
}) => {
  // Sub-view navigation state: 'overview' (7-day trend bar chart) or 'breakdown' (today app breakdown & loops)
  const [activeSubView, setActiveSubView] = useState<'overview' | 'breakdown'>('overview');

  // Compute screen time per app for today
  const appUsage = useMemo(() => {
    const map: Record<string, { duration: number; opens: number; color: string; category: string }> = {};

    events.forEach((e) => {
      if (!map[e.appName]) {
        map[e.appName] = {
          duration: 0,
          opens: 0,
          color: e.appColor || '#6366f1',
          category: e.category,
        };
      }
      if (e.type === 'app_access') {
        const a = e as AppAccessEvent;
        map[e.appName].opens += 1;
        map[e.appName].duration += a.durationSeconds || 120; // default estimate if 0
      } else if (e.type === 'scroll') {
        const s = e as ScrollEvent;
        map[e.appName].duration += s.durationSeconds;
      }
    });

    const totalSeconds = Object.values(map).reduce((acc, curr) => acc + curr.duration, 0) || 1;

    return Object.entries(map)
      .map(([appName, data]) => ({
        appName,
        minutes: Math.round(data.duration / 60),
        opens: data.opens,
        color: data.color,
        category: data.category,
        percentage: Math.round((data.duration / totalSeconds) * 100),
      }))
      .sort((a, b) => b.minutes - a.minutes);
  }, [events]);

  // Compute common transitions
  const transitions = useMemo(() => {
    const list: Array<{ from: string; to: string; time: string }> = [];
    const appAccessEvents = (events.filter((e) => e.type === 'app_access') as AppAccessEvent[]).sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (let i = 1; i < appAccessEvents.length; i++) {
      const prev = appAccessEvents[i - 1];
      const curr = appAccessEvents[i];
      if (prev.appName !== curr.appName) {
        list.push({
          from: prev.appName,
          to: curr.appName,
          time: new Date(curr.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      }
    }
    return list.slice(-8).reverse();
  }, [events]);

  // Hourly distribution (24 hours)
  const hourlyCounts = useMemo(() => {
    const hours = new Array(24).fill(0);
    events.forEach((e) => {
      const d = new Date(e.timestamp);
      const h = d.getHours();
      hours[h] += 1;
    });
    const maxVal = Math.max(...hours, 1);
    return hours.map((count, hr) => ({
      hour: hr,
      count,
      heightPercent: Math.round((count / maxVal) * 100),
    }));
  }, [events]);

  const primaryGlow = currentTheme?.primaryColor || '#00f5ff';

  return (
    <div className="space-y-6">
      {/* Sub-view switcher bar: 'Overview (7-Day Trends)' vs 'Detailed App Breakdown' */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl p-2.5 sm:px-4 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div 
            className="p-1.5 rounded-xl text-white"
            style={{ backgroundColor: `${primaryGlow}25` }}
          >
            <BarChart2 className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Analytics Views:
          </span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveSubView('overview')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubView === 'overview'
                ? 'bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 text-white shadow-lg shadow-cyan-500/30 border border-cyan-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Overview (7-Day Trends)</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 bg-cyan-950 text-cyan-300 rounded border border-cyan-800/60">
              Bar Chart
            </span>
          </button>

          <button
            onClick={() => setActiveSubView('breakdown')}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition ${
              activeSubView === 'breakdown'
                ? 'bg-gradient-to-r from-purple-500 via-indigo-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 border border-purple-400/40'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>Daily App Breakdown</span>
          </button>
        </div>
      </div>

      {/* Sub-View Content */}
      {activeSubView === 'overview' ? (
        /* The Requested 7-Day Screen Time Trends Bar Chart Sub-view */
        <AnalyticsOverviewBarChart
          events={events}
          currentTheme={currentTheme}
          targetDailyLimitMinutes={targetDailyLimitMinutes}
        />
      ) : (
        /* The Deep Dive App Access & Rhythm Sub-view */
        <div className="space-y-6">
          {/* Hero Stats */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-sm">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400 border border-blue-500/30">
                    <BarChart2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold text-white">App Access & Screen Time</h2>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Visual analytics on last accessed apps, app launches, transitions, and daily rhythm.
                </p>
              </div>

              {/* Last App Accessed Detailed Callout */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-indigo-900/40 flex items-center gap-3">
                <div 
                  className="w-3.5 h-3.5 rounded-full"
                  style={{ backgroundColor: stats.lastAppAccessed.color }}
                />
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase tracking-wider font-semibold">
                    Last App Accessed
                  </span>
                  <p className="text-sm font-bold text-white">
                    {stats.lastAppAccessed.appName}{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      ({stats.lastAppAccessed.category})
                    </span>
                  </p>
                  <span className="text-[11px] text-indigo-300">
                    Active {stats.lastAppAccessed.activeMinutesAgo === 0 ? 'Just now' : `${stats.lastAppAccessed.activeMinutesAgo}m ago`}
                  </span>
                </div>
              </div>
            </div>

            {/* 24-Hour Rhythm Graph */}
            <div className="mt-6">
              <div className="flex items-center justify-between mb-3 text-xs">
                <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  24-Hour Phone Activity Heat Strip
                </span>
                <span className="text-slate-400 text-[11px]">Peak hours highlighted</span>
              </div>

              <div className="h-28 bg-slate-950 p-3 rounded-xl border border-slate-800/80 flex items-end gap-1 sm:gap-2">
                {hourlyCounts.map(({ hour, count, heightPercent }) => (
                  <div key={hour} className="flex-1 flex flex-col items-center gap-1 h-full justify-end group">
                    <div 
                      className={`w-full rounded-t-sm transition-all duration-300 ${
                        count > 4
                          ? 'bg-indigo-500 group-hover:bg-indigo-400'
                          : count > 0
                          ? 'bg-indigo-800/60 group-hover:bg-indigo-600'
                          : 'bg-slate-800/40'
                      }`}
                      style={{ height: `${Math.max(heightPercent, 6)}%` }}
                      title={`${hour}:00 - ${count} activities`}
                    />
                    <span className="text-[9px] text-slate-500 font-mono">
                      {hour % 6 === 0 ? `${hour}h` : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* App Screen Time Leaderboard */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Smartphone className="w-4 h-4 text-purple-400" />
                Top Apps by Usage & Screen Time
              </h3>

              <div className="space-y-3">
                {appUsage.map((app, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span 
                          className="w-2.5 h-2.5 rounded-full" 
                          style={{ backgroundColor: app.color }}
                        />
                        <span className="font-semibold text-white">{app.appName}</span>
                        <span className="text-slate-500 text-[11px]">({app.category})</span>
                      </div>
                      <div className="flex items-center gap-2 font-mono">
                        <span className="font-bold text-slate-200">{app.minutes} mins</span>
                        <span className="text-slate-500 text-[11px]">({app.percentage}%)</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          width: `${app.percentage}%`, 
                          backgroundColor: app.color 
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent App Switches & Habit Loops */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
              <h3 className="font-bold text-white text-sm flex items-center gap-2">
                <Activity className="w-4 h-4 text-emerald-400" />
                App Switch Sequence (Habit Loops)
              </h3>
              <p className="text-xs text-slate-400">
                Detected sequential transitions between apps throughout the day
              </p>

              <div className="space-y-2">
                {transitions.length === 0 ? (
                  <p className="text-xs text-slate-400 italic">No app switches recorded yet.</p>
                ) : (
                  transitions.map((t, idx) => (
                    <div 
                      key={idx}
                      className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-300">{t.from}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                        <span className="font-bold text-white">{t.to}</span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400">{t.time}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

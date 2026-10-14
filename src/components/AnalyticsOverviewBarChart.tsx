import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Flame, 
  Calendar, 
  Smartphone, 
  Sparkles, 
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  Layers
} from 'lucide-react';
import { TimelineEvent, AppAccessEvent, ScrollEvent } from '../types/timeline';
import { HypnoticThemeConfig } from '../types/theme';

export interface DayScreenTimeStat {
  date: string;          // YYYY-MM-DD
  dayLabel: string;      // 'Mon', 'Tue', etc.
  fullDateLabel: string; // 'Oct 9, 2026'
  isToday: boolean;
  isYesterday: boolean;
  totalMinutes: number;
  scrollMinutes: number;
  textMinutes: number;
  appAccessMinutes: number;
  doomscrollCount: number;
  appCount: number;
  topApp: {
    name: string;
    minutes: number;
    color: string;
  } | null;
  appBreakdown: Array<{
    name: string;
    minutes: number;
    color: string;
    category: string;
  }>;
}

interface AnalyticsOverviewBarChartProps {
  events: TimelineEvent[];
  currentTheme?: HypnoticThemeConfig;
  targetDailyLimitMinutes?: number;
  onSelectEventForImage?: (event: TimelineEvent) => void;
}

export const AnalyticsOverviewBarChart: React.FC<AnalyticsOverviewBarChartProps> = ({
  events,
  currentTheme,
  targetDailyLimitMinutes = 180, // Default 3 hours goal
}) => {
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(6); // Default to today (last index)
  const [metricMode, setMetricMode] = useState<'total' | 'scrollOnly' | 'vsTarget'>('total');

  // Compute 7-day trend array ending on today
  const last7DaysData: DayScreenTimeStat[] = useMemo(() => {
    const days: DayScreenTimeStat[] = [];
    const now = new Date();

    // Generate 7 days in chronological order: [6 days ago, ..., today]
    for (let i = 6; i >= 0; i--) {
      const targetDate = new Date(now);
      targetDate.setDate(targetDate.getDate() - i);
      
      const year = targetDate.getFullYear();
      const month = String(targetDate.getMonth() + 1).padStart(2, '0');
      const day = String(targetDate.getDate()).padStart(2, '0');
      const dateKey = `${year}-${month}-${day}`;

      const dayLabel = targetDate.toLocaleDateString(undefined, { weekday: 'short' });
      const fullDateLabel = targetDate.toLocaleDateString(undefined, { 
        month: 'short', 
        day: 'numeric',
        weekday: 'long'
      });

      // Filter events belonging to this calendar date
      const daysEvents = events.filter((e) => {
        try {
          const evDate = new Date(e.timestamp);
          const evYear = evDate.getFullYear();
          const evMonth = String(evDate.getMonth() + 1).padStart(2, '0');
          const evDay = String(evDate.getDate()).padStart(2, '0');
          return `${evYear}-${evMonth}-${evDay}` === dateKey;
        } catch {
          return false;
        }
      });

      let totalSec = 0;
      let scrollSec = 0;
      let textSec = 0;
      let appAccessSec = 0;
      let doomCount = 0;
      const appMap: Record<string, { duration: number; color: string; category: string }> = {};

      daysEvents.forEach((e) => {
        const appName = e.appName || 'Unknown';
        if (!appMap[appName]) {
          appMap[appName] = {
            duration: 0,
            color: e.appColor || '#6366f1',
            category: e.category || 'General',
          };
        }

        if (e.type === 'scroll') {
          const s = e as ScrollEvent;
          const dur = s.durationSeconds || 0;
          totalSec += dur;
          scrollSec += dur;
          appMap[appName].duration += dur;
          if (s.scrollIntensity === 'doomscroll' || dur > 1200) {
            doomCount += 1;
          }
        } else if (e.type === 'app_access') {
          const a = e as AppAccessEvent;
          const dur = a.durationSeconds || 120;
          totalSec += dur;
          appAccessSec += dur;
          appMap[appName].duration += dur;
        } else if (e.type === 'text') {
          totalSec += 45;
          textSec += 45;
          appMap[appName].duration += 45;
        }
      });

      const totalMins = Math.round(totalSec / 60);
      const scrollMins = Math.round(scrollSec / 60);
      const textMins = Math.round(textSec / 60);
      const appAccessMins = Math.round(appAccessSec / 60);

      // Sort app breakdown
      const appBreakdown = Object.entries(appMap)
        .map(([name, val]) => ({
          name,
          minutes: Math.round(val.duration / 60),
          color: val.color,
          category: val.category,
        }))
        .filter((a) => a.minutes > 0)
        .sort((a, b) => b.minutes - a.minutes);

      const topApp = appBreakdown.length > 0 ? appBreakdown[0] : null;

      days.push({
        date: dateKey,
        dayLabel,
        fullDateLabel,
        isToday: i === 0,
        isYesterday: i === 1,
        totalMinutes: totalMins,
        scrollMinutes: scrollMins,
        textMinutes: textMins,
        appAccessMinutes: appAccessMins,
        doomscrollCount: doomCount,
        appCount: appBreakdown.length,
        topApp,
        appBreakdown,
      });
    }

    return days;
  }, [events]);

  // Aggregate stats across 7 days
  const total7DayMinutes = useMemo(() => {
    return last7DaysData.reduce((acc, curr) => acc + curr.totalMinutes, 0);
  }, [last7DaysData]);

  const dailyAverageMinutes = useMemo(() => {
    return Math.round(total7DayMinutes / 7);
  }, [total7DayMinutes]);

  const maxDailyMinutes = useMemo(() => {
    const maxVal = Math.max(...last7DaysData.map((d) => d.totalMinutes), 1);
    // Add breathing room
    return Math.max(maxVal, 240);
  }, [last7DaysData]);

  // Comparison: Today vs 7-day average
  const todayStat = last7DaysData[last7DaysData.length - 1];
  const yesterdayStat = last7DaysData[last7DaysData.length - 2];

  const diffVsAverage = todayStat ? todayStat.totalMinutes - dailyAverageMinutes : 0;
  const percentDiffVsAverage = dailyAverageMinutes > 0 
    ? Math.round((diffVsAverage / dailyAverageMinutes) * 100) 
    : 0;

  const selectedDay = selectedDayIndex !== null ? last7DaysData[selectedDayIndex] : todayStat;

  const formatHoursMins = (mins: number) => {
    if (mins < 60) return `${mins}m`;
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return m > 0 ? `${h}h ${m}m` : `${h}h`;
  };

  const primaryGlow = currentTheme?.primaryColor || '#00f5ff';
  const accentGlow = currentTheme?.accentColor || '#ff007f';

  return (
    <div className="space-y-6">
      {/* 7-Day Header Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Weekly Total */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">7-Day Total Time</span>
            <Calendar className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {formatHoursMins(total7DayMinutes)}
            </span>
            <span className="text-xs text-slate-400">across 7 days</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span className="text-cyan-400 font-bold">{Math.round(total7DayMinutes / 60 * 10) / 10} hours</span>
            <span>total screen logged</span>
          </div>
        </div>

        {/* Daily Average */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Daily Average</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {formatHoursMins(dailyAverageMinutes)}
            </span>
            <span className="text-xs text-slate-400">/ day</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs border-t border-slate-800/80 pt-2.5">
            {diffVsAverage <= 0 ? (
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                {Math.abs(percentDiffVsAverage)}% lower today
              </span>
            ) : (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +{percentDiffVsAverage}% higher today
              </span>
            )}
          </div>
        </div>

        {/* Target Daily Limit Pace */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Daily Goal Target</span>
            {todayStat.totalMinutes <= targetDailyLimitMinutes ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400" />
            )}
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white tracking-tight">
              {formatHoursMins(targetDailyLimitMinutes)}
            </span>
            <span className="text-xs text-slate-400">cap target</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs border-t border-slate-800/80 pt-2.5">
            {todayStat.totalMinutes <= targetDailyLimitMinutes ? (
              <span className="text-emerald-400 font-semibold">
                Within budget ({targetDailyLimitMinutes - todayStat.totalMinutes}m left)
              </span>
            ) : (
              <span className="text-amber-400 font-semibold">
                Exceeded by {todayStat.totalMinutes - targetDailyLimitMinutes}m
              </span>
            )}
          </div>
        </div>

        {/* Heavy Scrolling Sessions */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4.5 relative overflow-hidden backdrop-blur-md">
          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
            <span className="font-semibold uppercase tracking-wider text-[11px]">Doomscroll Loops</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-300 tracking-tight">
              {last7DaysData.reduce((acc, c) => acc + c.doomscrollCount, 0)}
            </span>
            <span className="text-xs text-slate-400">total in 7d</span>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400 border-t border-slate-800/80 pt-2.5">
            <span className="text-slate-300">
              {todayStat.doomscrollCount > 0 ? `${todayStat.doomscrollCount} recorded today` : 'None detected today 🎉'}
            </span>
          </div>
        </div>
      </div>

      {/* Main 7-Day Bar Chart Card */}
      <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Background glow accent */}
        <div 
          className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-[100px] pointer-events-none opacity-20"
          style={{ backgroundColor: primaryGlow }}
        />

        {/* Chart Header & Controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2.5">
              <div 
                className="p-2 rounded-xl text-white shadow-md"
                style={{ backgroundColor: `${primaryGlow}25`, borderColor: `${primaryGlow}50` }}
              >
                <BarChart3 className="w-5 h-5 text-cyan-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  7-Day Screen Time Trend
                  <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-300 border border-cyan-800/60">
                    Last 7 Days
                  </span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Tap or hover any day bar to inspect detailed app screen time and scroll breakdown.
                </p>
              </div>
            </div>
          </div>

          {/* Metric Mode Filter Tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-950/90 border border-slate-800 text-xs">
            <button
              onClick={() => setMetricMode('total')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                metricMode === 'total'
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold shadow-md shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Total Time
            </button>
            <button
              onClick={() => setMetricMode('scrollOnly')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                metricMode === 'scrollOnly'
                  ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold shadow-md shadow-purple-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Scroll Only
            </button>
            <button
              onClick={() => setMetricMode('vsTarget')}
              className={`px-3 py-1.5 rounded-lg font-medium transition ${
                metricMode === 'vsTarget'
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white font-bold shadow-md shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              vs Goal ({formatHoursMins(targetDailyLimitMinutes)})
            </button>
          </div>
        </div>

        {/* The Bar Chart Canvas Area */}
        <div className="relative pt-6 pb-2">
          {/* Target Limit Reference Line */}
          {metricMode !== 'scrollOnly' && (
            <div 
              className="absolute left-0 right-0 border-b-2 border-dashed border-amber-400/50 flex items-center justify-end pr-2 pointer-events-none z-10 transition-all duration-300"
              style={{
                bottom: `${Math.min(92, Math.max(10, Math.round((targetDailyLimitMinutes / maxDailyMinutes) * 100)))}%`
              }}
            >
              <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/90 px-2 py-0.5 rounded-md border border-amber-500/40 shadow-sm translate-y-3">
                Goal Limit: {formatHoursMins(targetDailyLimitMinutes)}
              </span>
            </div>
          )}

          {/* Average Reference Line */}
          <div 
            className="absolute left-0 right-0 border-b border-dashed border-cyan-500/30 flex items-center justify-start pl-2 pointer-events-none z-10"
            style={{
              bottom: `${Math.min(90, Math.max(8, Math.round((dailyAverageMinutes / maxDailyMinutes) * 100)))}%`
            }}
          >
            <span className="text-[10px] font-mono text-cyan-300 bg-slate-950/80 px-2 py-0.5 rounded border border-cyan-500/20 translate-y-3">
              Avg: {formatHoursMins(dailyAverageMinutes)}
            </span>
          </div>

          {/* Bars Grid */}
          <div className="h-64 sm:h-72 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-6 relative z-20">
            {last7DaysData.map((day, idx) => {
              const displayedMinutes = metricMode === 'scrollOnly' ? day.scrollMinutes : day.totalMinutes;
              const barHeightPercent = Math.min(
                100,
                Math.max(8, Math.round((displayedMinutes / maxDailyMinutes) * 100))
              );
              const isSelected = selectedDayIndex === idx;
              const isOverGoal = day.totalMinutes > targetDailyLimitMinutes;

              // Color scheme based on metric mode and limits
              let barGradient = 'from-cyan-500 via-blue-500 to-indigo-600';
              let barGlowColor = 'rgba(6, 182, 212, 0.4)';

              if (metricMode === 'scrollOnly') {
                barGradient = 'from-purple-500 via-fuchsia-500 to-pink-500';
                barGlowColor = 'rgba(168, 85, 247, 0.4)';
              } else if (isOverGoal) {
                barGradient = 'from-amber-400 via-rose-500 to-red-600';
                barGlowColor = 'rgba(244, 63, 94, 0.4)';
              } else if (day.isToday) {
                barGradient = 'from-cyan-400 via-teal-400 to-emerald-500';
                barGlowColor = 'rgba(45, 212, 191, 0.5)';
              }

              return (
                <div
                  key={day.date}
                  onClick={() => setSelectedDayIndex(idx)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Floating Value Pill on hover / select */}
                  <div 
                    className={`text-[11px] font-mono font-bold transition-all duration-200 mb-1.5 px-1.5 py-0.5 rounded text-center whitespace-nowrap ${
                      isSelected
                        ? 'text-white bg-slate-800 border border-slate-700 shadow-md scale-105'
                        : 'text-slate-400 group-hover:text-white group-hover:bg-slate-800/60'
                    }`}
                  >
                    {formatHoursMins(displayedMinutes)}
                  </div>

                  {/* The Bar Pillar */}
                  <div className="w-full max-w-[48px] sm:max-w-[56px] relative flex flex-col justify-end items-center h-full">
                    {/* Ghost background track */}
                    <div className="absolute inset-x-0 bottom-0 top-0 bg-slate-950/60 rounded-2xl border border-slate-800/40 -z-10 group-hover:bg-slate-800/30 transition" />

                    {/* Active Filled Bar */}
                    <div
                      className={`w-full rounded-2xl bg-gradient-to-t ${barGradient} transition-all duration-300 relative overflow-hidden ${
                        isSelected 
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-950 shadow-lg' 
                          : 'group-hover:opacity-95'
                      }`}
                      style={{
                        height: `${barHeightPercent}%`,
                        boxShadow: isSelected ? `0 0 20px ${barGlowColor}` : undefined,
                      }}
                    >
                      {/* Sub-bar fill visualization: Scroll vs App Access */}
                      {metricMode === 'total' && day.scrollMinutes > 0 && (
                        <div 
                          className="absolute inset-x-0 bottom-0 bg-fuchsia-950/40 border-t border-fuchsia-400/40"
                          style={{
                            height: `${Math.round((day.scrollMinutes / (day.totalMinutes || 1)) * 100)}%`
                          }}
                          title={`Scrolled: ${formatHoursMins(day.scrollMinutes)}`}
                        />
                      )}

                      {/* Top shine reflection */}
                      <div className="absolute top-0 inset-x-0 h-1.5 bg-white/40 rounded-t-2xl" />
                    </div>
                  </div>

                  {/* Day Label Bottom */}
                  <div className="mt-3 flex flex-col items-center">
                    <span 
                      className={`text-xs font-semibold tracking-tight transition ${
                        day.isToday 
                          ? 'text-cyan-300 font-bold' 
                          : isSelected 
                          ? 'text-white' 
                          : 'text-slate-400 group-hover:text-slate-200'
                      }`}
                    >
                      {day.isToday ? 'Today' : day.dayLabel}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">
                      {day.date.slice(5)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-6 pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-gradient-to-t from-cyan-500 to-blue-500" />
              <span>Standard screen usage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-gradient-to-t from-amber-400 to-rose-600" />
              <span>Exceeded goal (&gt;{formatHoursMins(targetDailyLimitMinutes)})</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-1.5 rounded-full border border-dashed border-cyan-400" />
              <span>7-day avg ({formatHoursMins(dailyAverageMinutes)})</span>
            </div>
          </div>

          <span className="text-[11px] text-slate-400 font-mono">
            {selectedDay ? `Selected: ${selectedDay.fullDateLabel}` : 'Tap a bar to see day details'}
          </span>
        </div>
      </div>

      {/* Selected Day Deep Dive Panel */}
      {selectedDay && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyan-400" />
                <h4 className="text-base font-bold text-white">
                  {selectedDay.fullDateLabel}
                </h4>
                {selectedDay.isToday && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-700/60 uppercase">
                    Today
                  </span>
                )}
                {selectedDay.isYesterday && (
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                    Yesterday
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Detailed screen duration breakdown and top apps for this date.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-right">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Screen Time</span>
                <span className="text-xl font-black font-mono text-cyan-300">
                  {formatHoursMins(selectedDay.totalMinutes)}
                </span>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-2xl px-4 py-2 text-right">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wider">Scroll Time</span>
                <span className="text-xl font-black font-mono text-purple-300">
                  {formatHoursMins(selectedDay.scrollMinutes)}
                </span>
              </div>
            </div>
          </div>

          {/* Breakdown by app for selected day */}
          <div className="space-y-3">
            <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              Apps Used on {selectedDay.dayLabel} ({selectedDay.appBreakdown.length} apps)
            </h5>

            {selectedDay.appBreakdown.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-slate-950/60 rounded-2xl border border-slate-800/80">
                No active phone usage logs recorded on this day.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedDay.appBreakdown.map((app, i) => {
                  const percentOfTotal = selectedDay.totalMinutes > 0
                    ? Math.round((app.minutes / selectedDay.totalMinutes) * 100)
                    : 0;

                  return (
                    <div 
                      key={i}
                      className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-3.5 hover:border-slate-700 transition space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span 
                            className="w-3 h-3 rounded-full flex-shrink-0"
                            style={{ backgroundColor: app.color }}
                          />
                          <span className="font-bold text-white">{app.name}</span>
                          <span className="text-[11px] text-slate-500">({app.category})</span>
                        </div>
                        <div className="flex items-center gap-2 font-mono">
                          <span className="font-bold text-slate-200">{formatHoursMins(app.minutes)}</span>
                          <span className="text-slate-400 text-[11px]">({percentOfTotal}%)</span>
                        </div>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${percentOfTotal}%`,
                            backgroundColor: app.color,
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

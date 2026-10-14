import React, { useState } from 'react';
import { 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  Flame, 
  X, 
  Sliders, 
  PauseCircle, 
  Sparkles, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  Lock,
  RotateCcw
} from 'lucide-react';

interface ScreenTimeAlertBannerProps {
  currentScreenTimeMinutes: number;
  thresholdMinutes: number;
  onUpdateThreshold: (minutes: number) => void;
  totalScrollMinutes: number;
  doomscrollRatio: number;
  onTakeBreak: () => void;
  onOpenChat: () => void;
}

export const ScreenTimeAlertBanner: React.FC<ScreenTimeAlertBannerProps> = ({
  currentScreenTimeMinutes,
  thresholdMinutes,
  onUpdateThreshold,
  totalScrollMinutes,
  doomscrollRatio,
  onTakeBreak,
  onOpenChat,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [snoozeUntilMinutes, setSnoozeUntilMinutes] = useState<number | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [tempThreshold, setTempThreshold] = useState(thresholdMinutes);

  const isExceeded = currentScreenTimeMinutes >= thresholdMinutes;
  const isSnoozed = snoozeUntilMinutes !== null && currentScreenTimeMinutes < snoozeUntilMinutes;

  const formatMinutes = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = Math.round(mins % 60);
    if (h === 0) return `${m}m`;
    return `${h}h ${m}m`;
  };

  const overMinutes = Math.max(0, currentScreenTimeMinutes - thresholdMinutes);
  const percentUsed = thresholdMinutes > 0 ? Math.round((currentScreenTimeMinutes / thresholdMinutes) * 100) : 100;

  const handleSaveThreshold = (mins: number) => {
    onUpdateThreshold(mins);
    setTempThreshold(mins);
    setIsDismissed(false);
    setSnoozeUntilMinutes(null);
  };

  const handleSnooze = (extraMins: number = 30) => {
    setSnoozeUntilMinutes(currentScreenTimeMinutes + extraMins);
  };

  // Preset thresholds in minutes
  const presetThresholds = [
    { label: '1 hour', value: 60 },
    { label: '1.5 hours', value: 90 },
    { label: '2 hours', value: 120 },
    { label: '2.5 hours', value: 150 },
    { label: '3 hours', value: 180 },
    { label: '4 hours', value: 240 },
  ];

  // If dismissed or snoozed, show a compact unobtrusive reminder pill with an option to restore
  if (isExceeded && (isDismissed || isSnoozed)) {
    return (
      <div className="bg-rose-950/40 border border-rose-800/50 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs shadow-sm backdrop-blur-sm animate-in fade-in">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
          <span className="text-slate-300 font-medium">
            Screen Time Warning: <strong className="text-rose-400">{formatMinutes(currentScreenTimeMinutes)}</strong> recorded (Limit: {formatMinutes(thresholdMinutes)})
          </span>
          {isSnoozed && (
            <span className="text-[10px] bg-slate-900 text-slate-400 px-2 py-0.5 rounded border border-slate-800">
              Snoozed until {formatMinutes(snoozeUntilMinutes || 0)}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsDismissed(false);
              setSnoozeUntilMinutes(null);
            }}
            className="text-xs text-rose-300 hover:text-white underline font-semibold"
          >
            Show Warning Banner
          </button>
          <button
            onClick={() => setIsSettingsOpen(!isSettingsOpen)}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
            title="Adjust Threshold"
          >
            <Sliders className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Inline threshold configuration dropdown */}
        {isSettingsOpen && (
          <div className="w-full mt-2 pt-2 border-t border-rose-900/40 flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-[11px]">Adjust Limit:</span>
            {presetThresholds.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleSaveThreshold(preset.value)}
                className={`px-2 py-0.5 rounded text-[11px] border transition ${
                  thresholdMinutes === preset.value
                    ? 'bg-rose-600 text-white border-rose-500 font-bold'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // When threshold is NOT exceeded, provide a compact threshold indicator bar so users can still see and configure their threshold
  if (!isExceeded) {
    return (
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-indigo-400" />
          <span>
            Daily Screen Time Target: <strong className="text-slate-200">{formatMinutes(thresholdMinutes)}</strong>
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-emerald-400 font-medium">
            {formatMinutes(currentScreenTimeMinutes)} used ({percentUsed}%)
          </span>
        </div>

        <button
          onClick={() => setIsSettingsOpen(!isSettingsOpen)}
          className="flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition px-2 py-1 rounded bg-slate-950 border border-slate-800 hover:border-slate-700"
        >
          <Sliders className="w-3 h-3 text-indigo-400" />
          <span>Set Daily Limit</span>
          {isSettingsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
        </button>

        {isSettingsOpen && (
          <div className="w-full pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2">
            <span className="text-slate-400 text-[11px]">Choose screen time alert threshold:</span>
            {presetThresholds.map((preset) => (
              <button
                key={preset.value}
                onClick={() => handleSaveThreshold(preset.value)}
                className={`px-2.5 py-1 rounded-lg text-xs border transition ${
                  thresholdMinutes === preset.value
                    ? 'bg-indigo-600 text-white border-indigo-500 font-bold shadow-sm'
                    : 'bg-slate-950 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  // --- FULL WARNING BANNER WHEN SCREEN TIME EXCEEDS THRESHOLD ---
  return (
    <div className="relative overflow-hidden bg-gradient-to-r from-rose-950/95 via-red-950/90 to-amber-950/95 border-2 border-rose-500/80 rounded-2xl p-5 shadow-2xl shadow-rose-950/60 backdrop-blur-md animate-in fade-in slide-in-from-top-3 duration-300">
      {/* Background ambient alert aura */}
      <div className="absolute -top-10 -right-10 w-72 h-72 bg-rose-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 space-y-4">
        {/* Banner Top Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center">
              <span className="animate-ping absolute inline-flex h-10 w-10 rounded-xl bg-rose-500 opacity-60"></span>
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 to-red-500 flex items-center justify-center text-white shadow-lg shadow-rose-600/40 border border-rose-400/40">
                <AlertTriangle className="w-5 h-5 text-white stroke-[2.5]" />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-extrabold text-white text-base tracking-tight flex items-center gap-2">
                  <span>Screen Time Limit Exceeded</span>
                  <span className="bg-rose-500/30 text-rose-200 border border-rose-400/50 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    High Usage Alert
                  </span>
                </h3>
              </div>
              <p className="text-xs text-rose-200/90 mt-0.5">
                Current usage is <strong className="text-white">{formatMinutes(currentScreenTimeMinutes)}</strong> vs your defined daily target of <strong className="text-white">{formatMinutes(thresholdMinutes)}</strong> ({formatMinutes(overMinutes)} over limit).
              </p>
            </div>
          </div>

          {/* Quick Controls */}
          <div className="flex items-center gap-2 self-end sm:self-center">
            <button
              onClick={() => setIsSettingsOpen(!isSettingsOpen)}
              className="px-2.5 py-1.5 rounded-lg bg-rose-900/60 hover:bg-rose-900 text-rose-200 border border-rose-700/60 text-xs font-medium transition flex items-center gap-1.5"
              title="Change threshold target"
            >
              <Sliders className="w-3.5 h-3.5 text-rose-300" />
              <span>Change Limit ({formatMinutes(thresholdMinutes)})</span>
              {isSettingsOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900/60 transition"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Visual Progress Bar (Over-limit indicator) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-rose-300 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" /> Usage Progress: {percentUsed}% of daily budget
            </span>
            <span className="font-mono text-white text-xs">
              +{formatMinutes(overMinutes)} overtime
            </span>
          </div>

          <div className="w-full bg-slate-950/80 h-3 rounded-full overflow-hidden border border-rose-900/60 relative p-0.5">
            {/* Base target bar */}
            <div
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-rose-500 to-red-600 shadow-md transition-all duration-500 relative"
              style={{ width: `${Math.min(percentUsed, 100)}%` }}
            />
          </div>
        </div>

        {/* Context Stats Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 bg-black/40 p-3 rounded-xl border border-rose-900/40 text-xs">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-500/20 text-rose-300">
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-rose-300 block">Total Screen Time</span>
              <span className="font-bold text-white font-mono">{formatMinutes(currentScreenTimeMinutes)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-purple-500/20 text-purple-300">
              <Flame className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div>
              <span className="text-[10px] text-rose-300 block">Feed Scrolling Time</span>
              <span className="font-bold text-purple-200 font-mono">
                {formatMinutes(totalScrollMinutes)} ({Math.round(doomscrollRatio * 100)}% doomscroll)
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-300">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="text-[10px] text-rose-300 block">Recommended Action</span>
              <span className="font-bold text-emerald-300">15-Minute Screen Detox</span>
            </div>
          </div>
        </div>

        {/* Action Buttons to Reduce Usage */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onTakeBreak}
              className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-lg shadow-emerald-950/40 border border-emerald-400/30 transition active:scale-95 flex items-center gap-1.5"
              title="Record a phone lock and step away for a break"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Take a Break (Lock Screen)</span>
            </button>

            <button
              onClick={onOpenChat}
              className="px-3.5 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-indigo-300 hover:text-white font-semibold text-xs border border-indigo-500/40 transition active:scale-95 flex items-center gap-1.5"
              title="Ask Gemini Timeline AI for screen time coaching and detox advice"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Ask AI Coach for Detox Plan</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleSnooze(30)}
              className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-rose-200 text-xs font-medium border border-rose-800/40 transition"
              title="Snooze warning for 30 minutes of usage"
            >
              Snooze (+30m)
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="px-3 py-1.5 rounded-lg bg-black/40 hover:bg-black/60 text-slate-400 hover:text-white text-xs transition"
            >
              Dismiss
            </button>
          </div>
        </div>

        {/* Expandable Threshold Configurator */}
        {isSettingsOpen && (
          <div className="mt-3 p-3.5 bg-black/60 rounded-xl border border-rose-800/50 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between">
              <span className="font-bold text-white text-xs flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5 text-rose-400" />
                Configure Daily Screen Time Threshold
              </span>
              <span className="text-[11px] text-rose-300 font-mono">
                Current: {formatMinutes(thresholdMinutes)}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 text-xs">Quick Targets:</span>
              {presetThresholds.map((preset) => (
                <button
                  key={preset.value}
                  onClick={() => handleSaveThreshold(preset.value)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium border transition ${
                    thresholdMinutes === preset.value
                      ? 'bg-rose-600 text-white border-rose-400 font-bold shadow'
                      : 'bg-slate-900 text-slate-300 border-slate-700 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            {/* Custom slider */}
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-[11px] text-slate-400">
                <span>Custom Target (30m to 8h):</span>
                <span className="font-bold text-white font-mono">{formatMinutes(tempThreshold)}</span>
              </div>
              <input
                type="range"
                min={30}
                max={480}
                step={15}
                value={tempThreshold}
                onChange={(e) => setTempThreshold(Number(e.target.value))}
                onMouseUp={() => handleSaveThreshold(tempThreshold)}
                onTouchEnd={() => handleSaveThreshold(tempThreshold)}
                className="w-full accent-rose-500 cursor-pointer"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export type HypnoticThemeId = 'cyber-neon' | 'cosmic-purple' | 'radioactive-lime' | 'solar-flare';

export interface HypnoticThemeConfig {
  id: HypnoticThemeId;
  name: string;
  subtitle: string;
  primaryColor: string;
  accentColor: string;
  secondaryColor: string;
  orbColor1: string;
  orbColor2: string;
  lightningTheme: 'cyan' | 'amber' | 'violet' | 'emerald';
  badgeClass: string;
  accentGradient: string;
  activeTabClass: string;
  buttonGradient: string;
  borderGlow: string;
  textGlowClass: string;
}

export const HYPNOTIC_THEMES: Record<HypnoticThemeId, HypnoticThemeConfig> = {
  'cyber-neon': {
    id: 'cyber-neon',
    name: 'Cyber Shock',
    subtitle: 'Electric Cyan & Shockwave Magenta',
    primaryColor: '#00f5ff',
    accentColor: '#ff007f',
    secondaryColor: '#3b82f6',
    orbColor1: 'rgba(0, 245, 255, 0.35)',
    orbColor2: 'rgba(255, 0, 127, 0.30)',
    lightningTheme: 'cyan',
    badgeClass: 'text-cyan-300 bg-cyan-950/80 border-cyan-400/50 shadow-[0_0_15px_rgba(0,245,255,0.3)]',
    accentGradient: 'from-cyan-400 via-fuchsia-500 to-pink-500',
    activeTabClass: 'bg-gradient-to-r from-cyan-500 via-fuchsia-600 to-pink-600 text-white font-bold shadow-lg shadow-cyan-500/40 border border-cyan-300/40',
    buttonGradient: 'from-cyan-400 via-fuchsia-500 to-pink-500 hover:from-cyan-300 hover:to-pink-400 text-white shadow-lg shadow-cyan-500/40',
    borderGlow: 'rgba(0, 245, 255, 0.4)',
    textGlowClass: 'neon-text-cyan',
  },
  'cosmic-purple': {
    id: 'cosmic-purple',
    name: 'Cosmic Trance',
    subtitle: 'Ultraviolet & Electric Indigo',
    primaryColor: '#c084fc',
    accentColor: '#818cf8',
    secondaryColor: '#f43f5e',
    orbColor1: 'rgba(192, 132, 252, 0.38)',
    orbColor2: 'rgba(129, 140, 248, 0.32)',
    lightningTheme: 'violet',
    badgeClass: 'text-purple-300 bg-purple-950/80 border-purple-400/50 shadow-[0_0_15px_rgba(192,132,252,0.3)]',
    accentGradient: 'from-purple-400 via-indigo-400 to-pink-400',
    activeTabClass: 'bg-gradient-to-r from-purple-600 via-indigo-600 to-pink-600 text-white font-bold shadow-lg shadow-purple-500/40 border border-purple-300/40',
    buttonGradient: 'from-purple-500 via-indigo-600 to-pink-500 hover:from-purple-400 hover:to-indigo-400 text-white shadow-lg shadow-purple-500/40',
    borderGlow: 'rgba(192, 132, 252, 0.4)',
    textGlowClass: 'neon-text-magenta',
  },
  'radioactive-lime': {
    id: 'radioactive-lime',
    name: 'Acid Emerald',
    subtitle: 'Laser Emerald & Toxic Lime',
    primaryColor: '#39ff14',
    accentColor: '#00f5ff',
    secondaryColor: '#10b981',
    orbColor1: 'rgba(57, 255, 20, 0.35)',
    orbColor2: 'rgba(0, 245, 255, 0.28)',
    lightningTheme: 'emerald',
    badgeClass: 'text-emerald-300 bg-emerald-950/80 border-emerald-400/50 shadow-[0_0_15px_rgba(57,255,20,0.3)]',
    accentGradient: 'from-emerald-400 via-teal-300 to-cyan-400',
    activeTabClass: 'bg-gradient-to-r from-emerald-400 via-teal-500 to-cyan-500 text-slate-950 font-black shadow-lg shadow-emerald-500/40 border border-emerald-200/50',
    buttonGradient: 'from-emerald-400 via-teal-400 to-cyan-400 hover:from-emerald-300 hover:to-cyan-300 text-slate-950 font-black shadow-lg shadow-emerald-500/40',
    borderGlow: 'rgba(57, 255, 20, 0.4)',
    textGlowClass: 'neon-text-lime',
  },
  'solar-flare': {
    id: 'solar-flare',
    name: 'Solar Magma',
    subtitle: 'Liquid Gold & Magma Crimson',
    primaryColor: '#ffb703',
    accentColor: '#ff0055',
    secondaryColor: '#fb8500',
    orbColor1: 'rgba(255, 183, 3, 0.36)',
    orbColor2: 'rgba(255, 0, 85, 0.32)',
    lightningTheme: 'amber',
    badgeClass: 'text-amber-300 bg-amber-950/80 border-amber-400/50 shadow-[0_0_15px_rgba(255,183,3,0.3)]',
    accentGradient: 'from-amber-400 via-orange-500 to-rose-500',
    activeTabClass: 'bg-gradient-to-r from-amber-500 via-orange-600 to-rose-600 text-white font-bold shadow-lg shadow-amber-500/40 border border-amber-300/40',
    buttonGradient: 'from-amber-400 via-orange-500 to-rose-600 hover:from-amber-300 hover:to-rose-500 text-white shadow-lg shadow-amber-500/40',
    borderGlow: 'rgba(255, 183, 3, 0.4)',
    textGlowClass: 'neon-text-cyan',
  },
};

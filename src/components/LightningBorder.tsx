import React, { useEffect, useState, useRef } from 'react';
import { TimelineEvent } from '../types/timeline';

interface LightningBorderProps {
  events: TimelineEvent[];
  isSurging?: boolean; // triggers an intense lightning flash on event logging
  theme?: 'cyan' | 'amber' | 'violet' | 'emerald';
  active?: boolean;
}

export const LightningBorder: React.FC<LightningBorderProps> = ({
  events,
  isSurging = false,
  theme = 'cyan',
  active = true,
}) => {
  const [boltKey, setBoltKey] = useState(0);
  const [dimensions, setDimensions] = useState({ width: window.innerWidth, height: window.innerHeight });

  // Update window dimensions on resize
  useEffect(() => {
    const handleResize = () => {
      setDimensions({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Periodic lightning strike crackle update
  useEffect(() => {
    if (!active) return;
    const interval = setInterval(() => {
      setBoltKey((prev) => (prev + 1) % 1000);
    }, 120); // rapid electrical jitter
    return () => clearInterval(interval);
  }, [active]);

  if (!active) return null;

  const { width: w, height: h } = dimensions;
  const pad = 2; // offset from border

  // Color schemes for hypnotic electric lightning
  const colorMap = {
    cyan: {
      primary: '#00f5ff', // laser cyan
      secondary: '#f43f5e', // shockwave magenta
      core: '#ffffff',
      glow: 'rgba(0, 245, 255, 0.95)',
      deepGlow: 'rgba(236, 72, 153, 0.55)',
      dropShadow: 'drop-shadow(0 0 12px rgba(0, 245, 255, 1)) drop-shadow(0 0 24px rgba(236, 72, 153, 0.8))',
    },
    amber: {
      primary: '#ffb703', // solar neon gold
      secondary: '#ff0054', // magma crimson
      core: '#ffffff',
      glow: 'rgba(255, 183, 3, 0.95)',
      deepGlow: 'rgba(255, 0, 84, 0.55)',
      dropShadow: 'drop-shadow(0 0 12px rgba(255, 183, 3, 1)) drop-shadow(0 0 24px rgba(255, 0, 84, 0.8))',
    },
    violet: {
      primary: '#c084fc', // radioactive ultraviolet
      secondary: '#818cf8', // cosmic electric indigo
      core: '#ffffff',
      glow: 'rgba(192, 132, 252, 0.95)',
      deepGlow: 'rgba(99, 102, 241, 0.6)',
      dropShadow: 'drop-shadow(0 0 12px rgba(192, 132, 252, 1)) drop-shadow(0 0 24px rgba(99, 102, 241, 0.8))',
    },
    emerald: {
      primary: '#39ff14', // radioactive laser green
      secondary: '#00f5ff', // electric teal
      core: '#ffffff',
      glow: 'rgba(57, 255, 20, 0.95)',
      deepGlow: 'rgba(0, 245, 255, 0.55)',
      dropShadow: 'drop-shadow(0 0 12px rgba(57, 255, 20, 1)) drop-shadow(0 0 24px rgba(0, 245, 255, 0.8))',
    },
  };

  const colors = colorMap[theme] || colorMap.cyan;

  // Helper to generate a jagged lightning polyline path between two points
  const generateLightningPath = (
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    segments: number = 18,
    roughness: number = 7
  ) => {
    let points = `M ${x1} ${y1}`;
    const dx = (x2 - x1) / segments;
    const dy = (y2 - y1) / segments;

    // Normal vector for jitter
    const len = Math.sqrt(dx * dx + dy * dy) || 1;
    const nx = -dy / len;
    const ny = dx / len;

    for (let i = 1; i < segments; i++) {
      const baseX = x1 + dx * i;
      const baseY = y1 + dy * i;
      // random displacement orthogonal to segment
      const offset = (Math.random() - 0.5) * 2 * roughness;
      const px = baseX + nx * offset;
      const py = baseY + ny * offset;
      points += ` L ${px.toFixed(1)} ${py.toFixed(1)}`;
    }
    points += ` L ${x2} ${y2}`;
    return points;
  };

  // Generate 4 edge lightning paths
  const topBolt = generateLightningPath(pad, pad, w - pad, pad, 26, isSurging ? 12 : 6);
  const rightBolt = generateLightningPath(w - pad, pad, w - pad, h - pad, 20, isSurging ? 12 : 6);
  const bottomBolt = generateLightningPath(w - pad, h - pad, pad, h - pad, 26, isSurging ? 12 : 6);
  const leftBolt = generateLightningPath(pad, h - pad, pad, pad, 20, isSurging ? 12 : 6);

  // Secondary fine crackle branch bolts
  const topSecondary = generateLightningPath(w * 0.2, pad, w * 0.8, pad, 18, isSurging ? 14 : 5);
  const bottomSecondary = generateLightningPath(w * 0.8, h - pad, w * 0.2, h - pad, 18, isSurging ? 14 : 5);

  // Compute event spark markers along perimeter (perimeter length = 2w + 2h)
  // Mapping 24 hours of the day around the whole screen rectangle!
  const totalPerimeter = 2 * (w + h);
  const eventNodes = events.slice(0, 24).map((evt) => {
    try {
      const d = new Date(evt.timestamp);
      const hours = d.getHours() + d.getMinutes() / 60;
      const fraction = hours / 24; // 0 to 1
      const dist = fraction * totalPerimeter;

      let x = 0;
      let y = 0;

      if (dist < w) {
        // Top edge: left to right (0h to 6h approx)
        x = dist;
        y = pad;
      } else if (dist < w + h) {
        // Right edge: top to bottom (6h to 12h approx)
        x = w - pad;
        y = dist - w;
      } else if (dist < 2 * w + h) {
        // Bottom edge: right to left (12h to 18h approx)
        x = w - (dist - (w + h));
        y = h - pad;
      } else {
        // Left edge: bottom to top (18h to 24h approx)
        x = pad;
        y = h - (dist - (2 * w + h));
      }

      return {
        id: evt.id,
        x,
        y,
        type: evt.type,
        color: evt.appColor || colors.primary,
        appName: evt.appName,
      };
    } catch {
      return null;
    }
  }).filter(Boolean);

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden select-none">
      {/* 1. Bright Perimeter Neon Glow Frame */}
      <div 
        className={`absolute inset-0 transition-opacity duration-300 ${
          isSurging ? 'opacity-100 scale-[0.999]' : 'opacity-85'
        }`}
        style={{
          boxShadow: `
            inset 0 0 8px ${colors.core},
            inset 0 0 20px ${colors.glow},
            inset 0 0 45px ${colors.deepGlow},
            0 0 15px ${colors.glow},
            0 0 35px ${colors.deepGlow}
          `,
          border: `2px solid ${isSurging ? colors.core : colors.primary}`,
        }}
      />

      {/* 2. SVG Jagged Lightning Arcs Strip wrapping around whole screen border */}
      <svg
        className="absolute inset-0 w-full h-full"
        style={{ filter: colors.dropShadow }}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="lightning-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Outer thicker lightning aura glow */}
        <g stroke={colors.primary} strokeWidth={isSurging ? 6 : 3.5} fill="none" opacity={isSurging ? 0.95 : 0.75} strokeLinecap="round" strokeLinejoin="round">
          <path d={topBolt} />
          <path d={rightBolt} />
          <path d={bottomBolt} />
          <path d={leftBolt} />
          <path d={topSecondary} opacity={0.5} />
          <path d={bottomSecondary} opacity={0.5} />
        </g>

        {/* Core hot white lightning spark line */}
        <g stroke={colors.core} strokeWidth={isSurging ? 2.5 : 1.5} fill="none" strokeLinecap="round" strokeLinejoin="round">
          <path d={topBolt} />
          <path d={rightBolt} />
          <path d={bottomBolt} />
          <path d={leftBolt} />
          <path d={topSecondary} opacity={0.8} />
          <path d={bottomSecondary} opacity={0.8} />
        </g>

        {/* Electric Corner Plasma Sparks */}
        <circle cx={pad + 3} cy={pad + 3} r={isSurging ? 6 : 3.5} fill={colors.core} filter="url(#lightning-glow)" />
        <circle cx={w - pad - 3} cy={pad + 3} r={isSurging ? 6 : 3.5} fill={colors.core} filter="url(#lightning-glow)" />
        <circle cx={w - pad - 3} cy={h - pad - 3} r={isSurging ? 6 : 3.5} fill={colors.core} filter="url(#lightning-glow)" />
        <circle cx={pad + 3} cy={h - pad - 3} r={isSurging ? 6 : 3.5} fill={colors.core} filter="url(#lightning-glow)" />

        {/* Timeline activity markers positioned around border as 24-hour electric nodes */}
        {eventNodes.map((node: any) => (
          <g key={node.id} transform={`translate(${node.x}, ${node.y})`}>
            {/* Pulsing lightning spark at timeline node */}
            <circle r={isSurging ? 5 : 3.5} fill={node.color} opacity={0.9} />
            <circle r={isSurging ? 2.5 : 1.8} fill="#ffffff" />
          </g>
        ))}
      </svg>

      {/* Surge Flash Ambient Pulse */}
      {isSurging && (
        <div 
          className="absolute inset-0 bg-sky-400/10 pointer-events-none animate-pulse transition-opacity duration-200"
          style={{ backgroundColor: colors.deepGlow }}
        />
      )}
    </div>
  );
};

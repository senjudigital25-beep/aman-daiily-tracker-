import React, { useEffect, useMemo, useState } from 'react';
import { Snowflake } from 'lucide-react';
import { useTheme } from '@/lib/theme';

// A tiny deterministic generator so the decorations keep their positions when
// the page re-renders instead of jumping around.
function makeRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  );
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);
  return reduced;
}

function useSmallScreen() {
  const [small, setSmall] = useState(() => typeof window !== 'undefined' && window.innerWidth < 640);
  useEffect(() => {
    const onResize = () => setSmall(window.innerWidth < 640);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);
  return small;
}

function SnowLayer({ count }) {
  const flakes = useMemo(() => {
    const rnd = makeRandom(17);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      size: 8 + rnd() * 12,
      duration: 9 + rnd() * 9,
      delay: -rnd() * 16,
      drift: (rnd() - 0.5) * 90,
      opacity: 0.18 + rnd() * 0.2
    }));
  }, [count]);

  return flakes.map((f) => (
    <span
      key={f.id}
      className="decor-item snow-fall"
      style={{
        left: `${f.left}%`,
        top: 0,
        opacity: f.opacity,
        '--drift-x': `${f.drift}px`,
        animationDuration: `${f.duration}s`,
        animationDelay: `${f.delay}s`
      }}
    >
      <Snowflake style={{ width: f.size, height: f.size, color: 'var(--decor-ink)' }} />
    </span>
  ));
}

function StarLayer({ count }) {
  const stars = useMemo(() => {
    const rnd = makeRandom(41);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      top: rnd() * 100,
      size: 2 + rnd() * 3,
      duration: 2.4 + rnd() * 3.4,
      delay: -rnd() * 6
    }));
  }, [count]);

  return (
    <>
      {stars.map((s) => (
        <span
          key={s.id}
          className="decor-item star-twinkle rounded-full"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            background: 'var(--decor-ink)',
            animationDuration: `${s.duration}s`,
            animationDelay: `${s.delay}s`
          }}
        />
      ))}
      <span
        className="decor-item shooting-star"
        style={{
          left: '6%',
          top: '12%',
          width: 120,
          height: 2,
          borderRadius: 999,
          background: 'linear-gradient(90deg, transparent, var(--decor-ink))',
          opacity: 0
        }}
      />
    </>
  );
}

function PetalLayer({ count }) {
  const petals = useMemo(() => {
    const rnd = makeRandom(73);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      size: 10 + rnd() * 10,
      duration: 11 + rnd() * 10,
      delay: -rnd() * 20,
      drift: (rnd() - 0.5) * 140,
      opacity: 0.25 + rnd() * 0.3,
      hue: rnd()
    }));
  }, [count]);

  return petals.map((p) => (
    <span
      key={p.id}
      className="decor-item petal-fall"
      style={{
        left: `${p.left}%`,
        top: 0,
        opacity: p.opacity,
        '--drift-x': `${p.drift}px`,
        animationDuration: `${p.duration}s`,
        animationDelay: `${p.delay}s`
      }}
    >
      <svg width={p.size} height={p.size} viewBox="0 0 12 12" aria-hidden="true">
        <path
          d="M6 0.6C8.6 2.6 11 5.2 11 7.6A5 5 0 0 1 1 7.6C1 5.2 3.4 2.6 6 0.6Z"
          fill={p.hue > 0.5 ? '#FFB3D2' : '#FFD9E8'}
        />
      </svg>
    </span>
  ));
}

function ShimmerLayer() {
  return (
    <span
      className="decor-item heat-wave"
      style={{ left: '-10%', bottom: '4%', width: '120%', opacity: 0.3 }}
    >
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" style={{ width: '100%', height: 48 }}>
        <path
          d="M0 30 C100 6, 200 54, 300 30 S500 6, 600 30 S800 54, 900 30 S1100 6, 1200 30"
          fill="none"
          stroke="var(--decor-ink)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}

// Decorative, theme-specific background art. Always behind the content, never
// interactive, and switched off entirely for visitors who prefer less motion.
export default function ThemeBackdrop() {
  const { theme } = useTheme();
  const reduced = usePrefersReducedMotion();
  const small = useSmallScreen();
  const backdrop = theme.backdrop;

  if (reduced || backdrop === 'none') return null;

  return (
    <div className="decor-layer" aria-hidden="true">
      {backdrop === 'snow' && <SnowLayer count={small ? 7 : 14} />}
      {backdrop === 'stars' && <StarLayer count={small ? 12 : 25} />}
      {backdrop === 'petals' && <PetalLayer count={small ? 6 : 12} />}
      {backdrop === 'shimmer' && <ShimmerLayer />}
    </div>
  );
}
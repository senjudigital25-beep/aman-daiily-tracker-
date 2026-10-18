import React, { useMemo } from 'react';
import { Flame, Leaf, TreePine, Snowflake, Sun, Moon, Rocket, Sparkles, Heart, Megaphone } from 'lucide-react';

// The streak icon swaps per theme, keeping its signature motion.
export function StreakIcon({ theme, className = 'h-6 w-6' }) {
  switch (theme.streakIcon) {
    case 'leaf':
      return <Leaf className={`${className} icon-leaf-sway`} />;
    case 'snowflake':
      return <Snowflake className={`${className} icon-snow-spin`} />;
    case 'sun':
      return <Sun className={`${className} icon-sun-glow`} />;
    case 'moon':
      return <Moon className={`${className} icon-moon-sway`} />;
    case 'sparkles':
      return <Sparkles className={`${className} icon-sparkle`} />;
    default:
      return <Flame className={`${className} flame-flicker`} />;
  }
}

// The outreach icon swaps per theme too. Forest renders its tree larger and
// straight into the card corner, so it is handled by ForestOutreach instead.
export function OutreachIcon({ theme, className = 'h-6 w-6' }) {
  switch (theme.outreachIcon) {
    case 'crystal':
      return <Snowflake className={`${className} icon-crystal-shimmer`} />;
    case 'rocket':
      return <Rocket className={`${className} icon-rocket-bob`} />;
    case 'heart':
      return <Heart className={`${className} icon-heart-beat`} />;
    default:
      return <Megaphone className={className} />;
  }
}

// Forest only: a large tree in the outreach card's corner with a few leaves
// drifting out of it. Purely decorative, so it never captures a click.
export function ForestOutreach() {
  const leaves = useMemo(
    () =>
      [0, 1, 2, 3].map((i) => ({
        id: i,
        left: 30 + i * 14,
        delay: -i * 0.9,
        duration: 3.6 + i * 0.4,
        drift: -26 - i * 10,
        rotate: 160 + i * 60
      })),
    []
  );

  return (
    <>
      <div
        className="absolute top-0 right-0 pointer-events-none"
        style={{ color: 'var(--card-ink)', opacity: 0.4 }}
        aria-hidden="true"
      >
        <TreePine className="icon-tree-sway h-16 w-16 sm:h-20 sm:w-20" />
      </div>

      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
        {leaves.map((l) => (
          <span
            key={l.id}
            className="absolute leaf-drift"
            style={{
              left: `${l.left}%`,
              top: '18%',
              color: 'var(--card-ink)',
              opacity: 0.5,
              '--drift-x': `${l.drift}px`,
              '--drift-r': `${l.rotate}deg`,
              animationDuration: `${l.duration}s`,
              animationDelay: `${l.delay}s`
            }}
          >
            <Leaf className="h-3.5 w-3.5" />
          </span>
        ))}
      </div>
    </>
  );
}
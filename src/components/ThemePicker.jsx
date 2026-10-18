import React from 'react';
import { Check, X, Sun, Moon, Trees, Snowflake, SunMedium, Rocket, Flower2 } from 'lucide-react';
import { THEMES } from '@/lib/themes';
import { useTheme } from '@/lib/theme';

export const THEME_ICONS = { Sun, Moon, Trees, Snowflake, SunMedium, Rocket, Flower2 };

// The seven-theme grid. Selecting a card applies the theme straight away and
// hands the choice back so it can be saved to the account.
export default function ThemePicker({ open, onClose, onSelect }) {
  const { themeKey } = useTheme();

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center sm:p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm fade-in" onClick={onClose} />

      <div
        role="dialog"
        aria-label="Choose a theme"
        className="relative w-full sm:max-w-lg bg-surface border border-surface rounded-t-3xl sm:rounded-3xl card-shadow p-5 slide-up max-h-[88vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
            <h2 className="font-heading font-bold text-pri text-lg">Choose a theme</h2>
            <p className="text-sec text-xs mt-0.5">Applies everywhere, instantly.</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close theme picker"
            className="h-11 w-11 -mr-1 rounded-full hover:bg-appAccentSoft flex items-center justify-center text-sec transition-colors shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {THEMES.map((t) => {
            const Icon = THEME_ICONS[t.icon] || Sun;
            const active = t.key === themeKey;
            return (
              <button
                key={t.key}
                onClick={() => onSelect(t.key)}
                aria-pressed={active}
                className={`text-left rounded-2xl p-3 border transition-all min-h-[104px] flex flex-col ${
                  active ? 'border-transparent' : 'border-surface hover:bg-appAccentSoft'
                }`}
                style={{
                  backgroundColor: 'var(--surface)',
                  boxShadow: active ? `0 0 0 2px ${t.accent}` : undefined
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <span
                    className="h-9 w-9 rounded-xl flex items-center justify-center shrink-0"
                    style={{ backgroundColor: t.swatches[1], color: t.accent }}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  {active && (
                    <span
                      className="h-6 w-6 rounded-full flex items-center justify-center shrink-0"
                      style={{ backgroundColor: t.accent }}
                    >
                      <Check className="h-3.5 w-3.5 text-white" />
                    </span>
                  )}
                </div>

                <p className="mt-2 font-heading font-bold text-pri text-sm leading-tight">{t.name}</p>

                <div className="mt-auto pt-2 flex items-center gap-1.5">
                  {t.swatches.map((c) => (
                    <span
                      key={c}
                      className="h-3.5 w-3.5 rounded-full border border-black/10"
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
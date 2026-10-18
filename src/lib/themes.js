// The seven dashboard themes. Each theme owns its palette (declared as CSS
// variables in src/index.css), its light/dark mode, the streak + outreach
// icons used on the stat cards, and the decorative backdrop it renders.
//
// The palette values live in CSS rather than here so the browser can swap them
// with a single attribute change and animate the transition.

export const DEFAULT_THEME = 'classic';
export const DARK_THEME = 'midnight';

export const THEMES = [
  {
    key: 'classic',
    name: 'Classic',
    mode: 'light',
    icon: 'Sun',
    swatches: ['#FAF6EE', '#F6C9D8', '#F4D35E', '#B7E4C7'],
    accent: '#FF6B4A',
    streakIcon: 'flame',
    outreachIcon: 'megaphone',
    backdrop: 'none'
  },
  {
    key: 'midnight',
    name: 'Midnight',
    mode: 'dark',
    icon: 'Moon',
    swatches: ['#1E1B26', '#4A2E38', '#4A3F1E', '#22392C'],
    accent: '#FF8266',
    streakIcon: 'flame',
    outreachIcon: 'megaphone',
    backdrop: 'none'
  },
  {
    key: 'forest',
    name: 'Forest',
    mode: 'light',
    icon: 'Trees',
    swatches: ['#E9F3E6', '#C6E7BC', '#E9E2A8', '#A9D8A0'],
    accent: '#2F7D4A',
    streakIcon: 'leaf',
    outreachIcon: 'tree',
    backdrop: 'none'
  },
  {
    key: 'glacier',
    name: 'Glacier',
    mode: 'light',
    icon: 'Snowflake',
    swatches: ['#EAF6FB', '#C9E9F6', '#DFF4FB', '#B8E2F2'],
    accent: '#2A8CC4',
    streakIcon: 'snowflake',
    outreachIcon: 'crystal',
    backdrop: 'snow'
  },
  {
    key: 'sand',
    name: 'Sand',
    mode: 'light',
    icon: 'SunMedium',
    swatches: ['#FBF3E4', '#F3D9B1', '#F6E6A8', '#E9C9A0'],
    accent: '#C7742B',
    streakIcon: 'sun',
    outreachIcon: 'megaphone',
    backdrop: 'shimmer'
  },
  {
    key: 'space',
    name: 'Space',
    mode: 'dark',
    icon: 'Rocket',
    swatches: ['#0E0B1F', '#2A1F4A', '#3A2C5E', '#23305E'],
    accent: '#A78BFA',
    streakIcon: 'moon',
    outreachIcon: 'rocket',
    backdrop: 'stars'
  },
  {
    key: 'anime',
    name: 'Anime',
    mode: 'light',
    icon: 'Flower2',
    swatches: ['#FFF0F6', '#FFC2DA', '#FFE08A', '#BDE7FF'],
    accent: '#FF4F9A',
    streakIcon: 'sparkles',
    outreachIcon: 'heart',
    backdrop: 'petals'
  }
];

// Accounts saved before the seven-theme picker existed stored a plain
// 'light' / 'dark' value on their profile.
const LEGACY_KEYS = { light: 'classic', dark: 'midnight' };

export function normalizeThemeKey(value) {
  if (!value) return null;
  const key = String(value);
  if (THEMES.some((t) => t.key === key)) return key;
  return LEGACY_KEYS[key] || null;
}

export function themeByKey(key) {
  return THEMES.find((t) => t.key === key) || THEMES[0];
}
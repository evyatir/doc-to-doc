// THEME tokens -> CSS custom properties + Google Fonts loader.
// This file is the token plumbing: the ONLY place in frontend/src/ where default
// color/font values may appear (used only when a client leaves a token blank).
import { THEME } from '@client/config';

const DEFAULTS = {
  band: '#000000',
  paper: '#ffffff',
  ink: '#000000',
  inkOnBand: '#fafafa',
  accent: '#7FB850',
  muted: '#444444',
  focus: '#116DFF',
  green: '',
  greenOnDark: '',
  terracotta: '',
  displayFont: '',
  bodyFont: '',
  accentFont: '',
  commerceRadius: '20px',
  radius: '0px',
  scale: [100, 60, 40, 35, 32, 30, 28, 18, 17, 16, 15],
  motion: { fade: '0.2s ease', recolor: '0.2s ease-in-out' },
};

export const theme = { ...DEFAULTS, ...THEME, motion: { ...DEFAULTS.motion, ...(THEME.motion || {}) } };

const SCALE_NAMES = [
  'hero-xl', 'hero-lg', 'h2', 'logo', 'category-h1', 'newsletter',
  'pdp-h1', 'card-name', 'nav', 'card-price', 'small',
];

// Apple's system font (San Francisco) on Apple devices, each platform's own
// system UI font elsewhere. Nothing is downloaded — it's already installed.
const SYSTEM_UI =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, ' +
  '"Helvetica Neue", Arial, sans-serif';

const fontStack = (name, generic) => (name ? `"${name}", ${generic}` : generic);

export function cssVars() {
  const t = theme;
  const vars = {
    '--band': t.band,
    '--paper': t.paper,
    '--ink': t.ink,
    '--ink-on-band': t.inkOnBand,
    '--accent': t.accent,
    '--muted': t.muted,
    '--focus': t.focus,
    // Optional palette extras: fall back to accent so a client that doesn't
    // define them keeps a working (if monochrome) page.
    '--green': t.green || t.accent,
    '--green-on-dark': t.greenOnDark || t.green || t.accent,
    '--terracotta': t.terracotta || t.accent,
    '--font-display': fontStack(t.displayFont, SYSTEM_UI),
    '--font-body': fontStack(t.bodyFont, SYSTEM_UI),
    '--font-accent': fontStack(t.accentFont || t.displayFont, SYSTEM_UI),
    '--r-commerce': t.commerceRadius,
    '--r': t.radius,
    '--t-fade': t.motion.fade,
    '--t-recolor': t.motion.recolor,
  };
  (t.scale || DEFAULTS.scale).forEach((px, i) => {
    vars[`--fs-${SCALE_NAMES[i]}`] = `${px}px`;
  });
  return vars;
}

// Inject one Google Fonts <link>. Skips blank names entirely.
export function loadFonts() {
  const wanted = [
    [theme.displayFont, 'wght@400;700'],
    [theme.bodyFont, 'wght@400;500'],
    [theme.accentFont, 'wght@400'],
  ].filter(([name]) => name);
  if (!wanted.length) return;
  const families = wanted
    .map(([name, w]) => `family=${name.trim().replace(/ /g, '+')}:${w}`)
    .join('&');
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
  document.head.appendChild(link);
}

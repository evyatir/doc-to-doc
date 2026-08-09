// SVG data-URI placeholder for empty image slots, tinted from THEME.
// A fully blank _template config must still render a coherent site.
import { theme } from './theme.js';

const cache = new Map();

export function placeholder(label = '') {
  const key = label;
  if (cache.has(key)) return cache.get(key);
  const bg = theme.accent;
  const fg = theme.paper;
  const text = (label || 'YOUR PHOTO').slice(0, 28);
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">` +
    `<rect width="900" height="900" fill="${bg}" opacity="0.35"/>` +
    `<rect width="900" height="900" fill="none" stroke="${bg}" stroke-width="6"/>` +
    `<text x="450" y="430" font-family="sans-serif" font-size="44" fill="${fg}" text-anchor="middle">YOUR PHOTO</text>` +
    `<text x="450" y="500" font-family="sans-serif" font-size="30" fill="${fg}" text-anchor="middle" opacity="0.85">${text
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')}</text>` +
    `</svg>`;
  const uri = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
  cache.set(key, uri);
  return uri;
}

export function imgSrc(src, label) {
  return src && String(src).trim() ? src : placeholder(label);
}

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import siteCss from './site.css?inline';
import { css as adminCss } from './styles.js';
import { cssVars, loadFonts } from './theme.js';

// Two stylesheets that must never meet: the public site ships the client's
// compiled stylesheet (site.css, Tailwind preflight included); the internal
// /admin panel keeps the original token-driven one. Pick by path, once.
const isAdmin = window.location.pathname.replace(import.meta.env.BASE_URL, '/').startsWith('/admin');

const style = document.createElement('style');
if (isAdmin) {
  loadFonts();
  style.textContent = adminCss;
  Object.entries(cssVars()).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));
} else {
  style.textContent = siteCss;
}
document.head.appendChild(style);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

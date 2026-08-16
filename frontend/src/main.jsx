import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import { css } from './styles.js';
import { cssVars, loadFonts } from './theme.js';

loadFonts();

const style = document.createElement('style');
style.textContent = css;
document.head.appendChild(style);

const rootVars = cssVars();
Object.entries(rootVars).forEach(([k, v]) => document.documentElement.style.setProperty(k, v));

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

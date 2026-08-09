import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// Active client folder. `CLIENT=name npm run dev` (POSIX) or
// `$env:CLIENT='name'; npm run dev` (PowerShell). Defaults to doc-to-doc —
// this repo is the Doc. to Doc. site; demo/_template stay for reference.
const client = process.env.CLIENT || 'doc-to-doc';

export default defineConfig({
  // The React app lives in frontend/ (frontend/index.html + frontend/src);
  // the API lives in backend/. clients/ stays at the repo root because both
  // sides read it (frontend theming/fallback, backend seed).
  root: 'frontend',
  plugins: [react()],
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, `clients/${client}`),
    },
  },
  // Dev-only: frontend calls /api/* with no base URL; in production set
  // VITE_API_URL instead (see frontend/src/api.js and README).
  server: { proxy: { '/api': 'http://localhost:3001' } },
});

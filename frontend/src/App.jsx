import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastProvider } from './components/Toast.jsx';
import Site from './Site.jsx';
import Admin from './pages/admin/Admin.jsx';

// The public site is one page. Old multi-page URLs (shared links, search
// results) land on the matching section instead of a 404.
const OLD_PAGES = {
  '/who-we-are': '#who-we-are',
  '/how-it-works': '#how-we-help',
  '/faq': '#faq',
  '/book': '#contact',
  '/testimonials': '',
};

export default function App() {
  return (
    <ToastProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/" element={<Site />} />
          {/* Internal leads panel: nothing on the public site links to it. */}
          <Route path="/admin" element={<Admin />} />
          {Object.entries(OLD_PAGES).map(([path, hash]) => (
            <Route key={path} path={path} element={<Navigate to={{ pathname: '/', hash }} replace />} />
          ))}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ToastProvider>
  );
}

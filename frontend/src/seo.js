// Per-route <title> and meta description from config.
import { useEffect } from 'react';
import { BRAND } from '@client/config';

export function useSeo(title, description = '') {
  useEffect(() => {
    document.title = title ? `${title} | ${BRAND.name}` : BRAND.name;
    let meta = document.querySelector('meta[name="description"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.setAttribute('name', 'description');
      document.head.appendChild(meta);
    }
    meta.setAttribute('content', description || `${BRAND.name} — ${BRAND.footerLine || 'online store'}`);
  }, [title, description]);
}

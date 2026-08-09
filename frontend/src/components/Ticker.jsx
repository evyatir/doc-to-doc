// Static single-line announcement band. NOT a marquee (audit: the reference
// bar is static; reproduce the restraint).
import React from 'react';
import { BRAND } from '@client/config';

export default function Ticker() {
  if (!BRAND.announcement) return null;
  return <div className="ticker">{BRAND.announcement}</div>;
}

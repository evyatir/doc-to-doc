// Blur-up image: renders blurred until loaded, falls back to a tinted
// placeholder for blank/broken sources.
import React, { useState } from 'react';
import { imgSrc, placeholder } from '../placeholder.js';

export default function Img({ src, alt = '', label = '', className = '', ...rest }) {
  const [loaded, setLoaded] = useState(false);
  const [broken, setBroken] = useState(false);
  const resolved = broken ? placeholder(label || alt) : imgSrc(src, label || alt);
  return (
    <img
      src={resolved}
      alt={alt}
      className={`blur-img ${loaded ? 'loaded' : 'loading'} ${className}`}
      onLoad={() => setLoaded(true)}
      onError={() => { setBroken(true); setLoaded(true); }}
      loading="lazy"
      {...rest}
    />
  );
}

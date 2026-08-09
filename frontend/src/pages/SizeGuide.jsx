// Photo hero + one real semantic <table> per configured table.
import React from 'react';
import { SIZE_GUIDE } from '@client/config';
import { useSeo } from '../seo.js';
import Img from '../components/Img.jsx';

export default function SizeGuide() {
  useSeo('Size Guide', 'Find your size');
  return (
    <main>
      <div className="band band-hero-doc">
        <Img className="band-img" src="" alt="" label="Size Guide" />
        <div className="band-label">
          <h1 className="doc-h1">Size Guide</h1>
        </div>
      </div>
      <div className="page">
        {SIZE_GUIDE.tables.map((t) => (
          <table className="sizes" key={t.title}>
            <caption>{t.title}</caption>
            <thead>
              <tr>
                {t.cols.map((c) => <th key={c} scope="col">{c}</th>)}
              </tr>
            </thead>
            <tbody>
              {t.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) =>
                    ci === 0 ? <th key={ci} scope="row">{cell}</th> : <td key={ci}>{cell}</td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
        <p style={{ textAlign: 'center' }}>
          Still having trouble deciding? Chat with us — we answer fast.
        </p>
      </div>
    </main>
  );
}

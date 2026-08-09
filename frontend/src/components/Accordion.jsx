import React, { useState } from 'react';

export default function Accordion({ items }) {
  const [open, setOpen] = useState(null);
  return (
    <div className="accordions">
      {items.map((item, i) => (
        <div className="acc-item" key={item.title}>
          <h2>
            <button
              className="acc-head"
              aria-expanded={open === i}
              onClick={() => setOpen(open === i ? null : i)}
            >
              {item.title}
              <span aria-hidden="true">{open === i ? '−' : '+'}</span>
            </button>
          </h2>
          {open === i && <div className="acc-body">{item.body}</div>}
        </div>
      ))}
    </div>
  );
}

import React from 'react';

export default function QuantityStepper({ value, onChange, idPrefix = 'qty' }) {
  return (
    <div className="stepper">
      <button
        type="button"
        aria-label="Decrease quantity"
        disabled={value <= 1}
        onClick={() => onChange(Math.max(1, value - 1))}
      >
        −
      </button>
      <input
        id={`${idPrefix}-input`}
        type="number"
        min="1"
        value={value}
        aria-label="Quantity"
        onChange={(e) => onChange(Math.max(1, parseInt(e.target.value, 10) || 1))}
      />
      <button type="button" aria-label="Increase quantity" onClick={() => onChange(value + 1)}>
        +
      </button>
    </div>
  );
}

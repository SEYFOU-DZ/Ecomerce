'use client';
import { useState, useRef } from 'react';

export default function OtpInput({ length, onChange }) {
  const [values, setValues] = useState(Array(length).fill(''));
  const containerRef = useRef(null);

  const updateValue = (index, val) => {
    if (!/^[0-9]?$/.test(val)) return; 

    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);
    onChange(newValues.join(''));

    if (val && index < length - 1) {
      const inputs = containerRef.current.querySelectorAll('input');
      inputs[index + 1].focus();
    }
  };

  const handleKey = (index, e) => {
    if (e.key === 'Backspace' && !values[index] && index > 0) {
      const inputs = containerRef.current.querySelectorAll('input');
      inputs[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData('text').trim();

    if (!/^[0-9]+$/.test(pasteData)) return;

    const pasteValues = pasteData.split('').slice(0, length);
    setValues(pasteValues);
    onChange(pasteValues.join(''));
  };

  return (
    <div ref={containerRef} className="flex justify-center gap-2">
      {values.map((val, i) => (
        <input
          key={i}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => updateValue(i, e.target.value)}
          onKeyDown={(e) => handleKey(i, e)}
          onPaste={i === 0 ? handlePaste : undefined}
          className="w-11 h-11 text-center text-lg font-semibold border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
        />
      ))}
    </div>
  );
}
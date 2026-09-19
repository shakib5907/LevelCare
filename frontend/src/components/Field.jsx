import React from 'react';

function Field({ label, type = 'text', placeholder, value, onChange, error, hint }) {
  return (
    <div className="mb-4">
      <label className="block text-xs text-ink-muted mb-1.5">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className={`w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border transition ${
          error
            ? 'border-brick focus:ring-4 focus:ring-brick-light'
            : 'border-mist focus:border-teal focus:ring-4 focus:ring-teal-light'
        }`}
      />
      {error && <p className="text-xs text-brick mt-1.5">{error}</p>}
      {!error && hint && <p className="text-xs text-ink-muted mt-1.5">{hint}</p>}
    </div>
  );
}

export default Field;
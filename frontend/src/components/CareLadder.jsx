import React from 'react';

const TIERS = [
  { key: 'primary', label: 'Primary', hint: 'Community clinics — always open to book' },
  { key: 'secondary', label: 'Secondary', hint: 'Upazila & district hospitals — referral required' },
  { key: 'tertiary', label: 'Tertiary', hint: 'Medical college hospitals — referral required' },
  { key: 'specialized', label: 'Specialized', hint: 'Specialized institutes — referral required' },
];

export default function CareLadder({ activeLevel, compact = false }) {
  return (
    <div className={compact ? 'care-ladder text-sm' : 'care-ladder'}>
      {TIERS.map((t) => {
        const isActive = t.key === activeLevel;
        const isLocked = t.key !== 'primary';
        return (
          <div key={t.key} className={`rung ${isActive ? 'active' : isLocked ? 'locked' : ''}`}>
            <div className={`font-display ${compact ? 'text-base' : 'text-xl'} text-ink`}>{t.label}</div>
            {!compact && <div className="text-ink/60 text-sm mt-0.5">{t.hint}</div>}
          </div>
        );
      })}
    </div>
  );
}
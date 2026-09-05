import React from 'react';

const STYLES = {
  waiting: 'bg-parchment text-ink-muted',
  active: 'bg-teal-light text-teal-dark',
  seen: 'bg-sage-light text-sage',
};

const LABELS = {
  waiting: 'Waiting',
  active: 'In consultation',
  seen: 'Seen',
};

function StatusPill({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}

export default StatusPill;
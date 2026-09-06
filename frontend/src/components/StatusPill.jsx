import React from 'react';

const STYLES = {
  waiting: 'bg-parchment text-ink-muted',
  active: 'bg-teal-light text-teal-dark',
  seen: 'bg-sage-light text-sage',

  // appointment statuses
  upcoming: 'bg-teal-light text-teal-dark',
  completed: 'bg-sage-light text-sage',
  cancelled: 'bg-brick-light text-brick',

  // referral statuses
  issued: 'bg-teal-light text-teal-dark',
  used: 'bg-sage-light text-sage',
  expired: 'bg-parchment text-ink-muted',
  declined: 'bg-brick-light text-brick',
};

const LABELS = {
  waiting: 'Waiting',
  active: 'In consultation',
  seen: 'Seen',

  upcoming: 'Upcoming',
  completed: 'Completed',
  cancelled: 'Cancelled',

  issued: 'Issued',
  used: 'Used',
  expired: 'Expired',
  declined: 'Declined',
};

function StatusPill({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STYLES[status]}`}>
      {LABELS[status]}
    </span>
  );
}

export default StatusPill;
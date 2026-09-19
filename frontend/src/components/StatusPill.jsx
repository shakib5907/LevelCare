import React from 'react';

const STYLES = {
  waiting: 'bg-parchment text-ink-muted',
  active: 'bg-teal-light text-teal-dark',
  seen: 'bg-sage-light text-sage',

  booked: 'bg-teal-light text-teal-dark',
  upcoming: 'bg-teal-light text-teal-dark',
  started: 'bg-gold/20 text-gold',
  completed: 'bg-sage-light text-sage',
  cancelled: 'bg-brick-light text-brick',
  no_show: 'bg-brick-light text-brick',

  issued: 'bg-teal-light text-teal-dark',
  used: 'bg-sage-light text-sage',
  expired: 'bg-parchment text-ink-muted',
  declined: 'bg-brick-light text-brick',

  intake: 'bg-parchment text-ink-muted',
  dispatched: 'bg-gold/20 text-gold',
  arrived: 'bg-teal-light text-teal-dark',
  closed: 'bg-sage-light text-sage',
};

const LABELS = {
  waiting: 'Waiting',
  active: 'In consultation',
  seen: 'Seen',

  booked: 'Booked',
  upcoming: 'Upcoming',
  started: 'In progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
  no_show: 'No-show',

  issued: 'Issued',
  used: 'Used',
  expired: 'Expired',
  declined: 'Declined',

  intake: 'Intake',
  dispatched: 'Dispatched',
  arrived: 'Arrived',
  closed: 'Closed',
};

function StatusPill({ status }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STYLES[status] || 'bg-parchment text-ink-muted'}`}>
      {LABELS[status] || status}
    </span>
  );
}

export default StatusPill;
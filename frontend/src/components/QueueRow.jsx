import React from 'react';
import StatusPill from './StatusPill';

function QueueRow({ patient, isNext, onSelect }) {
  return (
    <button onClick={() => onSelect(patient)} className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition ${isNext ? 'bg-white border-teal shadow-sm' : 'bg-white border-mist hover:border-ink/20'}`}>
      <div className={`w-14 shrink-0 text-center rounded-lg py-2 ${isNext ? 'bg-teal text-white' : 'bg-parchment text-ink-muted'}`}>
        <div className="text-xs font-semibold">{patient.token}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium text-ink truncate">{patient.name}</div>
        <div className="text-xs text-ink-muted mt-0.5">
          {patient.age} years · {patient.time}
        </div>
        {patient.referral && (
          <div className="text-xs text-teal-dark mt-1 truncate">
            Referred by {patient.referral.from}
          </div>
        )}
      </div>

      <StatusPill status={patient.status} />
    </button>
  );
}

export default QueueRow;
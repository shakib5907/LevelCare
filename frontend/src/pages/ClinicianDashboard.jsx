import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import QueueRow from '../components/QueueRow';

const QUEUE = [
  { id: 1, token: 'SEC-041', name: 'Rahima Begum', age: 54, time: '9:00 AM', status: 'seen', referral: { from: 'Savar UHC' } },
  { id: 2, token: 'SEC-042', name: 'Jamal Uddin', age: 31, time: '9:20 AM', status: 'seen', referral: { from: 'Dhamrai UHC' } },
  { id: 3, token: 'SEC-043', name: 'Nusrat Jahan', age: 27, time: '9:40 AM', status: 'active', referral: { from: 'Savar UHC' } },
  { id: 4, token: 'SEC-044', name: 'Abdul Karim', age: 63, time: '10:00 AM', status: 'waiting', referral: { from: 'Ashulia UHC' } },
  { id: 5, token: 'SEC-045', name: 'Shirin Akter', age: 19, time: '10:20 AM', status: 'waiting', referral: null },
  { id: 6, token: 'SEC-046', name: 'Mizanur Rahman', age: 45, time: '10:40 AM', status: 'waiting', referral: { from: 'Savar UHC' } },
];

function ClinicianDashboard() {
  const { user } = useAuth();
  const [selected, setSelected] = useState(null);

  const seen = QUEUE.filter((p) => p.status === 'seen').length;
  const nextId = QUEUE.find((p) => p.status === 'waiting')?.id;

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl text-ink">Good morning, {user?.name || 'Doctor'}</h1>
      <p className="text-sm text-ink-muted mt-1">Savar Upazila Health Complex · Secondary level</p>

      <div className="flex gap-6 mt-6 mb-6 pb-6 border-b border-mist">
        <div>
          <div className="text-2xl text-ink">{QUEUE.length}</div>
          <div className="text-xs text-ink-muted mt-0.5">Patients today</div>
        </div>
        <div>
          <div className="text-2xl text-teal">{seen}</div>
          <div className="text-xs text-ink-muted mt-0.5">Seen</div>
        </div>
        <div>
          <div className="text-2xl text-ink">{QUEUE.length - seen}</div>
          <div className="text-xs text-ink-muted mt-0.5">Remaining</div>
        </div>
      </div>

      <div className="space-y-2">
        {QUEUE.map((p) => (
          <QueueRow key={p.id} patient={p} isNext={p.id === nextId} onSelect={setSelected} />
        ))}
      </div>

      {selected && (
        <p className="text-sm text-ink-muted text-center mt-6">
          Selected: {selected.name} — consultation panel comes next.
        </p>
      )}
    </div>
  );
}

export default ClinicianDashboard;
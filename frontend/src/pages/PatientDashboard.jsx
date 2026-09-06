import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import CareLadder from '../components/CareLadder';
import StatusPill from '../components/StatusPill';

// Mock data — swap for real API calls once appointment/referral endpoints exist
// (GET /api/appointments/mine, GET /api/referrals/mine, GET /api/care-history/mine)
const APPOINTMENTS = [
  { id: 1, facility: 'Savar Community Clinic', level: 'primary', doctor: 'Dr. Fahmida Rahman', date: 'Sep 10, 2026', time: '10:30 AM', status: 'upcoming' },
  { id: 2, facility: 'Savar Upazila Health Complex', level: 'secondary', doctor: 'Dr. Kamal Hossain', date: 'Aug 22, 2026', time: '9:15 AM', status: 'completed' },
];

const REFERRALS = [
  {
    id: 1,
    issuedBy: 'Dr. Fahmida Rahman',
    fromFacility: 'Savar Community Clinic',
    targetLevel: 'Secondary',
    specialty: 'General Medicine',
    reason: 'Persistent abdominal pain requiring further diagnostics',
    validUntil: 'Sep 20, 2026',
    status: 'issued',
  },
  {
    id: 2,
    issuedBy: 'Dr. Kamal Hossain',
    fromFacility: 'Savar Upazila Health Complex',
    targetLevel: 'Tertiary',
    specialty: 'Cardiology',
    reason: 'Suspected arrhythmia, referred for specialist evaluation',
    validUntil: 'Aug 30, 2026',
    status: 'used',
  },
];

const CARE_HISTORY = [
  { id: 1, date: 'Aug 22, 2026', label: 'Consultation at Savar Upazila Health Complex', level: 'secondary' },
  { id: 2, date: 'Aug 15, 2026', label: 'Referred from Savar Community Clinic', level: 'primary' },
  { id: 3, date: 'Jul 30, 2026', label: 'Consultation at Savar Community Clinic', level: 'primary' },
];

function SectionCard({ title, action, children }) {
  return (
    <div className="bg-white rounded-2xl border border-mist/60 shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg text-ink">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function PatientDashboard() {
  const { user } = useAuth();
  const [query, setQuery] = useState('');

  const upcoming = APPOINTMENTS.filter((a) => a.status === 'upcoming');

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl text-ink">Welcome back, {user?.name || 'there'}</h1>
      <p className="text-sm text-ink-muted mt-1">
        {user?.upazila ? `${user.upazila} · Primary level` : 'Primary level patient'}
      </p>

      <div className="grid grid-cols-3 gap-6 mt-6 mb-8 pb-6 border-b border-mist">
        <div>
          <div className="text-2xl text-ink">{upcoming.length}</div>
          <div className="text-xs text-ink-muted mt-0.5">Upcoming visits</div>
        </div>
        <div>
          <div className="text-2xl text-teal">{REFERRALS.filter((r) => r.status === 'issued').length}</div>
          <div className="text-xs text-ink-muted mt-0.5">Active referrals</div>
        </div>
        <div>
          <div className="text-2xl text-ink">{CARE_HISTORY.length}</div>
          <div className="text-xs text-ink-muted mt-0.5">Visits on record</div>
        </div>
      </div>

      <SectionCard
        title="Your appointments"
        action={
          <Link
            to="/book"
            className="bg-teal hover:bg-teal-dark text-white rounded-full px-4 py-2 text-xs font-medium transition"
          >
            Book a visit
          </Link>
        }
      >
        <div className="space-y-3">
          {APPOINTMENTS.map((a) => (
            <div key={a.id} className="flex items-center gap-4 p-4 rounded-xl border border-mist bg-parchment/40">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink truncate">{a.facility}</div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {a.doctor} · {a.date} at {a.time}
                </div>
              </div>
              <StatusPill status={a.status} />
            </div>
          ))}
          {APPOINTMENTS.length === 0 && (
            <p className="text-sm text-ink-muted">No appointments yet. Book your first visit above.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="My referrals">
        <div className="space-y-3">
          {REFERRALS.map((r) => (
            <div key={r.id} className="p-4 rounded-xl border border-mist bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">
                    {r.targetLevel} level · {r.specialty}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">
                    Issued by {r.issuedBy} at {r.fromFacility}
                  </div>
                </div>
                <StatusPill status={r.status} />
              </div>
              <p className="text-xs text-ink-muted mt-2 leading-relaxed">{r.reason}</p>
              <p className="text-xs text-ink-muted/70 mt-1">Valid until {r.validUntil}</p>
            </div>
          ))}
          {REFERRALS.length === 0 && (
            <p className="text-sm text-ink-muted">No referrals issued to you yet.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="Care history">
        <div className="care-ladder-history space-y-4">
          {CARE_HISTORY.map((h) => (
            <div key={h.id} className="flex items-start gap-3">
              <div className="w-2 h-2 rounded-full bg-teal mt-1.5 shrink-0" />
              <div className="min-w-0">
                <div className="text-sm text-ink">{h.label}</div>
                <div className="text-xs text-ink-muted mt-0.5">{h.date}</div>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Your place on the care ladder">
        <CareLadder activeLevel="primary" compact />
        <p className="text-xs text-ink-muted mt-3">
          You can always book at the primary level. Moving up requires a referral from your treating clinician.
        </p>
      </SectionCard>

      <SectionCard title="Find a facility near you">
        <input
          type="text"
          placeholder="Search by district, upazila, or specialty"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition"
        />
        <p className="text-xs text-ink-muted mt-2">
          Facility search results will appear here once the facility directory is connected.
        </p>
      </SectionCard>
    </div>
  );
}

export default PatientDashboard;

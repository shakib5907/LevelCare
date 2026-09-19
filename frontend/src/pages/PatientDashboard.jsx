import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CareLadder from '../components/CareLadder';
import StatusPill from '../components/StatusPill';
import Field from '../components/Field';
import api from '../api/client';

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
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [query, setQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedReferral, setSelectedReferral] = useState('');
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  function loadAll() {
    Promise.all([api.get('/appointments'), api.get('/referrals'), api.get('/facilities')])
      .then(([a, r, f]) => {
        setAppointments(a);
        setReferrals(r);
        setFacilities(f);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  const upcoming = appointments.filter((a) => a.status === 'booked');
  const activeReferrals = referrals.filter((r) => r.status === 'issued');

  const filteredFacilities = facilities.filter((f) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      f.name.toLowerCase().includes(q) ||
      f.district.toLowerCase().includes(q) ||
      f.upazila.toLowerCase().includes(q) ||
      f.specialties?.some((s) => s.toLowerCase().includes(q))
    );
  });

  const needsReferral = selectedFacility && selectedFacility.level !== 'primary';
  const usableReferrals = selectedFacility
    ? activeReferrals.filter((r) => r.targetLevel === selectedFacility.level)
    : [];

  async function handleBook(e) {
    e.preventDefault();
    setBookError('');
    setBookSuccess('');
    try {
      const appt = await api.post('/appointments', {
        facilityId: selectedFacility._id,
        scheduledAt,
        referralId: needsReferral ? selectedReferral : undefined,
      });
      setBookSuccess(`Booked! Your token is ${appt.token}.`);
      setSelectedFacility(null);
      setScheduledAt('');
      setSelectedReferral('');
      loadAll();
    } catch (err) {
      setBookError(err.message);
    }
  }

  async function handleCancel(id) {
    await api.patch(`/appointments/${id}/cancel`);
    loadAll();
  }

  if (loading) {
    return <div className="max-w-3xl mx-auto px-6 py-10 text-ink-muted">Loading...</div>;
  }

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
          <div className="text-2xl text-teal">{activeReferrals.length}</div>
          <div className="text-xs text-ink-muted mt-0.5">Active referrals</div>
        </div>
        <div>
          <div className="text-2xl text-ink">{appointments.length}</div>
          <div className="text-xs text-ink-muted mt-0.5">Visits on record</div>
        </div>
      </div>

      <SectionCard title="Your appointments">
        <div className="space-y-3">
          {appointments.map((a) => (
            <div key={a._id} className="flex items-center gap-4 p-4 rounded-xl border border-mist bg-parchment/40">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink truncate">{a.facility?.name}</div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {new Date(a.scheduledAt).toLocaleString()} · Token {a.token}
                </div>
              </div>
              <StatusPill status={a.status} />
              {a.status === 'booked' && (
                <button onClick={() => handleCancel(a._id)} className="text-xs text-brick hover:underline">
                  Cancel
                </button>
              )}
            </div>
          ))}
          {appointments.length === 0 && (
            <p className="text-sm text-ink-muted">No appointments yet. Book your first visit below.</p>
          )}
        </div>
      </SectionCard>

      <SectionCard title="My referrals">
        <div className="space-y-3">
          {referrals.map((r) => (
            <div key={r._id} className="p-4 rounded-xl border border-mist bg-white">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink">
                    {r.targetLevel} level {r.requiredSpecialty ? `· ${r.requiredSpecialty}` : ''}
                  </div>
                  <div className="text-xs text-ink-muted mt-0.5">Issued by {r.issuedBy?.name}</div>
                </div>
                <StatusPill status={r.status} />
              </div>
              <p className="text-xs text-ink-muted mt-2 leading-relaxed">{r.reason}</p>
              <p className="text-xs text-ink-muted/70 mt-1">
                Valid until {new Date(r.validUntil).toLocaleDateString()}
              </p>
              {r.supportingDocument?.url && (
                
                  <a href={r.supportingDocument.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-teal hover:underline mt-1 inline-block"
                >
                  View supporting document →
                </a>
              )}
            </div>
          ))}
          {referrals.length === 0 && <p className="text-sm text-ink-muted">No referrals issued to you yet.</p>}
        </div>
      </SectionCard>

      <SectionCard title="Your place on the care ladder">
        <CareLadder activeLevel={selectedFacility?.level || 'primary'} compact />
        <p className="text-xs text-ink-muted mt-3">
          You can always book at the primary level. Moving up requires a referral from your treating clinician.
        </p>
      </SectionCard>

      <SectionCard title="Book a visit">
        <input
          type="text"
          placeholder="Search by name, district, upazila, or specialty"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition mb-4"
        />

        <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
          {filteredFacilities.map((f) => (
            <label
              key={f._id}
              className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition ${
                selectedFacility?._id === f._id ? 'border-teal bg-teal-light/30' : 'border-mist'
              }`}
            >
              <input
                type="radio"
                name="facility"
                checked={selectedFacility?._id === f._id}
                onChange={() => setSelectedFacility(f)}
                className="mt-1"
              />
              <div>
                <div className="text-sm font-medium text-ink">{f.name}</div>
                <div className="text-xs text-ink-muted capitalize">
                  {f.level} · {f.upazila}, {f.district}
                </div>
              </div>
            </label>
          ))}
          {filteredFacilities.length === 0 && <p className="text-sm text-ink-muted">No facilities match your search.</p>}
        </div>

        {selectedFacility && (
          <form onSubmit={handleBook} className="border-t border-mist pt-4">
            {needsReferral && (
              <div className="mb-4">
                <label className="block text-xs text-ink-muted mb-1.5">
                  Referral targeting {selectedFacility.level}
                </label>
                <select
                  required
                  value={selectedReferral}
                  onChange={(e) => setSelectedReferral(e.target.value)}
                  className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition"
                >
                  <option value="">Select a referral</option>
                  {usableReferrals.map((r) => (
                    <option key={r._id} value={r._id}>
                      Issued by {r.issuedBy?.name} · valid until {new Date(r.validUntil).toLocaleDateString()}
                    </option>
                  ))}
                </select>
                {usableReferrals.length === 0 && (
                  <p className="text-xs text-brick mt-1.5">
                    You have no valid referral to {selectedFacility.level} level yet.
                  </p>
                )}
              </div>
            )}
            <Field
              label="Date & time"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
            />
            {bookError && <p className="text-xs text-brick mb-3">{bookError}</p>}
            {bookSuccess && <p className="text-xs text-teal mb-3">{bookSuccess}</p>}
            <button
              type="submit"
              disabled={needsReferral && usableReferrals.length === 0}
              className="w-full bg-teal hover:bg-teal-dark text-white rounded-full py-2.5 text-sm font-medium transition disabled:opacity-50"
            >
              Confirm booking
            </button>
          </form>
        )}
      </SectionCard>
    </div>
  );
}

export default PatientDashboard;
import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CareLadder from '../components/CareLadder';
import StatusPill from '../components/StatusPill';
import Field from '../components/Field';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/client';


const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'book', label: 'Book a visit' },
  { id: 'referrals', label: 'My referrals' },
  { id: 'appointments', label: 'My appointments' },
  { id: 'history', label: 'Care history' },
];

function Card({ title, action, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-mist/60 shadow-sm p-6 ${className}`}>
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg text-ink">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  );
}

function PatientDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('overview');
  const [appointments, setAppointments] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [emergencyCalls, setEmergencyCalls] = useState([]);
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);

  function loadAll() {
    Promise.all([
      api.get('/appointments'),
      api.get('/referrals'),
      api.get('/emergency'),
      api.get('/facilities'),
    ])
      .then(([a, r, e, f]) => {
        setAppointments(a);
        setReferrals(r);
        setEmergencyCalls(e);
        setFacilities(f);
      })
      .finally(() => setLoading(false));
  }

  useEffect(loadAll, []);

  const upcoming = appointments.filter((a) => a.status === 'booked');
  const activeReferrals = referrals.filter((r) => r.status === 'issued');

  if (loading) {
    return <div className="w-full px-6 py-16 text-center text-ink-muted">Loading...</div>;
  }

  return (
    <DashboardLayout
      eyebrow="Patient"
      title={user?.name || 'Welcome'}
      subtitle={user?.upazila ? `${user.upazila} · Primary level` : 'Primary level patient'}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      sidebarExtra={
        <Card>
          <CareLadder activeLevel="primary" compact />
        </Card>
      }
    >
      {tab === 'overview' && (
        <Overview appointments={appointments} referrals={referrals} upcoming={upcoming} activeReferrals={activeReferrals} />
      )}
      {tab === 'book' && <BookVisit facilities={facilities} referrals={activeReferrals} onBooked={loadAll} />}
      {tab === 'referrals' && <Referrals referrals={referrals} />}
      {tab === 'appointments' && <Appointments appointments={appointments} onChanged={loadAll} />}
      {tab === 'history' && (
        <CareHistory appointments={appointments} referrals={referrals} emergencyCalls={emergencyCalls} />
      )}
    </DashboardLayout>
  );
}

function Overview({ appointments, referrals, upcoming, activeReferrals }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <div className="text-3xl text-ink">{upcoming.length}</div>
          <div className="text-xs text-ink-muted mt-1">Upcoming visits</div>
        </Card>
        <Card>
          <div className="text-3xl text-teal">{activeReferrals.length}</div>
          <div className="text-xs text-ink-muted mt-1">Active referrals</div>
        </Card>
        <Card>
          <div className="text-3xl text-ink">{appointments.length}</div>
          <div className="text-xs text-ink-muted mt-1">Visits on record</div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Upcoming visits">
          <div className="space-y-2">
            {upcoming.length === 0 && <p className="text-sm text-ink-muted">Nothing booked yet.</p>}
            {upcoming.slice(0, 5).map((a) => (
              <div key={a._id} className="flex items-center justify-between p-3 rounded-xl border border-mist bg-parchment/40">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink truncate">{a.facility?.name}</div>
                  <div className="text-xs text-ink-muted mt-0.5">{new Date(a.scheduledAt).toLocaleString()}</div>
                </div>
                <StatusPill status={a.status} />
              </div>
            ))}
          </div>
        </Card>

        <Card title="Active referrals">
          <div className="space-y-2">
            {activeReferrals.length === 0 && <p className="text-sm text-ink-muted">No referrals waiting to be used.</p>}
            {activeReferrals.slice(0, 5).map((r) => (
              <div key={r._id} className="flex items-center justify-between p-3 rounded-xl border border-mist bg-white">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-ink capitalize truncate">{r.targetLevel} level</div>
                  <div className="text-xs text-ink-muted mt-0.5">Issued by {r.issuedBy?.name}</div>
                </div>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BookVisit({ facilities, referrals, onBooked }) {
  const [query, setQuery] = useState('');
  const [selectedFacility, setSelectedFacility] = useState(null);
  const [scheduledAt, setScheduledAt] = useState('');
  const [selectedReferral, setSelectedReferral] = useState('');
  const [bookError, setBookError] = useState('');
  const [bookSuccess, setBookSuccess] = useState('');

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
    ? referrals.filter((r) => r.targetLevel === selectedFacility.level)
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
      onBooked();
    } catch (err) {
      setBookError(err.message);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
      <Card title="Find a facility">
        <input
          type="text"
          placeholder="Search by name, district, upazila, or specialty"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition mb-4"
        />
        <div className="grid sm:grid-cols-2 gap-2 max-h-[28rem] overflow-y-auto">
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
          {filteredFacilities.length === 0 && <p className="text-sm text-ink-muted col-span-2">No facilities match your search.</p>}
        </div>
      </Card>

      <Card title="Book">
        {!selectedFacility && <p className="text-sm text-ink-muted">Select a facility to continue.</p>}
        {selectedFacility && (
          <form onSubmit={handleBook}>
            <div className="mb-4">
              <div className="text-sm font-medium text-ink">{selectedFacility.name}</div>
              <div className="text-xs text-ink-muted capitalize">{selectedFacility.level} level</div>
            </div>
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
      </Card>
    </div>
  );
}

function Referrals({ referrals }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {referrals.map((r) => (
        <Card key={r._id}>
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
            <a href={r.supportingDocument.url} target="_blank" rel="noreferrer" className="text-xs text-teal hover:underline mt-1 inline-block">
              View supporting document →
            </a>
          )}
        </Card>
      ))}
      {referrals.length === 0 && <p className="text-sm text-ink-muted">No referrals issued to you yet.</p>}
    </div>
  );
}

function Appointments({ appointments, onChanged }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [rescheduling, setRescheduling] = useState(null);
  const [newTime, setNewTime] = useState('');
  const [error, setError] = useState('');

  const filtered = statusFilter ? appointments.filter((a) => a.status === statusFilter) : appointments;

  async function cancel(id) {
    setError('');
    try {
      await api.patch(`/appointments/${id}/cancel`);
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  async function reschedule(id) {
    setError('');
    try {
      await api.patch(`/appointments/${id}/reschedule`, { scheduledAt: newTime });
      setRescheduling(null);
      setNewTime('');
      onChanged();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card
      title="My appointments"
      action={
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="text-sm border border-mist rounded-lg px-3 py-1.5 bg-white"
        >
          <option value="">All statuses</option>
          <option value="booked">Booked</option>
          <option value="started">In progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
          <option value="no_show">No-show</option>
        </select>
      }
    >
      {error && <p className="text-xs text-brick mb-3">{error}</p>}
      <div className="space-y-2">
        {filtered.map((a) => (
          <div key={a._id} className="p-4 rounded-xl border border-mist bg-parchment/40">
            <div className="flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-ink truncate">{a.facility?.name}</div>
                <div className="text-xs text-ink-muted mt-0.5">
                  {new Date(a.scheduledAt).toLocaleString()} · Token {a.token}
                </div>
              </div>
              <StatusPill status={a.status} />
              {a.status === 'booked' && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setRescheduling(rescheduling === a._id ? null : a._id)} className="text-xs text-teal hover:underline">
                    Reschedule
                  </button>
                  <button onClick={() => cancel(a._id)} className="text-xs text-brick hover:underline">
                    Cancel
                  </button>
                </div>
              )}
            </div>
            {rescheduling === a._id && (
              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-mist">
                <input
                  type="datetime-local"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="flex-1 text-sm border border-mist rounded-lg px-3 py-2 bg-white"
                />
                <button onClick={() => reschedule(a._id)} className="text-xs px-3 py-2 rounded-full bg-teal text-white">
                  Confirm
                </button>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <p className="text-sm text-ink-muted">No appointments match this filter.</p>}
      </div>
    </Card>
  );
}

const CAREHISTORY_BAR_COLORS = {
  teal: 'bg-teal',
  sage: 'bg-sage',
  brick: 'bg-brick',
};

function CareHistory({ appointments, referrals, emergencyCalls }) {
  const events = [
    ...appointments.map((a) => ({
      date: a.scheduledAt,
      type: 'Visit',
      title: a.facility?.name,
      detail: `${a.level} level · ${a.status}`,
      color: 'teal',
    })),
    ...referrals.map((r) => ({
      date: r.createdAt,
      type: 'Referral',
      title: `To ${r.targetLevel} level`,
      detail: `Issued by ${r.issuedBy?.name} · ${r.status}`,
      color: 'sage',
    })),
    ...emergencyCalls.map((c) => ({
      date: c.createdAt,
      type: 'Emergency',
      title: c.reportedCondition,
      detail: `${c.finalLevel || c.suggestedLevel} level · ${c.status}`,
      color: 'brick',
    })),
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <Card title="Your full care history">
      <p className="text-xs text-ink-muted mb-4">
        A chronological record of every visit, referral, and emergency dispatch tied to your account.
      </p>
      <div className="space-y-3">
        {events.map((e, i) => (
          <div key={i} className="flex gap-4 p-3 rounded-xl border border-mist bg-white">
            <div className={`w-1.5 rounded-full ${CAREHISTORY_BAR_COLORS[e.color]}`} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-wide text-ink-muted">{e.type}</span>
                <span className="text-xs text-ink-muted">{e.date ? new Date(e.date).toLocaleDateString() : ''}</span>
              </div>
              <div className="text-sm font-medium text-ink mt-0.5 truncate">{e.title}</div>
              <div className="text-xs text-ink-muted mt-0.5">{e.detail}</div>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-sm text-ink-muted">Nothing on record yet.</p>}
      </div>
    </Card>
  );
}

export default PatientDashboard; 
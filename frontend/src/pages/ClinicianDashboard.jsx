import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';
import Field from '../components/Field';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/client';

const TABS = [
  { id: 'queue', label: 'Queue' },
  { id: 'incoming', label: 'Incoming referrals' },
  { id: 'issue', label: 'Issue referral' },
  { id: 'emergency', label: 'Emergency admissions' },
];

function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-mist/60 shadow-sm p-6 ${className}`}>
      {title && <h2 className="text-lg text-ink mb-4">{title}</h2>}
      {children}
    </div>
  );
}

function ClinicianDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('queue');

  if (!user?.isVerified) {
    return (
      <div className="w-full px-6 py-16 max-w-2xl mx-auto">
        <Card>
          <h1 className="text-xl text-ink">Verification pending</h1>
          <p className="text-sm text-ink-muted mt-2">
            Your staff account is awaiting administrator verification. You'll be able to see your
            queue and issue referrals once approved.
          </p>
        </Card>
      </div>
    );
  }

  return (
    <DashboardLayout
      eyebrow="Clinical staff"
      title={user?.name || 'Doctor'}
      subtitle={`${user?.facilityName || 'Your facility'} · ${user?.facilityLevel || ''} level`}
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {tab === 'queue' && <Queue />}
      {tab === 'incoming' && <IncomingReferrals />}
      {tab === 'issue' && <IssueReferral />}
      {tab === 'emergency' && <EmergencyAdmissions />}
    </DashboardLayout>
  );
}

function Queue() {
  const [appointments, setAppointments] = useState([]);
  const [error, setError] = useState('');

  function load() {
    api.get('/appointments').then(setAppointments);
  }
  useEffect(load, []);

  async function setStatus(id, status) {
    setError('');
    try {
      await api.patch(`/appointments/${id}/status`, { status });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card title="Today's queue">
      {error && <p className="text-xs text-brick mb-2">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {appointments.map((a) => (
          <div key={a._id} className="flex items-center justify-between p-4 rounded-xl border border-mist bg-parchment/40">
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink truncate">{a.patient?.name}</div>
              <div className="text-xs text-ink-muted mt-0.5">
                {new Date(a.scheduledAt).toLocaleString()} · Token {a.token}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusPill status={a.status} />
              {a.status === 'booked' && (
                <button onClick={() => setStatus(a._id, 'started')} className="text-xs px-2 py-1 rounded border border-mist hover:border-teal">
                  Start
                </button>
              )}
              {a.status === 'started' && (
                <button onClick={() => setStatus(a._id, 'completed')} className="text-xs px-2 py-1 rounded border border-mist hover:border-teal">
                  Complete
                </button>
              )}
            </div>
          </div>
        ))}
        {appointments.length === 0 && <p className="text-sm text-ink-muted">No appointments today.</p>}
      </div>
    </Card>
  );
}

function IncomingReferrals() {
  const [referrals, setReferrals] = useState([]);
  const [error, setError] = useState('');
  const [decliningId, setDecliningId] = useState(null);
  const [declineReason, setDeclineReason] = useState('');

  function load() {
    api.get('/referrals', { status: 'issued' }).then(setReferrals);
  }
  useEffect(load, []);

  async function accept(id) {
    setError('');
    try {
      await api.patch(`/referrals/${id}/decision`, { decision: 'accept' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function decline(id) {
    setError('');
    try {
      await api.patch(`/referrals/${id}/decision`, { decision: 'decline', declineReason });
      setDecliningId(null);
      setDeclineReason('');
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <Card title="Incoming referrals">
      {error && <p className="text-xs text-brick mb-2">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {referrals.map((r) => (
          <div key={r._id} className="p-4 rounded-xl border border-mist bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-ink">{r.patient?.name}</div>
                <div className="text-xs text-ink-muted mt-0.5">
                  From {r.issuedBy?.name} · {r.urgency}
                </div>
              </div>
              <StatusPill status={r.status} />
            </div>
            <p className="text-xs text-ink-muted mt-2">{r.reason}</p>
            {r.supportingDocument?.url && (
              <a href={r.supportingDocument.url} target="_blank" rel="noreferrer" className="text-xs text-teal hover:underline mt-1 inline-block">
                View supporting document →
              </a>
            )}
            <div className="flex gap-2 mt-3">
              {decliningId === r._id ? (
                <>
                  <input
                    value={declineReason}
                    onChange={(e) => setDeclineReason(e.target.value)}
                    placeholder="Reason"
                    className="flex-1 text-xs border border-mist rounded-lg px-2 py-1.5"
                  />
                  <button onClick={() => decline(r._id)} className="text-xs px-3 py-1.5 rounded-full bg-brick text-white">
                    Confirm decline
                  </button>
                </>
              ) : (
                <>
                  <button onClick={() => accept(r._id)} className="text-xs px-3 py-1.5 rounded-full border border-teal text-teal">
                    Accept
                  </button>
                  <button onClick={() => setDecliningId(r._id)} className="text-xs px-3 py-1.5 rounded-full border border-brick text-brick">
                    Decline
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {referrals.length === 0 && <p className="text-sm text-ink-muted">No incoming referrals.</p>}
      </div>
    </Card>
  );
}

function IssueReferral() {
  const [appointments, setAppointments] = useState([]);
  const [form, setForm] = useState({ patientId: '', targetLevel: '', reason: '', requiredSpecialty: '', urgency: 'routine' });
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/appointments', { status: 'completed' }).then(setAppointments).catch(() => {});
  }, []);

  async function submit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);
    try {
      const formData = new FormData();
      Object.entries(form).forEach(([k, v]) => v && formData.append(k, v));
      if (file) formData.append('supportingDocument', file);
      await api.postForm('/referrals', formData);
      setSuccess('Referral issued.');
      setForm({ patientId: '', targetLevel: '', reason: '', requiredSpecialty: '', urgency: 'routine' });
      setFile(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Card title="Issue a referral">
      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-6">
        <div className="mb-4">
          <label className="block text-xs text-ink-muted mb-1.5">Patient</label>
          <select
            required
            value={form.patientId}
            onChange={(e) => setForm({ ...form, patientId: e.target.value })}
            className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition"
          >
            <option value="">Select from your completed consultations</option>
            {appointments.map((a) => (
              <option key={a._id} value={a.patient._id}>
                {a.patient.name} — {new Date(a.scheduledAt).toLocaleDateString()}
              </option>
            ))}
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-xs text-ink-muted mb-1.5">Target level</label>
          <select
            required
            value={form.targetLevel}
            onChange={(e) => setForm({ ...form, targetLevel: e.target.value })}
            className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition"
          >
            <option value="">Select level</option>
            <option value="secondary">Secondary</option>
            <option value="tertiary">Tertiary</option>
            <option value="specialized">Specialized</option>
          </select>
        </div>

        <Field label="Required specialty" placeholder="Cardiology" value={form.requiredSpecialty} onChange={(e) => setForm({ ...form, requiredSpecialty: e.target.value })} />
        <Field label="Reason" placeholder="Why the patient needs this level of care" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />

        <div className="mb-4 lg:col-span-2">
          <label className="block text-xs text-ink-muted mb-1.5">Supporting document (optional)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setFile(e.target.files[0])}
            className="text-sm text-ink-muted"
          />
          <p className="text-xs text-ink-muted mt-1">Lab report, imaging, etc. — stored securely via Cloudinary.</p>
        </div>

        <div className="lg:col-span-2">
          {error && <p className="text-xs text-brick mb-3">{error}</p>}
          {success && <p className="text-xs text-teal mb-3">{success}</p>}
          <button
            type="submit"
            disabled={submitting}
            className="w-full lg:w-auto lg:px-10 bg-teal hover:bg-teal-dark text-white rounded-full py-2.5 text-sm font-medium transition disabled:opacity-50"
          >
            {submitting ? 'Issuing...' : 'Issue referral'}
          </button>
        </div>
      </form>
    </Card>
  );
}

function EmergencyAdmissions() {
  const [calls, setCalls] = useState([]);
  useEffect(() => {
    api.get('/emergency').then(setCalls);
  }, []);

  return (
    <Card title="Emergency admissions routed to your facility">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {calls.map((c) => (
          <div key={c._id} className="p-4 rounded-xl border border-mist bg-white">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-sm font-medium text-ink">{c.callerName}</div>
                <div className="text-xs text-ink-muted mt-0.5">{c.reportedCondition}</div>
              </div>
              <StatusPill status={c.status} />
            </div>
            <div className="text-xs text-ink-muted mt-2">{c.location}</div>
          </div>
        ))}
        {calls.length === 0 && <p className="text-sm text-ink-muted">No emergency admissions routed to your facility.</p>}
      </div>
    </Card>
  );
}

export default ClinicianDashboard;
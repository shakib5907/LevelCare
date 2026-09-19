import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';
import Field from '../components/Field';
import api from '../api/client';

const TABS = ['Queue', 'Incoming referrals', 'Issue referral'];

function ClinicianDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState(TABS[0]);

  if (!user?.isVerified) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-10">
        <div className="bg-white rounded-2xl border border-mist/60 shadow-sm p-6">
          <h1 className="text-xl text-ink">Verification pending</h1>
          <p className="text-sm text-ink-muted mt-2">
            Your staff account is awaiting administrator verification. You'll be able to see your
            queue and issue referrals once approved.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl text-ink">Good morning, {user?.name || 'Doctor'}</h1>
      <p className="text-sm text-ink-muted mt-1 capitalize">
        {user?.facilityName || 'Your facility'} · {user?.facilityLevel} level
      </p>

      <div className="flex gap-1 border-b border-mist mt-6 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium border-b-2 -mb-px transition ${
              tab === t ? 'border-teal text-teal' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'Queue' && <Queue />}
      {tab === 'Incoming referrals' && <IncomingReferrals />}
      {tab === 'Issue referral' && <IssueReferral />}
    </div>
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
    <div className="space-y-2">
      {error && <p className="text-xs text-brick mb-2">{error}</p>}
      {appointments.length === 0 && <p className="text-sm text-ink-muted">No appointments today.</p>}
      {appointments.map((a) => (
        <div key={a._id} className="flex items-center justify-between p-4 rounded-xl border border-mist bg-white">
          <div>
            <div className="text-sm font-medium text-ink">{a.patient?.name}</div>
            <div className="text-xs text-ink-muted mt-0.5">
              {new Date(a.scheduledAt).toLocaleString()} · Token {a.token}
            </div>
          </div>
          <div className="flex items-center gap-2">
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
    </div>
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
    <div className="space-y-2">
      {error && <p className="text-xs text-brick mb-2">{error}</p>}
      {referrals.length === 0 && <p className="text-sm text-ink-muted">No incoming referrals.</p>}
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
    </div>
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
    <form onSubmit={submit} className="bg-white rounded-2xl border border-mist/60 shadow-sm p-6 max-w-lg">
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

      <div className="mb-4">
        <label className="block text-xs text-ink-muted mb-1.5">Supporting document (optional)</label>
        <input
          type="file"
          accept="image/*,application/pdf"
          onChange={(e) => setFile(e.target.files[0])}
          className="text-sm text-ink-muted"
        />
        <p className="text-xs text-ink-muted mt-1">Lab report, imaging, etc. — stored securely via Cloudinary.</p>
      </div>

      {error && <p className="text-xs text-brick mb-3">{error}</p>}
      {success && <p className="text-xs text-teal mb-3">{success}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-teal hover:bg-teal-dark text-white rounded-full py-2.5 text-sm font-medium transition disabled:opacity-50"
      >
        {submitting ? 'Issuing...' : 'Issue referral'}
      </button>
    </form>
  );
}

export default ClinicianDashboard;
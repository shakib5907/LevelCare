import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';
import Field from '../components/Field';
import api from '../api/client';

function EmergencyConsole() {
  const { user } = useAuth();
  const [tab, setTab] = useState('intake');

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl text-ink">Emergency console</h1>
      <p className="text-sm text-ink-muted mt-1">
        {user?.name} · Intake and dispatch — a pathway separate from routine bookings.
      </p>

      <div className="flex gap-1 border-b border-mist mt-6 mb-6">
        {['intake', 'active calls'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 -mb-px transition ${
              tab === t ? 'border-brick text-brick' : 'border-transparent text-ink-muted hover:text-ink'
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === 'intake' ? <Intake /> : <ActiveCalls />}
    </div>
  );
}

function Intake() {
  const [form, setForm] = useState({ callerName: '', callerPhone: '', location: '', reportedCondition: '' });
  const [error, setError] = useState('');
  const [created, setCreated] = useState(null);

  async function submit(e) {
    e.preventDefault();
    setError('');
    try {
      const call = await api.post('/emergency', form);
      setCreated(call);
      setForm({ callerName: '', callerPhone: '', location: '', reportedCondition: '' });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="bg-white rounded-2xl border border-mist/60 shadow-sm p-6">
        <h2 className="text-lg text-ink mb-4">New call</h2>
        <form onSubmit={submit}>
          <Field label="Caller name" value={form.callerName} onChange={(e) => setForm({ ...form, callerName: e.target.value })} />
          <Field label="Caller phone" value={form.callerPhone} onChange={(e) => setForm({ ...form, callerPhone: e.target.value })} />
          <Field label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Field label="Reported condition" value={form.reportedCondition} onChange={(e) => setForm({ ...form, reportedCondition: e.target.value })} />
          {error && <p className="text-xs text-brick mb-3">{error}</p>}
          <button type="submit" className="w-full bg-brick hover:bg-brick/90 text-white rounded-full py-2.5 text-sm font-medium transition">
            Log call & triage
          </button>
        </form>
      </div>

      {created && <DispatchPanel call={created} onDispatched={() => setCreated(null)} />}
    </div>
  );
}

function DispatchPanel({ call, onDispatched }) {
  const [facilities, setFacilities] = useState([]);
  const [finalLevel, setFinalLevel] = useState(call.suggestedLevel);
  const [receivingFacilityId, setReceivingFacilityId] = useState('');
  const [overrideReason, setOverrideReason] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api.get('/facilities', { level: finalLevel }).then(setFacilities);
  }, [finalLevel]);

  async function dispatch() {
    setError('');
    try {
      await api.patch(`/emergency/${call._id}/dispatch`, {
        finalLevel,
        overrideReason: finalLevel !== call.suggestedLevel ? overrideReason : undefined,
        receivingFacilityId,
      });
      onDispatched();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-brick/30 shadow-sm p-6">
      <h2 className="text-lg text-brick mb-1">Triage & dispatch</h2>
      <p className="text-sm text-ink-muted mb-4">
        Suggested level: <span className="font-medium capitalize text-ink">{call.suggestedLevel}</span>
      </p>

      <div className="mb-4">
        <label className="block text-xs text-ink-muted mb-1.5">Confirm or override level</label>
        <select
          value={finalLevel}
          onChange={(e) => setFinalLevel(e.target.value)}
          className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition"
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="tertiary">Tertiary</option>
          <option value="specialized">Specialized</option>
        </select>
      </div>

      {finalLevel !== call.suggestedLevel && (
        <Field label="Reason for override" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
      )}

      <div className="mb-4">
        <label className="block text-xs text-ink-muted mb-1.5">Receiving facility</label>
        <select
          value={receivingFacilityId}
          onChange={(e) => setReceivingFacilityId(e.target.value)}
          className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition"
        >
          <option value="">Select facility</option>
          {facilities.map((f) => (
            <option key={f._id} value={f._id}>{f.name}</option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-brick mb-3">{error}</p>}

      <button
        onClick={dispatch}
        disabled={!receivingFacilityId}
        className="w-full bg-brick hover:bg-brick/90 text-white rounded-full py-2.5 text-sm font-medium transition disabled:opacity-50"
      >
        Dispatch
      </button>
    </div>
  );
}

function ActiveCalls() {
  const [calls, setCalls] = useState([]);
  const [error, setError] = useState('');

  function load() {
    api.get('/emergency').then(setCalls);
  }
  useEffect(load, []);

  async function markArrived(id) {
    setError('');
    try {
      await api.patch(`/emergency/${id}/status`, { status: 'arrived' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-brick mb-2">{error}</p>}
      {calls.length === 0 && <p className="text-sm text-ink-muted">No calls logged yet.</p>}
      {calls.map((c) => (
        <div key={c._id} className="flex items-center justify-between p-4 rounded-xl border border-mist bg-white">
          <div>
            <div className="text-sm font-medium text-ink">{c.callerName}</div>
            <div className="text-xs text-ink-muted mt-0.5">
              {c.location} · {c.receivingFacility?.name || 'not yet dispatched'}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <StatusPill status={c.status} />
            {c.status === 'dispatched' && (
              <button onClick={() => markArrived(c._id)} className="text-xs px-2 py-1 rounded border border-mist hover:border-teal">
                Mark arrived
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

export default EmergencyConsole;
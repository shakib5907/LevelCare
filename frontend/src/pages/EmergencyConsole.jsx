import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import StatusPill from '../components/StatusPill';
import Field from '../components/Field';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/client';

const TABS = [
  { id: 'intake', label: 'Intake' },
  { id: 'active', label: 'Active calls' },
];

function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-mist/60 shadow-sm p-6 ${className}`}>
      {title && <h2 className="text-lg text-ink mb-4">{title}</h2>}
      {children}
    </div>
  );
}

function EmergencyConsole() {
  const { user } = useAuth();
  const [tab, setTab] = useState('intake');

  return (
    <DashboardLayout
      eyebrow="Emergency operator"
      title={user?.name || 'Console'}
      subtitle="Intake and dispatch — separate from routine bookings"
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
      accent="brick"
    >
      {tab === 'intake' ? <Intake /> : <ActiveCalls />}
    </DashboardLayout>
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card title="New call">
        <form onSubmit={submit}>
          <div className="grid sm:grid-cols-2 gap-x-4">
            <Field label="Caller name" value={form.callerName} onChange={(e) => setForm({ ...form, callerName: e.target.value })} />
            <Field label="Caller phone" value={form.callerPhone} onChange={(e) => setForm({ ...form, callerPhone: e.target.value })} />
          </div>
          <Field label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
          <Field label="Reported condition" value={form.reportedCondition} onChange={(e) => setForm({ ...form, reportedCondition: e.target.value })} />
          {error && <p className="text-xs text-brick mb-3">{error}</p>}
          <button type="submit" className="w-full bg-brick hover:bg-brick/90 text-white rounded-full py-2.5 text-sm font-medium transition">
            Log call & triage
          </button>
        </form>
      </Card>

      {created ? (
        <DispatchPanel call={created} onDispatched={() => setCreated(null)} />
      ) : (
        <Card title="Triage & dispatch">
          <p className="text-sm text-ink-muted">Log a call to see the triage suggestion and dispatch options here.</p>
        </Card>
      )}
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
    <Card className="border-brick/30">
      <h2 className="text-lg text-brick mb-1">Triage & dispatch</h2>
      <p className="text-sm text-ink-muted mb-4">
        Suggested level: <span className="font-medium capitalize text-ink">{call.suggestedLevel}</span>
      </p>

      <div className="grid sm:grid-cols-2 gap-x-4">
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
      </div>

      {finalLevel !== call.suggestedLevel && (
        <Field label="Reason for override" value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} />
      )}

      {error && <p className="text-xs text-brick mb-3">{error}</p>}

      <button
        onClick={dispatch}
        disabled={!receivingFacilityId}
        className="w-full bg-brick hover:bg-brick/90 text-white rounded-full py-2.5 text-sm font-medium transition disabled:opacity-50"
      >
        Dispatch
      </button>
    </Card>
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
    <Card title="Active calls">
      {error && <p className="text-xs text-brick mb-2">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {calls.map((c) => (
          <div key={c._id} className="flex items-center justify-between p-4 rounded-xl border border-mist bg-white">
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink truncate">{c.callerName}</div>
              <div className="text-xs text-ink-muted mt-0.5 truncate">
                {c.location} · {c.receivingFacility?.name || 'not yet dispatched'}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <StatusPill status={c.status} />
              {c.status === 'dispatched' && (
                <button onClick={() => markArrived(c._id)} className="text-xs px-2 py-1 rounded border border-mist hover:border-teal">
                  Mark arrived
                </button>
              )}
            </div>
          </div>
        ))}
        {calls.length === 0 && <p className="text-sm text-ink-muted">No calls logged yet.</p>}
      </div>
    </Card>
  );
}

export default EmergencyConsole;
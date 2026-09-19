import React, { useEffect, useState } from 'react';
import api from '../api/client';

const TABS = ['Analytics', 'Staff verification'];

function AdminDashboard() {
  const [tab, setTab] = useState(TABS[0]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-2xl text-ink">Health authority dashboard</h1>
      <p className="text-sm text-ink-muted mt-1">Referral compliance, filtering, and system-wide visibility.</p>

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

      {tab === 'Analytics' && <Analytics />}
      {tab === 'Staff verification' && <StaffVerification />}
    </div>
  );
}

function Analytics() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/users/analytics').then(setData);
  }, []);

  if (!data) return <p className="text-sm text-ink-muted">Loading...</p>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Referral compliance rate" value={data.referralComplianceRate != null ? `${data.referralComplianceRate}%` : 'n/a'} highlight />
        <StatCard label="Emergency bypass share" value={data.emergencyBypassShare != null ? `${data.emergencyBypassShare}%` : 'n/a'} />
        <StatCard label="Primary-level visits" value={data.primaryVisits} />
        <StatCard label="Secondary-level visits" value={data.secondaryVisits} />
      </div>

      <div className="bg-white rounded-2xl border border-mist/60 shadow-sm p-6">
        <h2 className="text-lg text-ink mb-4">Referral declines by issuer</h2>
        {data.declinedByIssuer.length === 0 && <p className="text-sm text-ink-muted">No declines recorded.</p>}
        <div className="space-y-2">
          {data.declinedByIssuer.map((d) => (
            <div key={d._id} className="flex justify-between text-sm border-b border-mist py-2">
              <span>{d._id}</span>
              <span className="text-ink-muted">{d.count} declined</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, highlight }) {
  return (
    <div className={`bg-white rounded-2xl border shadow-sm p-5 ${highlight ? 'border-teal' : 'border-mist/60'}`}>
      <div className={`text-3xl ${highlight ? 'text-teal' : 'text-ink'}`}>{value}</div>
      <div className="text-xs text-ink-muted mt-1">{label}</div>
    </div>
  );
}

function StaffVerification() {
  const [staff, setStaff] = useState([]);
  const [error, setError] = useState('');

  function load() {
    api.get('/users/staff/pending').then(setStaff);
  }
  useEffect(load, []);

  async function verify(id) {
    setError('');
    try {
      await api.patch(`/users/staff/${id}/verify`);
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-brick mb-2">{error}</p>}
      {staff.length === 0 && <p className="text-sm text-ink-muted">No staff pending verification.</p>}
      {staff.map((s) => (
        <div key={s._id} className="flex items-center justify-between p-4 rounded-xl border border-mist bg-white">
          <div>
            <div className="text-sm font-medium text-ink">{s.name}</div>
            <div className="text-xs text-ink-muted mt-0.5 capitalize">
              {s.role.replace('_', ' ')} {s.facilityName ? `· ${s.facilityName}` : ''}
            </div>
            <div className="text-xs text-ink-muted/70">{s.email}</div>
          </div>
          <button onClick={() => verify(s._id)} className="text-xs px-3 py-1.5 rounded-full bg-teal text-white">
            Verify
          </button>
        </div>
      ))}
    </div>
  );
}

export default AdminDashboard;
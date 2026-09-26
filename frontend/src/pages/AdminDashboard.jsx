import React, { useEffect, useState } from 'react';
import Field from '../components/Field';
import DashboardLayout from '../components/DashboardLayout';
import api from '../api/client';

const TABS = [
  { id: 'analytics', label: 'Analytics' },
  { id: 'staff', label: 'Staff verification' },
  { id: 'facilities', label: 'Facilities' },
];

function Card({ title, children, className = '' }) {
  return (
    <div className={`bg-white rounded-2xl border border-mist/60 shadow-sm p-6 ${className}`}>
      {title && <h2 className="text-lg text-ink mb-4">{title}</h2>}
      {children}
    </div>
  );
}

function AdminDashboard() {
  const [tab, setTab] = useState('analytics');

  return (
    <DashboardLayout
      eyebrow="Health authority"
      title="Admin dashboard"
      subtitle="Referral compliance, filtering, and system-wide visibility"
      tabs={TABS}
      activeTab={tab}
      onTabChange={setTab}
    >
      {tab === 'analytics' && <Analytics />}
      {tab === 'staff' && <StaffVerification />}
      {tab === 'facilities' && <Facilities />}
    </DashboardLayout>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Referral compliance rate" value={data.referralComplianceRate != null ? `${data.referralComplianceRate}%` : 'n/a'} highlight />
        <StatCard label="Emergency bypass share" value={data.emergencyBypassShare != null ? `${data.emergencyBypassShare}%` : 'n/a'} />
        <StatCard label="Primary-level visits" value={data.primaryVisits} />
        <StatCard label="Secondary-level visits" value={data.secondaryVisits} />
      </div>

      <Card title="Referral declines by issuer">
        {data.declinedByIssuer.length === 0 && <p className="text-sm text-ink-muted">No declines recorded.</p>}
        <div className="grid sm:grid-cols-2 gap-2">
          {data.declinedByIssuer.map((d) => (
            <div key={d._id} className="flex justify-between text-sm border border-mist rounded-lg px-3 py-2">
              <span>{d._id}</span>
              <span className="text-ink-muted">{d.count} declined</span>
            </div>
          ))}
        </div>
      </Card>
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
    <Card title="Pending staff verification">
      {error && <p className="text-xs text-brick mb-2">{error}</p>}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {staff.map((s) => (
          <div key={s._id} className="flex items-center justify-between p-4 rounded-xl border border-mist bg-white">
            <div className="min-w-0">
              <div className="text-sm font-medium text-ink truncate">{s.name}</div>
              <div className="text-xs text-ink-muted mt-0.5 capitalize truncate">
                {s.role.replace('_', ' ')} {s.facilityName ? `· ${s.facilityName}` : ''}
              </div>
              <div className="text-xs text-ink-muted/70 truncate">{s.email}</div>
            </div>
            <button onClick={() => verify(s._id)} className="text-xs px-3 py-1.5 rounded-full bg-teal text-white shrink-0 ml-3">
              Verify
            </button>
          </div>
        ))}
        {staff.length === 0 && <p className="text-sm text-ink-muted">No staff pending verification.</p>}
      </div>
    </Card>
  );
}

function Facilities() {
  const [facilities, setFacilities] = useState([]);
  const [form, setForm] = useState({ name: '', level: 'primary', district: '', upazila: '', specialties: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function load() {
    api.get('/facilities').then(setFacilities);
  }
  useEffect(load, []);

  async function create(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await api.post('/facilities', {
        ...form,
        specialties: form.specialties ? form.specialties.split(',').map((s) => s.trim()) : [],
      });
      setSuccess('Facility added.');
      setForm({ name: '', level: 'primary', district: '', upazila: '', specialties: '' });
      load();
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6">
      <Card title="Facility directory">
        <div className="space-y-2">
          {facilities.map((f) => (
            <div key={f._id} className="flex items-center justify-between text-sm border border-mist rounded-lg px-3 py-2.5">
              <span className="font-medium text-ink">{f.name}</span>
              <span className="text-ink-muted capitalize text-xs">{f.level} · {f.upazila}, {f.district}</span>
            </div>
          ))}
          {facilities.length === 0 && <p className="text-sm text-ink-muted">No facilities yet.</p>}
        </div>
      </Card>

      <Card title="Add facility">
        <form onSubmit={create}>
          <Field label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <div className="mb-4">
            <label className="block text-xs text-ink-muted mb-1.5">Level</label>
            <select
              value={form.level}
              onChange={(e) => setForm({ ...form, level: e.target.value })}
              className="w-full bg-white rounded-lg px-3 py-2.5 text-sm text-ink outline-none border border-mist focus:border-teal focus:ring-4 focus:ring-teal-light transition"
            >
              <option value="primary">Primary</option>
              <option value="secondary">Secondary</option>
              <option value="tertiary">Tertiary</option>
              <option value="specialized">Specialized</option>
            </select>
          </div>
          <Field label="District" value={form.district} onChange={(e) => setForm({ ...form, district: e.target.value })} />
          <Field label="Upazila" value={form.upazila} onChange={(e) => setForm({ ...form, upazila: e.target.value })} />
          <Field label="Specialties (comma separated)" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
          {error && <p className="text-xs text-brick mb-3">{error}</p>}
          {success && <p className="text-xs text-teal mb-3">{success}</p>}
          <button type="submit" className="w-full bg-teal hover:bg-teal-dark text-white rounded-full py-2.5 text-sm font-medium transition">
            Add facility
          </button>
        </form>
      </Card>
    </div>
  );
}

export default AdminDashboard;
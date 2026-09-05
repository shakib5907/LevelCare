import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Field from '../components/Field';

const ROLES = [
  { id: 'patient', title: 'Patient', blurb: 'Book visits and hold referrals' },
  { id: 'clinician', title: 'Clinician', blurb: 'Consult and issue referrals' },
  { id: 'paramedic', title: 'Paramedic', blurb: 'Home visits and dispatch' },
  { id: 'operator', title: 'Emergency operator', blurb: 'Triage incoming calls' },
];

function Register() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState('patient');
  const [form, setForm] = useState({});
  const [errors, setErrors] = useState({});
  const [submitted, setSubmitted] = useState(false);

  function set(key) {
    return (e) => setForm({ ...form, [key]: e.target.value });
  }

  function handleSubmit() {
    const next = {};
    if (!form.name?.trim()) next.name = 'Enter your full name.';
    if (!form.phone?.trim()) next.phone = 'Enter your phone number.';
    if (!form.password || form.password.length < 8) next.password = 'Use at least 8 characters.';
    if (role === 'patient' && !form.area?.trim()) next.area = 'Enter your area.';
    if (role === 'clinician' && !form.bmdc?.trim()) next.bmdc = 'Enter your BMDC number.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    setSubmitted(true);
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg bg-white rounded-2xl border border-mist/60 shadow-sm p-8">

        {!submitted && (
          <div className="flex items-center gap-2 mb-6">
            <div className="h-1 flex-1 rounded-full bg-teal" />
            <div className={`h-1 flex-1 rounded-full ${step === 2 ? 'bg-teal' : 'bg-mist'}`} />
            <span className="text-xs text-ink-muted whitespace-nowrap ml-1">Step {step} of 2</span>
          </div>
        )}

        {submitted && (
          <div className="text-center py-4">
            <div className="w-11 h-11 rounded-full bg-teal-light inline-flex items-center justify-center text-teal-dark text-xl">
              ✓
            </div>

            <h1 className="text-xl text-ink mt-3">
              {role === 'patient' ? 'Account created' : 'Awaiting verification'}
            </h1>

            <p className="text-sm text-ink-muted mt-2 leading-relaxed">
              {role === 'patient'
                ? 'You can sign in now and book your first appointment at a primary facility.'
                : 'Your account exists, but an administrator has to confirm your credentials before you can sign in.'}
            </p>

            <div className="bg-parchment rounded-lg p-4 mt-4 text-left">
              <div className="flex justify-between text-sm py-1">
                <span className="text-ink-muted">Name</span>
                <span className="text-ink font-medium">{form.name}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-ink-muted">Role</span>
                <span className="text-ink font-medium">{ROLES.find((r) => r.id === role).title}</span>
              </div>
              <div className="flex justify-between text-sm py-1">
                <span className="text-ink-muted">Phone</span>
                <span className="text-ink font-medium">{form.phone}</span>
              </div>
            </div>

            <Link
              to="/login"
              className="inline-block bg-teal hover:bg-teal-dark text-white rounded-full px-6 py-2.5 text-sm font-medium transition mt-5"
            >
              Go to login
            </Link>
          </div>
        )}

        {!submitted && step === 1 && (
          <>
            <h1 className="text-2xl text-ink">How will you use LevelCare?</h1>
            <p className="text-sm text-ink-muted mt-1 mb-5">
              Staff accounts need approval from an administrator before first sign-in.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {ROLES.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setRole(r.id)}
                  
                  className={`text-left rounded-xl p-4 border-2 transition ${
                    role === r.id
                      ? 'bg-teal-light border-teal'
                      : 'bg-white border-mist hover:border-ink/20'
                  }`}
                >
                  <div className="text-sm font-medium text-ink">{r.title}</div>
                  <div className={`text-xs mt-1 ${role === r.id ? 'text-teal-dark' : 'text-ink-muted'}`}>
                    {r.blurb}
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => setStep(2)}
                className="bg-teal hover:bg-teal-dark text-white rounded-full px-6 py-2.5 text-sm font-medium transition"
              >
                Continue →
              </button>
            </div>
          </>
        )}

        {!submitted && step === 2 && (
          <>
            <h1 className="text-2xl text-ink">Your details</h1>

            <div className="inline-flex items-center gap-2 bg-teal-light rounded-full px-3 py-1 mt-2 mb-4">
              <span className="text-xs font-medium text-teal-dark">
                {ROLES.find((r) => r.id === role).title}
              </span>
              <button
                onClick={() => setStep(1)}
                className="text-xs text-teal-dark/70 hover:text-teal-dark underline"
              >
                change
              </button>
            </div>

            <div className="grid grid-cols-2 gap-x-3">
              <Field label="Full name" placeholder="Your name" value={form.name || ''} onChange={set('name')} error={errors.name} />
              <Field label="Phone number" placeholder="01712 345678" value={form.phone || ''} onChange={set('phone')} error={errors.phone} />
            </div>

            {role === 'patient' && (
              <div className="grid grid-cols-2 gap-x-3">
                <Field label="Date of birth" type="date" value={form.dob || ''} onChange={set('dob')} />
                <Field label="Upazila / area" placeholder="Savar, Dhaka" value={form.area || ''} onChange={set('area')} error={errors.area} />
              </div>
            )}

            {role === 'clinician' && (
              <div className="grid grid-cols-2 gap-x-3">
                <Field label="BMDC number" placeholder="A-64821" value={form.bmdc || ''} onChange={set('bmdc')} error={errors.bmdc} />
                <Field label="Specialty" placeholder="General medicine" value={form.specialty || ''} onChange={set('specialty')} />
                <Field label="Facility" placeholder="Health complex" value={form.facility || ''} onChange={set('facility')} />
                <Field label="Work email" type="email" placeholder="name@gov.bd" value={form.email || ''} onChange={set('email')} />
              </div>
            )}

            {role === 'paramedic' && (
              <div className="grid grid-cols-2 gap-x-3">
                <Field label="Staff ID" placeholder="PM-2841" value={form.staffId || ''} onChange={set('staffId')} />
                <Field label="Base facility" placeholder="Health complex" value={form.facility || ''} onChange={set('facility')} />
              </div>
            )}

            {role === 'operator' && (
              <div className="grid grid-cols-2 gap-x-3">
                <Field label="Operator ID" placeholder="OP-119" value={form.staffId || ''} onChange={set('staffId')} />
                <Field label="Control room" placeholder="Dhaka Division" value={form.controlRoom || ''} onChange={set('controlRoom')} />
              </div>
            )}

            <Field
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              value={form.password || ''}
              onChange={set('password')}
              error={errors.password}
            />

            <div className="flex gap-2 mt-6">
              <button
                onClick={() => setStep(1)}
                className="border border-mist text-ink-muted rounded-full px-5 py-2.5 text-sm hover:border-ink/20 transition"
              >
                Back
              </button>
              <button
                onClick={handleSubmit}
                className="bg-teal hover:bg-teal-dark text-white rounded-full px-6 py-2.5 text-sm font-medium transition"
              >
                Create account
              </button>
            </div>
          </>
        )}

        {!submitted && (
          <p className="text-sm text-ink-muted text-center mt-6">
            Already registered?{' '}
            <Link to="/login" className="text-teal font-medium">Log in</Link>
          </p>
        )}

      </div>
    </div>
  );
}

export default Register;
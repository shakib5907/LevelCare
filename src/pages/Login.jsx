import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Field from '../components/Field';

function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});

  function handleSubmit() {
    const next = {};
    if (!identifier.trim()) next.identifier = 'Enter your phone number or email.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    console.log('login', { identifier, password });
  }

  return (
        <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-mist/60 shadow-sm p-8">
        <h1 className="text-3xl text-ink mb-1">Welcome back</h1>
        <p className="text-sm text-ink-muted mb-8">
          Sign in to book, refer, or respond.
        </p>

        <Field
          label="Phone number or email"
          placeholder="01712 345678"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          error={errors.identifier}
        />

        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-teal hover:bg-teal-dark text-white rounded-full py-3 text-sm font-medium transition"
        >
          Log in
        </button>

        <p className="text-sm text-ink-muted text-center mt-4">
          New here?{' '}
          <Link to="/register" className="text-teal font-medium">
            Create an account
          </Link>
        </p>

        <div className="border-t border-mist mt-8 pt-4">
          <p className="text-xs text-brick text-center">
            Medical emergency? Call <span className="font-semibold">999</span> — no account needed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
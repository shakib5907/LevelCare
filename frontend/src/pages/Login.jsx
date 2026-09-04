import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Field from '../components/Field';
import { useAuth } from '../context/AuthContext';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    const next = {};
    if (!email.trim()) next.email = 'Enter your email.';
    if (!password) next.password = 'Enter your password.';
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setLoading(true);
    try {
      await login(email.trim(), password);
      navigate('/');
    } catch (err) {
      setErrors({ form: err.message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white rounded-2xl border border-mist/60 shadow-sm p-8">
        <h1 className="text-3xl text-ink mb-1">Welcome back</h1>
        <p className="text-sm text-ink-muted mb-8">
          Sign in to book, refer, or respond.
        </p>

        <Field
          label="Email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
        />

        <Field
          label="Password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={errors.password}
        />

        {errors.form && <p className="text-xs text-brick -mt-2 mb-4">{errors.form}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-teal hover:bg-teal-dark text-white rounded-full py-3 text-sm font-medium transition disabled:opacity-50"
        >
          {loading ? 'Logging in...' : 'Log in'}
        </button>

        <p className="text-sm text-ink-muted text-center mt-4">
          New here?{' '}
          <Link to="/register" className="text-teal font-medium">
            Create an account
          </Link>
        </p>

        <div className="border-t border-mist mt-8 pt-5">
          <p className="text-xs text-ink-muted text-center mb-2">
            Medical emergency? Don't wait to sign in.
          </p>
          <a href="tel:999" className="flex items-center justify-center w-full bg-brick-light hover:bg-brick text-brick hover:text-white border border-brick/30 rounded-full py-2.5 text-sm font-medium transition">
            Call 999 now
          </a>
        </div>
      </div>
    </div>
  );
}

export default Login;
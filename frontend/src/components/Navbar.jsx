import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const isAuthPage = pathname === '/login' || pathname === '/register';

  async function handleLogout() {
    await logout();
    navigate('/');
  }

  return (
    <header className="bg-teal">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="px-5 py-2 rounded-full text-sm font-medium bg-teal text-white    hover:bg-teal-dark transition">
          LevelCare
        </Link>

        <div className="flex items-center gap-8">
          <nav className="hidden md:flex items-center gap-8 text-sm text-ink/70">
            <Link to="/" className="px-5 py-2 rounded-full text-sm font-medium bg-teal text-white hover:bg-teal-dark transition">
              Home
            </Link>
            <Link to="/how-it-works" className="px-5 py-2 rounded-full text-sm font-medium bg-teal text-white hover:bg-teal-dark transition">
              How It Works
            </Link>
          </nav>

          {!loading && (
            <div className={`items-center gap-3 ${isAuthPage ? 'hidden' : 'flex'}`}>
              {user ? (
                <>
                  <span className="text-sm text-white/80 hidden sm:inline">
                    {user.name}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="px-5 py-2 rounded-full text-sm font-medium bg-white text-teal hover:bg-white/90 transition"
                  >
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="px-5 py-2 rounded-full text-sm font-medium bg-teal text-white hover:bg-teal-dark transition">
                    Login
                  </Link>
                  <Link to="/register" className="px-5 py-2 rounded-full text-sm font-medium bg-teal text-white hover:bg-teal-dark transition">
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
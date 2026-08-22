import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function Navbar() {
  const { pathname } = useLocation();
  const isAuthPage = pathname === '/login' || pathname === '/register';
   return (
    <header className="bg-teal">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="px-5 py-2 rounded-full text-sm font-medium bg-teal text-white hover:bg-teal-dark transition">
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

                    <div className={`items-center gap-3 ${isAuthPage ? 'hidden' : 'flex'}`}>
            <Link to="/login" className="px-5 py-2 rounded-full text-sm font-medium text-ink border border-ink/15 hover:border-ink/30 transition">
              Login
            </Link>
            <Link to="/register" className="px-5 py-2 rounded-full text-sm font-medium bg-teal text-white hover:bg-teal-dark transition">
              Sign Up
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
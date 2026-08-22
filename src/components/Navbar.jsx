import React from 'react';
import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="border-b border-ink/10 bg-parchment/95 backdrop-blur sticky top-0 z-20">
      <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
        <Link to="/" className="font-display text-xl text-teal">LevelCare</Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link to="/how-it-works" className="hover:text-teal">How it works</Link>
        </nav>
      </div>
    </header>
  );
}
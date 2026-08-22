import React from 'react';
import { Link } from 'react-router-dom';
import CareLadder from '../components/CareLadder';

export default function Landing() {
  return (
    <div>
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 pt-16 pb-20 grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="uppercase tracking-widest text-xs text-brick font-semibold mb-4">
            A referral &amp; triage system for tiered public health networks
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-tight text-ink mb-5">
            The right care,<br />at the right level.
          </h1>
          <p className="text-ink/70 text-lg mb-8 max-w-md">
            Bangladesh's public health system already has four tiers. LevelCare is the
            coordination layer that makes patients move between them the way the system was
            designed to — verified, scheduled, and enforced.
          </p>
          <div className="flex gap-4">
            <Link to="/register" className="px-5 py-3 rounded bg-teal text-parchment font-medium hover:bg-teal-dark transition">
              Register
            </Link>
            <Link to="/how-it-works" className="px-5 py-3 rounded border border-ink/20 hover:border-teal hover:text-teal transition">
              How the pathway works
            </Link>
          </div>
          <p className="mt-6 text-sm text-ink/50">
            Emergency? Call your national emergency line first. This platform coordinates
            routine referrals and dispatch records — it is not a substitute for calling for help.
          </p>
        </div>
        <div className="bg-white border border-ink/10 rounded-lg p-8">
          <p className="text-xs uppercase tracking-widest text-ink/40 mb-4">A patient may book freely at</p>
          <CareLadder activeLevel="primary" />
          <p className="text-xs text-ink/40 mt-4">
            Booking above primary level always requires a valid electronic referral from the level below.
          </p>
        </div>
      </section>

      {/* Problem framing */}
      <section className="bg-teal-light/40 border-y border-ink/10">
        <div className="max-w-6xl mx-auto px-5 py-16 grid md:grid-cols-3 gap-8">
          <div>
            <div className="font-display text-3xl text-brick mb-2">50–60</div>
            <p className="text-ink/70 text-sm">patients a single tertiary-hospital doctor may see in one day, because routine cases bypass primary care entirely.</p>
          </div>
          <div>
            <div className="font-display text-3xl text-brick mb-2">0</div>
            <p className="text-ink/70 text-sm">digital systems today record, verify, or enforce a referral between levels — paper slips are unverifiable and untracked.</p>
          </div>
          <div>
            <div className="font-display text-3xl text-brick mb-2">2</div>
            <p className="text-ink/70 text-sm">separate pathways LevelCare maintains: routine referral bookings, and a faster, structurally distinct emergency dispatch pathway.</p>
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="max-w-6xl mx-auto px-5 py-16">
        <h2 className="font-display text-2xl text-ink mb-8">Built for everyone in the pathway</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            ['Patients', 'Book at your primary facility, track referrals, and see your full care history in one place.'],
            ['General Practitioners', 'Issue verified electronic referrals to the next level with reason, urgency, and clinical summary.'],
            ['Secondary & Tertiary Clinicians', 'Accept or decline incoming referrals, and refer onward when a case needs it.'],
            ['Emergency Operators', 'Take the call, confirm or override the suggested level, and dispatch to the right facility.'],
            ['Paramedics', 'Support pre-primary and home-visit pathways for immobile and elderly patients.'],
            ['Health Authorities', 'See referral compliance, emergency bypass volume, and underserved areas as they happen.'],
          ].map(([title, desc]) => (
            <div key={title} className="border border-ink/10 rounded-lg p-5 bg-white">
              <h3 className="font-display text-lg text-teal mb-2">{title}</h3>
              <p className="text-sm text-ink/70">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="border-t border-ink/10 mt-8">
        <div className="max-w-6xl mx-auto px-5 py-8 flex flex-col sm:flex-row justify-between gap-3 text-sm text-ink/50">
          <span>LevelCare — a coordination layer for existing tiers of care.</span>
          <span>Software Development-III, CSE2200</span>
        </div>
      </footer>
    </div>
  );
}

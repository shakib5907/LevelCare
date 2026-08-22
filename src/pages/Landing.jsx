import React from 'react';
import { Link } from 'react-router-dom';

export default function Landing() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -right-24 h-96 w-96 rounded-full bg-teal/10 blur-3xl" />

      <section className="relative max-w-6xl mx-auto px-6 pt-16 pb-24 grid md:grid-cols-2 gap-16 items-center">
        <div>
          <h1 className="font-display font-bold text-5xl md:text-6xl leading-[1.08] text-ink mb-6">
            Get the right care,<br />at the right level.
          </h1>
          <p className="text-ink/60 text-lg mb-8 max-w-md">
            Supports patients with simple booking, verified referrals, and a
            single view of your care across every level of the health system.
          </p>

          <form className="flex flex-col sm:flex-row gap-3 max-w-md mb-8" onSubmit={(e) => e.preventDefault()}>
            <input
              type="email"
              placeholder="Your email address"
              className="flex-1 px-4 py-3 rounded-full border border-ink/15 bg-white text-sm placeholder:text-ink/40 focus:outline-none focus:ring-2 focus:ring-teal/30"
            />
            <Link to="/register" className="px-6 py-3 rounded-full bg-teal text-white text-sm font-medium hover:bg-teal-dark transition text-center whitespace-nowrap">
              Get Started →
            </Link>
          </form>

          <p className="text-xs uppercase tracking-widest text-ink font-bold mb-3">Built across every level</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-ink font-display font-bold text-lg">
            <span>Primary</span>
            <span>Secondary</span>
            <span>Tertiary</span>
            <span>Specialized</span>
          </div>
        </div>

        <div className="relative h-[420px]">
          <div className="absolute left-0 top-8 w-80 rounded-2xl bg-white shadow-xl p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-10 w-10 rounded-full bg-teal flex items-center justify-center text-white text-sm font-medium">
                AR
              </div>
              <div>
                <div className="text-sm font-medium text-ink">Aniruddha Roy Arka</div>
                <div className="text-xs text-ink/40">aniruddharka@levelcare.local</div>
              </div>
            </div>

            <div className="mb-5">
              <div className="text-xs text-ink/40 mb-1">Referral</div>
              <div className="font-display text-2xl text-ink">Secondary Level</div>
              <div className="text-xs text-ink/40 mt-1">Valid until Dec 2026</div>
            </div>

            <div className="space-y-2 mb-5">
              <div className="flex items-center justify-between rounded-lg border border-teal/30 bg-teal-light/40 px-3 py-2.5">
                <span className="text-sm text-ink">Primary visit</span>
                <span className="h-4 w-4 rounded-full border-2 border-teal bg-teal" />
              </div>
              <div className="flex items-center justify-between rounded-lg border border-ink/10 px-3 py-2.5">
                <span className="text-sm text-ink/60">Referral required</span>
                <span className="h-4 w-4 rounded-full border-2 border-ink/20" />
              </div>
            </div>

            <button className="w-full py-3 rounded-lg bg-ink text-white text-sm font-medium">
              Book Appointment
            </button>
          </div>

          <div className="absolute right-0 top-0 w-56 rounded-2xl bg-teal text-white shadow-2xl p-5 rotate-3">
            <div className="text-xs text-white/70 mb-1">Appointment Token</div>
            <div className="font-display text-3xl mb-8">PRI-014</div>
            <div className="flex items-center justify-between text-xs">
              <span className="uppercase tracking-wide bg-white/15 rounded px-2 py-1">Primary</span>
              <span className="text-white/70">9:30 AM</span>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink/10 bg-white/50">
        <div className="max-w-6xl mx-auto px-6 py-14 grid sm:grid-cols-3 gap-8">
          <Stat value="50–60" label="patients a single tertiary doctor may see in a day, when routine cases bypass primary care" />
          <Stat value="0" label="digital systems today verify or enforce a referral between levels" />
          <Stat value="2" label="pathways LevelCare runs: routine referral bookings, and emergency dispatch" />
        </div>
      </section>

      <section id="roles" className="max-w-6xl mx-auto px-6 py-20">
        <h2 className="font-display text-3xl text-ink mb-10">Built for everyone in the pathway</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
          {[
            ['Patients', 'Book at your primary facility, track referrals, and see your full care history in one place.'],
            ['General Practitioners', 'Issue verified electronic referrals to the next level with reason, urgency, and clinical summary.'],
            ['Secondary & Tertiary Clinicians', 'Accept or decline incoming referrals, and refer onward when a case needs it.'],
            ['Emergency Operators', 'Confirm or override the suggested level, and dispatch to the right facility.'],
            ['Paramedics', 'Support pre-primary and home-visit pathways for immobile and elderly patients.'],
            ['Health Authorities', 'See referral compliance, emergency bypass volume, and underserved areas as they happen.'],
          ].map(([title, desc]) => (
            <div key={title} className="rounded-2xl bg-white p-6 shadow-sm">
              <h3 className="font-display text-lg text-ink mb-2">{title}</h3>
              <p className="text-sm text-ink/60">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer id="footer" className="border-t border-ink/10">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between gap-3 text-sm text-ink/40">
          <span>LevelCare - a coordination layer for existing tiers of care.</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div className="font-display text-4xl text-ink mb-2">{value}</div>
      <p className="text-sm text-ink/60">{label}</p>
    </div>
  );
}
import React from 'react';
import CareLadder from '../components/CareLadder';

export default function HowItWorks() {
  return (
    <div className="max-w-4xl mx-auto px-5 py-16">
      <h1 className="font-display text-3xl text-ink mb-6">How the referral pathway works</h1>
      <p className="text-ink/70 mb-10 max-w-2xl">
        Every facility in the network belongs to one of four levels. Moving up a level always
        requires a referral issued by a clinician at the level below. The rule is enforced by
        the system, not by trust in a paper slip.
      </p>

      <div className="grid md:grid-cols-2 gap-10 items-start">
        <CareLadder />
        <div className="space-y-6">
          <Step
            n="1"
            title="Book at your primary facility"
            body="Every patient can book a general practitioner appointment at their assigned primary facility at any time — no referral needed."
          />
          <Step
            n="2"
            title="A GP issues a referral, if needed"
            body="If your condition needs a higher level of care, your GP issues an electronic referral: target level, required specialty, reason, and a validity period."
          />
          <Step
            n="3"
            title="The next-level clinician accepts or declines"
            body="A clinician at the receiving facility reviews the referral. If declined, the reason is recorded and visible to you."
          />
          <Step
            n="4"
            title="You book with the referral attached"
            body="The system will not let you book at secondary, tertiary, or specialized level without a valid, unused referral targeting that exact level. Once used, it's marked consumed and permanently linked to your appointment."
          />
          <div className="border-l-4 border-brick pl-4 py-1">
            <p className="text-sm text-ink/70">
              <strong className="text-brick">Emergencies bypass this pathway entirely.</strong> Calls
              go straight to an emergency operator, who confirms or overrides the suggested level and
              dispatches you directly to the right facility.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step({ n, title, body }) {
  return (
    <div className="flex gap-4">
      <div className="font-display text-xl text-teal w-8 shrink-0">{n}</div>
      <div>
        <h3 className="font-medium text-ink mb-1">{title}</h3>
        <p className="text-sm text-ink/70">{body}</p>
      </div>
    </div>
  );
}

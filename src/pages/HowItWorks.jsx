import React from 'react';
import CareLadder from '../components/CareLadder';

export default function HowItWorks() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 lg:py-20">

      {/* Hero Image */}
      <img
        src="https://palmmedicalcenters.com/wp-content/uploads/2022/12/iStock-493216309.jpg"
        alt="How LevelCare works?"
        className="w-full h-56 sm:h-72 md:h-80 lg:h-96 object-cover object-top rounded-2xl mb-10 sm:mb-14 shadow-md"
      />

      {/* Header */}
      <div className="max-w-3xl mb-10">
        <p className="text-sm font-medium text-teal mb-3 uppercase tracking-wide">
          Simple. Connected. Care.
        </p>

        <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl text-ink leading-tight mb-5">
          How the referral pathway works
        </h1>

        <p className="text-base sm:text-lg text-ink/70 leading-relaxed">
          LevelCare connects patients, clinicians, and healthcare facilities
          through a simple referral pathway. Start at your primary facility
          and move to the right level of care when you need it.
        </p>
      </div>

      {/* Simple Care Journey */}
      <div className="mb-12">
        <h2 className="text-xl sm:text-2xl font-semibold text-ink mb-5">
          Your care journey
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

          <div className="p-4 rounded-lg bg-teal/10 text-center">
            <div className="text-2xl font-bold text-teal">01</div>
            <p className="font-medium text-ink mt-2">Book</p>
            <p className="text-sm text-ink/60 mt-1">
              Visit your primary facility
            </p>
          </div>

          <div className="p-4 rounded-lg bg-teal/10 text-center">
            <div className="text-2xl font-bold text-teal">02</div>
            <p className="font-medium text-ink mt-2">Referral</p>
            <p className="text-sm text-ink/60 mt-1">
              Get referred when needed
            </p>
          </div>

          <div className="p-4 rounded-lg bg-teal/10 text-center">
            <div className="text-2xl font-bold text-teal">03</div>
            <p className="font-medium text-ink mt-2">Review</p>
            <p className="text-sm text-ink/60 mt-1">
              Referral is reviewed
            </p>
          </div>

          <div className="p-4 rounded-lg bg-teal/10 text-center">
            <div className="text-2xl font-bold text-teal">04</div>
            <p className="font-medium text-ink mt-2">Care</p>
            <p className="text-sm text-ink/60 mt-1">
              Book your appointment
            </p>
          </div>

        </div>
      </div>

      {/* Care Ladder + Steps */}
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-start">

        {/* Care Ladder */}
        <div>
          <CareLadder />
        </div>

        {/* Steps */}
        <div className="space-y-5">

          <Step
            n="01"
            title="Start with your primary facility"
            body="Book a general practitioner appointment at your assigned primary facility whenever you need care. No referral is required."
          />

          <Step
            n="02"
            title="Get a referral when needed"
            body="If your condition requires specialized care, your GP creates a digital referral with the required specialty, target level, reason, and validity period."
          />

          <Step
            n="03"
            title="Your referral is reviewed"
            body="A clinician at the receiving facility reviews your referral and accepts or declines it. If declined, the reason is recorded and made visible to you."
          />

          <Step
            n="04"
            title="Book your next appointment"
            body="Once approved, you can book an appointment at the referred level. Your referral stays linked to the appointment and is automatically marked as used."
          />

        </div>
      </div>


      {/* Emergency Footer */}
      <div className="mt-16 sm:mt-20">

        <div className="rounded-2xl bg-brick/10 border border-brick/20 p-6 sm:p-8 lg:p-10">

          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">

            {/* Emergency Icon */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 rounded-full bg-brick/10 flex items-center justify-center text-3xl">
                🚨
              </div>
            </div>

            {/* Emergency Text */}
            <div className="text-center sm:text-left">

              <p className="text-xs font-semibold text-brick uppercase tracking-widest mb-2">
                Emergency Care
              </p>

              <h2 className="font-display text-2xl sm:text-3xl text-ink mb-3">
                Emergencies are different.
              </h2>

              <p className="text-sm sm:text-base text-ink/70 leading-relaxed max-w-3xl">
                In an emergency, you don't need to follow the referral
                pathway. Contact the emergency operator and you'll be
                directed to the appropriate facility immediately.
              </p>

            </div>

          </div>

        </div>

        {/* Bottom Text */}
        <div className="text-center mt-8">
          <p className="text-sm text-ink/50">
            LevelCare — connecting every level of care.
          </p>
        </div>

      </div>

    </div>
  );
}


function Step({ n, title, body }) {
  return (
    <div className="flex gap-4 p-5 rounded-lg border border-ink/10 bg-white hover:shadow-md">

      {/* Number */}
      <div className="flex-shrink-0">
        <div className="w-10 h-10 rounded-full bg-teal/10 flex items-center justify-center">
          <span className="font-semibold text-teal">
            {n}
          </span>
        </div>
      </div>

      {/* Text */}
      <div>
        <h3 className="font-semibold text-lg text-ink mb-2">
          {title}
        </h3>

        <p className="text-sm text-ink/65 leading-relaxed">
          {body}
        </p>
      </div>

    </div>
  );
}
# LevelCare - The Right Care, At The Right Level

A structured healthcare referral and triage system for Bangladesh's tiered
public health network, built for **Software Development-III (CSE2200)**.

Bangladesh's public health system already has four levels of care -
community clinics, upazila/district hospitals, medical college hospitals,
and specialized institutes - but nothing digitally records, verifies, or
enforces movement between them. Patients bypass primary care and overwhelm
tertiary hospitals, while smaller facilities sit underused. LevelCare is the
coordination layer that makes the existing tiers function as designed:
referrals are issued, verified, and consumed by the system itself, not
trusted to an unverifiable paper slip.

## Stack

- **MongoDB** + Mongoose — data layer
- **Express.js 5** - REST API (`/backend`)
- **React 19** (Vite) + **Tailwind CSS v4** - frontend (`/frontend`)
- **JWT authentication**, delivered via an `httpOnly` cookie rather than a
  manually-attached header - the cookie is set on login/registration and
  sent automatically by the browser on every request
- **Cloudinary** + **Multer** - referral supporting-document uploads (lab
  reports, imaging, etc.)

## Project structure

```
LevelCare/
  backend/
    index.js                  Express app entry, Cloudinary config, DB connection
    seed.js                   One-time setup: admin account + starter facilities
    model/                    User, Facility, Referral, Appointment, EmergencyCall
    controller/                auth, users, facilities, referrals, appointments, emergency
    routes/                     one router per resource, mounted in index.js
    middlewares/                checkToken (JWT), checkRole (RBAC), multer, logger
    utils/                       password hashing, temp-upload cleanup
  frontend/
    src/
      pages/                   Landing, HowItWorks, Login, Register,
                               PatientDashboard, ClinicianDashboard,
                               EmergencyConsole, AdminDashboard
      components/              Navbar, DashboardLayout (shared sidebar+content
                               shell used by every dashboard), GuestOnlyRoute,
                               RequireRole, CareLadder, Field, StatusPill
      context/AuthContext.jsx  current-user session state
      api/client.js            fetch wrapper (cookie-based auth, query params,
                               multipart upload support)
```

## How the referral system works (the core of the project)

1. **Booking at primary level is always allowed** — no referral needed.
2. **Booking at secondary, tertiary, or specialized level requires a
   referral** that belongs to the patient making the booking, targets that
   exact level, and is still `issued` (not already used, declined, or past
   its `validUntil` date). The server enforces this - see
   `createAppointment` in `backend/controller/appointmentController.js`.
3. **A referral is issued by a GP or clinician** to the level directly above
   their own (`facilityLevel` on their account), with a reason, optional
   required specialty, urgency, and an optional supporting document
   uploaded to Cloudinary.
4. **On successful booking, the referral is marked `used`** and permanently
   linked to the appointment - it cannot be reused, even if that
   appointment is later cancelled, so the audit trail stays honest.
5. **Emergency calls bypass this pathway entirely.** An operator logs a
   call, the system suggests a triage level by keyword matching, the
   operator confirms or overrides it (with a required reason if overridden),
   and dispatches to a specific facility.
6. **Staff accounts require administrator verification** before they can
   act on referrals or appointments - enforced in `checkRole` and reflected
   in the dashboard UI for unverified staff.

## Features by role

- **Patient** - register, book a primary-level visit anytime, search/filter
  facilities, hold and spend referrals, reschedule or cancel appointments,
  filter appointment history by status, and a combined **Care History**
  timeline merging visits, referrals, and emergency calls chronologically.
- **GP / Clinician** - mark consultations started/completed, issue
  referrals (with optional document upload), accept or decline incoming
  referrals with a recorded reason, and view emergency admissions routed to
  their facility level.
- **Emergency Operator** - intake console with keyword-based triage
  suggestion, confirm/override the suggested level, dispatch to a specific
  facility, track active calls through to arrival.
- **Administrator** - analytics dashboard (referral compliance rate,
  primary/secondary visit counts, emergency bypass share, referral declines
  by issuer), staff verification queue, and a facility directory with the
  ability to add new facilities.

All four dashboards share one landscape layout (`DashboardLayout.jsx`) —
sidebar for identity and tab navigation, wide multi-column content area —
rather than a narrow centered column.

## Running it locally

### Prerequisites
- Node.js 18+
- A MongoDB database (MongoDB Atlas free tier works well)
- A Cloudinary account (free tier) for referral document uploads

### 1. Backend

```bash
cd backend
npm install
```

Create `backend/.env`:
```
PORT=4000
ENV=development
DATABASE_URL=your_mongodb_connection_string
JWT_SECRET=any_long_random_string
ALLOWED_ORIGIN=http://localhost:5173
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

Start the API:
```bash
npm run dev
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173`. The frontend talks to the API at
`http://localhost:4000/api` by default (override with a `VITE_API_URL` env
var if needed).

### 3. Try the full loop
1. Register as a patient, book a primary visit at the seeded Mirpur clinic
2. Register as a GP or clinician (pick a facility level), log in as the
   seeded admin, verify the new staff account
3. As the GP, mark that appointment completed, then issue a referral to
   secondary level (optionally attach a document)
4. As a clinician registered at secondary level, accept the referral
5. Back as the patient, book the secondary facility - the referral is now
   required and gets consumed on booking
6. As the admin, check the analytics tab - the referral compliance rate
   should reflect it

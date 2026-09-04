# Ceylon Explorer

A polished full-stack travel platform for discovering Sri Lankan destinations, finding local tour drivers, and managing trip bookings.

## Highlights

- Curated destination discovery with live search
- Driver search, vehicle filters, and multi-day availability
- Secure JWT authentication with bcrypt password hashing
- Multi-day booking lifecycle: request, accept/reject, cancel, and complete
- Transactional per-day locks that prevent overlapping concurrent bookings
- Server-calculated trip duration and price snapshots
- Linked and role-protected driver accounts with a functional driver portal
- Responsive, accessible UI with loading, empty, success, and error states
- Image upload support for driver profiles
- API security headers, CORS configuration, and authentication rate limiting
- Seed command for a presentation-ready demo
- Role-protected admin dashboard for destinations, drivers, bookings, and operational metrics

## Stack

**Frontend:** React 19, React Router, Tailwind CSS, Axios, Lucide icons, Vite  
**Backend:** Node.js, Express 5, MongoDB Atlas, Mongoose, JWT, bcrypt, Multer  
**Quality:** ESLint, Node test runner, production build validation

## Architecture

```text
React SPA → Axios API client → Express routes → Controllers → Mongoose → MongoDB Atlas
```

## Local setup

### Backend

```powershell
cd tour-guide-backend
Copy-Item .env.example .env
npm install
npm run migrate:phase1
npm run seed
npm run create-admin
npm run dev
```

Update `.env` with your Atlas connection string, secure JWT secret, and `SEED_DEMO_PASSWORD` first. Add your current IP address in Atlas Network Access. Existing databases created before Phase 1 must run `npm run migrate:phase1` once before starting the upgraded app.

To create the admin account, also set `ADMIN_NAME`, `ADMIN_EMAIL`, and an `ADMIN_PASSWORD` of at least 12 characters. Run `npm run create-admin`, then sign in with those credentials. Admin privileges cannot be obtained through public registration.

### Frontend

```powershell
cd tour-guide-frontend
Copy-Item .env.example .env
npm install
npm run dev
```

Open `http://localhost:5173`.

## Commands

| Project | Command | Purpose |
|---|---|---|
| Backend | `npm run dev` | Start API with auto-reload |
| Backend | `npm test` | Run business-logic tests |
| Backend | `npm run seed` | Add demo destinations and drivers |
| Backend | `npm run create-admin` | Create or update the configured admin account |
| Backend | `npm run migrate:phase1` | Upgrade legacy drivers/bookings and replace the old date index |
| Frontend | `npm run dev` | Start the Vite development server |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm run build` | Create a production build |

## Core API

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/places` | List destinations |
| GET | `/api/drivers?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD` | Find drivers available for an entire date range |
| POST | `/api/auth/register-driver` | Submit a linked driver application |
| POST | `/api/bookings/add` | Traveler creates a pending multi-day request |
| GET | `/api/bookings/mine` | List the current user's bookings |
| GET | `/api/bookings/mine/:id` | View an owned booking |
| PATCH | `/api/bookings/:id/cancel` | Cancel the current user's booking |
| GET | `/api/driver/profile` | Driver views their linked profile |
| PUT | `/api/driver/profile` | Driver updates their profile |
| GET | `/api/driver/bookings` | Driver views assigned requests and trips |
| PATCH | `/api/driver/bookings/:id/accept` | Driver confirms an owned pending request |
| PATCH | `/api/driver/bookings/:id/reject` | Driver rejects an owned pending request |
| PATCH | `/api/driver/bookings/:id/complete` | Driver completes an eligible owned trip |
| GET | `/api/admin/dashboard` | Admin metrics and upcoming bookings |
| GET | `/api/admin/bookings` | Admin view of all bookings |

## Booking workflow

```text
pending → confirmed → completed
       ↘ rejected
pending or confirmed → cancelled
```

New requests are `pending`. Pending and confirmed bookings block the driver for every inclusive date in the range. Rejected, cancelled, and completed records release their date locks. Drivers can only act on bookings assigned to their own linked profile; travelers can only view or cancel their own bookings. Invalid reverse transitions are rejected by centralized business rules.

The backend snapshots `dailyRateAtBooking`, calculates inclusive `numberOfDays`, and stores `estimatedTotal`. Client-supplied totals are ignored.

## Security notes

- Never commit `.env` files.
- Use an unpredictable `JWT_SECRET` in deployed environments.
- Restrict the Atlas IP Access List and set `CLIENT_URL` to the deployed frontend origin.
- Uploaded images are limited to 5 MB and image MIME types.

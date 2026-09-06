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
npm run migrate:phase2
npm run seed
npm run create-admin
npm run dev
```

Update `.env` with your Atlas connection string, secure JWT secret, and `SEED_DEMO_PASSWORD` first. Add your current IP address in Atlas Network Access. Existing databases must run the applicable Phase 1 and Phase 2 migrations in order before starting the upgraded app.

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
| Backend | `npm run migrate:phase2` | Add slugs and tourism defaults to legacy destinations |
| Frontend | `npm run dev` | Start the Vite development server |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm run build` | Create a production build |

## Core API

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/places` | List destinations |
| GET | `/api/places/:slug` | Destination detail and related places |
| POST | `/api/trip-planner/generate` | Generate an explainable itinerary |
| POST | `/api/trip-planner/save` | Save a traveler itinerary |
| GET | `/api/trip-planner/mine` | List the traveler’s itineraries |
| GET | `/api/favorites` | List the traveler’s saved places |
| POST/DELETE | `/api/favorites/:destinationId` | Save or unsave a destination |
| POST | `/api/reviews` | Review a completed owned booking |
| PUT/DELETE | `/api/reviews/:id` | Manage an owned review |
| GET | `/api/drivers/:id` | Public driver profile and reviews |
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

## Smart trip planning

The `/trip-planner` experience ranks active destinations by overlap between traveler interests and destination categories/tags. It adds a small starting-area relevance bonus, favors destinations with curated activities, respects each destination’s recommended duration, and avoids repeating a destination until the available ranked set has been used. The result explicitly explains why it was generated; no external AI service is used.

Travelers can save the generated day-by-day itinerary, then search for a driver with its dates, party size, route, and preferred vehicle prefilled. A booking can reference only an itinerary owned by the authenticated traveler.

Reviews require an authenticated traveler, an owned completed booking, a whole-number rating from 1–5, and no existing review for that booking. Create, update, and delete operations recalculate the driver’s average and review count.

## Security notes

- Never commit `.env` files.
- Use an unpredictable `JWT_SECRET` in deployed environments.
- Restrict the Atlas IP Access List and set `CLIENT_URL` to the deployed frontend origin.
- Uploaded images are limited to 5 MB and image MIME types.

## Phase 4 production configuration

Authentication uses a short-lived access token plus a rotating refresh token stored in an HttpOnly cookie. Logout revokes the stored refresh-token hash, and password reset tokens are random, hashed in MongoDB, expire after 30 minutes, and are one-time use. The frontend retries one failed authenticated request after refreshing, then clears the session without creating redirect loops.

Required additional backend variables:

```env
JWT_REFRESH_SECRET=a-different-long-random-secret
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_DAYS=7
NODE_ENV=development
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
EXPOSE_RESET_TOKEN=false
```

When all three Cloudinary variables exist, new destination and driver images are uploaded to Cloudinary and their secure URL/public ID are stored. Replacements and deletions remove the previous cloud asset. Without those variables, local disk uploads remain available for development.

Password email delivery is behind `services/emailService.js`. Development logs the reset URL on the backend. Setting `EXPOSE_RESET_TOKEN=true` also returns the token in the development response; never enable this in production.

Interactive OpenStreetMap views use stored destination coordinates and do not require a paid map key.

API documentation is available while the backend runs:

```text
http://localhost:5000/api-docs
http://localhost:5000/api-docs.json
```

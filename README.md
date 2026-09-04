# Ceylon Explorer

A polished full-stack travel platform for discovering Sri Lankan destinations, finding local tour drivers, and managing trip bookings.

## Highlights

- Curated destination discovery with live search
- Driver search, vehicle filters, and date-aware availability
- Secure JWT authentication with bcrypt password hashing
- Complete booking lifecycle: create, view, and cancel
- Prevention of double-booking at the database level
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
npm run seed
npm run create-admin
npm run dev
```

Update `.env` with your Atlas connection string and secure JWT secret first. Add your current IP address in Atlas Network Access.

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
| Frontend | `npm run dev` | Start the Vite development server |
| Frontend | `npm run lint` | Run ESLint |
| Frontend | `npm run build` | Create a production build |

## Core API

| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Sign in and receive a JWT |
| GET | `/api/places` | List destinations |
| GET | `/api/drivers?tripDate=YYYY-MM-DD` | Find available drivers |
| POST | `/api/bookings/add` | Create an authenticated booking |
| GET | `/api/bookings/mine` | List the current user's bookings |
| PATCH | `/api/bookings/:id/cancel` | Cancel the current user's booking |
| GET | `/api/admin/dashboard` | Admin metrics and upcoming bookings |
| GET | `/api/admin/bookings` | Admin view of all bookings |

## Security notes

- Never commit `.env` files.
- Use an unpredictable `JWT_SECRET` in deployed environments.
- Restrict the Atlas IP Access List and set `CLIENT_URL` to the deployed frontend origin.
- Uploaded images are limited to 5 MB and image MIME types.

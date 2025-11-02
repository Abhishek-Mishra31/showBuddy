# Movie App

A full-stack movie booking application with CRUD for movies, a complete booking flow, user bookings, and an admin dashboard with booking statistics.

## Overview
- Backend: Node.js, Express, MongoDB (Mongoose)
- Frontend: React (React Router), Axios, custom CSS
- Environments: Backend on `http://localhost:1000`, Frontend on `http://localhost:3000`

## Features
- Movies
  - Create, Read, Update, Delete (CRUD)
  - Search, filter by genre, sort by title/year/rating/created date
- Booking
  - Seat selection and payment flow
  - Booking confirmation
  - View and cancel user bookings
- Admin
  - Booking statistics dashboard (`/bookings/stats/summary`)
  - Manage movies (create, update, delete)
- Robust error handling across frontend and backend

## Tech Stack
- Backend: `express`, `mongoose`, `cors`, `dotenv`
- Frontend: `react`, `react-router-dom`, `axios`
- Tooling: `react-scripts`, testing libraries, Web Vitals

## Project Structure
```
Movie_App/
├── Backend/
│   ├── controllers/           # Movie & booking controllers
│   ├── models/                # Mongoose models (Movie, Booking)
│   ├── routes/                # Express routes (movies, bookings)
│   ├── db.js                  # MongoDB connection
│   └── server.js              # Express server setup
├── frontend/
│   ├── src/
│   │   ├── components/        # React components
│   │   ├── context/           # MovieContext provider
│   │   ├── services/          # API services (movies, bookings)
│   │   └── utils/             # helpers, constants
└── Readme.md
```

## Prerequisites
- Node.js (LTS)
- MongoDB (local or a connection URI)

## Backend Setup
1. Create `Backend/.env` with:
```
PORT=1000
MONGODB_URI=mongodb://localhost:27017/My_Movie_App
CLIENT_URL=http://localhost:3000
SESSION_SECRET=movie-app-secret
JWT_SECRET=your-secret-key

# Google OAuth (create credentials in Google Cloud Console)
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:1000/api/users/google/callback
```
2. Install dependencies and start the server:
```
cd Backend
npm install
npm run dev   # or: npm start
```
3. The server logs available endpoints at the root `/` and health at `/health`.

### Google OAuth Setup
- In Google Cloud Console → APIs & Services → Credentials → OAuth 2.0 Client IDs:
  - Set Authorized JavaScript origins: `http://localhost:1000`
  - Set Authorized redirect URIs: `http://localhost:1000/api/users/google/callback`
- Ensure the values match `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_CALLBACK_URL` in `Backend/.env`.
- The backend redirects to `${CLIENT_URL}/auth/success?token=<JWT>`; the frontend consumes this token and signs the user in.

## Frontend Setup
1. Install dependencies and start the dev server:
```
cd frontend
npm install
npm start
```
2. Frontend is served at `http://localhost:3000` and expects the backend at `http://localhost:1000`.

## API Reference
Base URL: `http://localhost:1000/api`

### Movies
- `GET /movies` — get all movies
- `GET /movies/:id` — get movie by ID
- `POST /movies` — create movie
  - body: `{ title, year, genre, ratings }`
- `PUT /movies/:id` — update movie
  - body: `{ title, year, genre, ratings }`
- `DELETE /movies/:id` — delete movie

### Bookings
- `GET /bookings?userEmail=<email>&status=<optional>` — get bookings for a user
- `GET /bookings/:id` — get booking by ID
- `POST /bookings` — create booking
  - body: booking data (movieId, showtime, seats, userEmail, price, etc.)
- `PATCH /bookings/:id/status` — update booking status
  - body: `{ status }`
- `DELETE /bookings/:id` — cancel booking
- `GET /bookings/stats/summary?userEmail=<optional>` — booking statistics (global or per user)

### Health
- `GET /health` — server health, uptime, timestamp

## Frontend Routes
- `/` — Home page (featured movies, search highlights)
- `/movies` — Movies list (search, filter, sort)
- `/movie/:id` — Movie details
- `/seat-selection` — Seat selection
- `/payment` — Payment and booking
- `/booking-confirmation` — Confirmation screen
- `/my-bookings` — User bookings
- `/admin` — Admin dashboard (stats + movie management)

## Key Components
- `HomePage.jsx` — hero section, featured listings
- `MovieList.jsx` — list with search/filters/sort (uses `MovieList.css`)
- `MovieDetails.jsx` — details view with ratings
- `SeatSelection.jsx` — seat picker UI
- `Payment.jsx` — booking creation
- `BookingConfirmation.jsx` — success screen
- `MyBookings.jsx` — view/cancel bookings
- `Admin.jsx` — stats + movie CRUD (uses `Admin.css`)

## Styling
- Custom CSS files: `Admin.css`, `HomePage.css`, `MovieDetails.css`, `MovieList.css`, `Navbar.css`, `Payment.css`, `SeatSelection.css`, `BookingConfirmation.css`, `MyBookings.css`
- `MovieList.jsx` was updated to use `MovieList.css` classes instead of Tailwind utilities

## Ratings Display
- Safe star rendering via `getStarRating(rating, maxStars)` in `frontend/src/utils/helpers.js`
  - Normalizes ratings out of 10 into a 5-star display
  - Prevents negative counts in `String.repeat()`

## Error Handling
- Frontend: Axios interceptors in `frontend/src/services/api.js` and `catch(error)` across components/services
- Backend: Global error handler and 404 handler in `Backend/server.js`

## Scripts
- Backend:
  - `npm run dev` — start with nodemon
  - `npm start` — start with node
- Frontend:
  - `npm start` — start React dev server
  - `npm build` — production build

## Troubleshooting
- Port mismatch: ensure backend `PORT=1000` (frontend expects `http://localhost:1000/api`)
- MongoDB connection: verify `MONGODB_URI` or start local MongoDB
- CORS: backend uses `CLIENT_URL` to allow the frontend origin
- Timeouts/Network: ECONNABORTED or network errors typically indicate server not running or wrong URL

## Notes
- Admin dashboard integrates booking stats via `/bookings/stats/summary` and manages movies via the `/movies` endpoints.
- Movies rating field is `ratings` (numeric), displayed consistently out of 10 with 5-star normalization in UI.
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const passport = require("passport");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const connectDB = require("./db");
const movieRoutes = require("./routes/movieRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const userRoutes = require("./routes/userRoutes");

// Passport config
require("./config/passport");

const app = express();

connectDB();

const apiLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 1 day
  max: 800,
  message: {
    success: false,
    message: "Rate limit exceeded. You can make up to 50 requests per day.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(
  cors({
    origin: (origin, callback) => {
      const allowedOrigins = [
        "http://localhost:3000",
        "https://show-buddy.vercel.app",
      ];
      if (process.env.CLIENT_URL) {
        allowedOrigins.push(process.env.CLIENT_URL);
      }
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    credentials: true,
  })
);

app.use(apiLimiter);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Session middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET || "movie-app-secret",
    resave: false,
    saveUninitialized: false,
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

app.use("/api/movies", movieRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/users", userRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Welcome to Movie App API",
    version: "1.0.0",
    endpoints: {
      // Movie endpoints
      "GET /api/movies": "Get all movies",
      "POST /api/movies": "Create a new movie",
      "GET /api/movies/:id": "Get movie by ID",
      "PUT /api/movies/:id": "Update movie by ID",
      "DELETE /api/movies/:id": "Delete movie by ID",

      // Booking endpoints
      "GET /api/bookings": "Get all bookings (query: userEmail, status)",
      "POST /api/bookings": "Create a new booking",
      "GET /api/bookings/:id": "Get booking by ID or bookingId",
      "PATCH /api/bookings/:id/status": "Update booking status",
      "DELETE /api/bookings/:id": "Cancel booking",
      "GET /api/bookings/stats/summary": "Get booking statistics",

      // User endpoints
      "POST /api/users/register": "Register a new user",
      "POST /api/users/login": "Login user",
      "GET /api/users/me": "Get current user profile (protected)",
    },
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

app.use((err, req, res, next) => {
  console.error("Global error handler:", err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

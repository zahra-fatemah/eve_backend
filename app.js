const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const { notFound, errorHandler } = require("./middleware/errorMiddleware");

// Route imports
const adminRoutes = require("./routes/adminRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");

const app = express();

// =============================================
// Health Check
// =============================================
app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🌹 Eve Beauty Care Backend is Running",
    environment: process.env.NODE_ENV,
  });
});

// =============================================
// Security
// =============================================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);

// =============================================
// Allowed Origins
// =============================================
const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:8080",
  "https://evebeautycare.live",
  "https://www.evebeautycare.live",
];

// Add origins from environment variable
if (process.env.FRONTEND_URL) {
  process.env.FRONTEND_URL.split(",")
    .map((url) => url.trim())
    .forEach((url) => {
      if (!allowedOrigins.includes(url)) {
        allowedOrigins.push(url);
      }
    });
}

// =============================================
// CORS Configuration
// =============================================
app.use(
  cors({
    origin(origin, callback) {
      // Allow requests without Origin
      // (Postman, Render health checks, curl, etc.)
      if (!origin) {
        return callback(null, true);
      }

      // Allow localhost
      if (/^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }

      // Allow all Vercel preview deployments
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      // Allow custom domains
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      console.error("Blocked by CORS:", origin);

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

// =============================================
// Middleware
// =============================================
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =============================================
// API Health Route
// =============================================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Eve Beauty Care API is running 🌹",
  });
});

// =============================================
// Routes
// =============================================
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// =============================================
// Error Handling
// =============================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;
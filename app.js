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




app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "🌹 Eve Beauticare Backend is Running",
    environment: process.env.NODE_ENV,
  });
});



// =============================================
// Security & Utility Middleware
// =============================================
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(
  cors({
    // In development, allow any localhost origin (port may vary)
    origin: function (origin, callback) {
      if (!origin || origin.match(/^https?:\/\/localhost(:\d+)?$/)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// =============================================
// API Routes
// =============================================
app.get("/api/health", (req, res) => {
  res.json({ success: true, message: "Eve Beauticare API is running 🌹" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// =============================================
// Error Handling
// =============================================
app.use(notFound);
app.use(errorHandler);

module.exports = app;

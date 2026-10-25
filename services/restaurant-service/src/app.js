const express = require("express");
const cors = require("cors");
const restaurantRoutes = require("./routes/restaurantRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", restaurantRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error("Restaurant Service Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error in Restaurant Service",
    error: err.message
  });
});

module.exports = app;

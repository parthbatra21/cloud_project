const express = require("express");
const cors = require("cors");
const deliveryRoutes = require("./routes/deliveryRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.use("/", deliveryRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error("Delivery Service Error:", err);
  res.status(500).json({
    success: false,
    message: "Internal Server Error in Delivery Service",
    error: err.message
  });
});

module.exports = app;

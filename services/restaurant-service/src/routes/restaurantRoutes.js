const express = require("express");
const router = express.Router();
const { restaurants, menus } = require("../data/seedData");

// GET /health - Service health check
router.get("/health", (req, res) => {
  res.status(200).json({
    service: "restaurant-service",
    status: "UP",
    timestamp: new Date().toISOString()
  });
});

// GET /restaurants - List all restaurants
router.get("/restaurants", (req, res) => {
  res.status(200).json({
    success: true,
    count: restaurants.length,
    data: restaurants
  });
});

// GET /restaurants/:id - Get a specific restaurant by ID
router.get("/restaurants/:id", (req, res) => {
  const { id } = req.params;
  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: `Restaurant with ID '${id}' not found.`
    });
  }

  res.status(200).json({
    success: true,
    data: restaurant
  });
});

// GET /restaurants/:id/menu - Get menu items for a specific restaurant
router.get("/restaurants/:id/menu", (req, res) => {
  const { id } = req.params;
  const restaurant = restaurants.find((r) => r.id === id);

  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: `Restaurant with ID '${id}' not found.`
    });
  }

  const menu = menus[id] || [];

  res.status(200).json({
    success: true,
    restaurantId: id,
    restaurantName: restaurant.name,
    count: menu.length,
    data: menu
  });
});

module.exports = router;

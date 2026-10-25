const express = require("express");
const router = express.Router();
const orderService = require("../services/orderService");

// GET /health
router.get("/health", (req, res) => {
  res.status(200).json({
    service: "order-service",
    status: "UP",
    timestamp: new Date().toISOString()
  });
});

// POST /orders - Create a new order
router.post("/orders", async (req, res, next) => {
  try {
    const newOrder = await orderService.createOrder(req.body);
    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      data: newOrder
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// GET /orders - Retrieve all orders
router.get("/orders", async (req, res, next) => {
  try {
    const orders = await orderService.getAllOrders();
    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (err) {
    next(err);
  }
});

// GET /orders/:id - Retrieve order by ID
router.get("/orders/:id", async (req, res, next) => {
  try {
    const order = await orderService.getOrderById(req.params.id);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: `Order with ID '${req.params.id}' not found.`
      });
    }
    res.status(200).json({
      success: true,
      data: order
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /orders/:id/status - Update order status
router.patch("/orders/:id/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status field is required in request body."
      });
    }
    const updated = await orderService.updateOrderStatus(req.params.id, status);
    res.status(200).json({
      success: true,
      message: `Order status updated to '${status}'.`,
      data: updated
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    next(err);
  }
});

module.exports = router;

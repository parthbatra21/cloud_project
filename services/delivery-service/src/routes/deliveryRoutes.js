const express = require("express");
const router = express.Router();
const deliveryService = require("../services/deliveryService");

// GET /health
router.get("/health", (req, res) => {
  res.status(200).json({
    service: "delivery-service",
    status: "UP",
    timestamp: new Date().toISOString()
  });
});

// POST /deliveries - Assign delivery for an order
router.post("/deliveries", async (req, res, next) => {
  try {
    const delivery = await deliveryService.createDelivery(req.body);
    res.status(201).json({
      success: true,
      message: "Delivery partner assigned successfully!",
      data: delivery
    });
  } catch (err) {
    if (err.status) {
      return res.status(err.status).json({ success: false, message: err.message });
    }
    next(err);
  }
});

// GET /deliveries/:orderId - Retrieve delivery status for an order
router.get("/deliveries/:orderId", async (req, res, next) => {
  try {
    const delivery = await deliveryService.getDeliveryByOrderId(req.params.orderId);
    if (!delivery) {
      return res.status(404).json({
        success: false,
        message: `No delivery tracking found for order '${req.params.orderId}'.`
      });
    }
    res.status(200).json({
      success: true,
      data: delivery
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /deliveries/:orderId/status - Update delivery status
router.patch("/deliveries/:orderId/status", async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status field is required."
      });
    }
    const updated = await deliveryService.updateDeliveryStatus(
      req.params.orderId,
      status
    );
    res.status(200).json({
      success: true,
      message: `Delivery status updated to '${status}'.`,
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

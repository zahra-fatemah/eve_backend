const express = require("express");
const router = express.Router();
const {
  createOrder,
  getOrders,
  getOrder,
  updatePaymentStatus,
  updateOrderStatus,
  deleteOrder,
  getDashboardStats,
} = require("../controllers/orderController");
const { protect } = require("../middleware/authMiddleware");

// Public — customer places an order
router.post("/", createOrder);

// Protected — admin routes (stats must come before :id to avoid conflict)
router.get("/stats", protect, getDashboardStats);
router.get("/", protect, getOrders);
router.get("/:id", protect, getOrder);
router.patch("/:id/payment", protect, updatePaymentStatus);
router.patch("/:id/status", protect, updateOrderStatus);
router.delete("/:id", protect, deleteOrder);

module.exports = router;

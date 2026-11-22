const express = require("express");
const router = express.Router();

const {
  sendWelcomeMessage,
} = require("../controllers/chatController");

const {
  getMenu,
  addSampleMenu,
} = require("../controllers/menuController");

const {
  addToOrder,
} = require("../controllers/orderController");

const {
  createSession,
} = require("../controllers/sessionController");

const {
  getCurrentOrder,
} = require("../controllers/currentOrderController");

const {
  checkoutOrder,
} = require("../controllers/checkoutController");

const {
  getOrderHistory,
} = require("../controllers/orderHistoryController");

const {
  cancelOrder,
} = require("../controllers/cancelOrderController");

const {
  handleMessage,
} = require("../controllers/messageController");

// Welcome message
router.get("/", sendWelcomeMessage);

// Display restaurant menu
router.get("/menu", getMenu);

// Add sample meals to MongoDB
router.post("/seed-menu", addSampleMenu);

// Add selected meal to customer's order
router.post("/order/add", addToOrder);

// Create or retrieve customer session
router.post("/session", createSession);

// View customer's current order (Option 97)
router.post("/order/current", getCurrentOrder);

// Checkout customer's current order
router.post("/order/checkout", checkoutOrder);

// Get customer's order history
router.post("/order/history", getOrderHistory);

// Cancel customer's current order
router.post("/order/cancel", cancelOrder);

// Handle customer's chat messages
router.post("/message", handleMessage);

module.exports = router;

const express = require("express");
const router = express.Router();

const { initializePayment } = require("../controllers/paymentController");
const { verifyPayment } = require("../controllers/verifyPaymentController");

// Initialize a Paystack payment
router.post("/initialize", initializePayment);

// Verify a Paystack payment
router.get("/verify", verifyPayment);

module.exports = router;

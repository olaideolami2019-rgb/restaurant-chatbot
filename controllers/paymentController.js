const Order = require("../models/order");
const Session = require("../models/session");
const crypto = require("crypto");

const initializePayment = async (req, res) => {
  try {
    const { deviceId, email } = req.body;

    if (!deviceId || !email) {
      return res.status(400).json({
        success: false,
        message: "Device ID and email are required."
      });
    }

    const emailIsValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!emailIsValid) {
      return res.status(400).json({
        success: false,
        message: "Please provide a valid email address."
      });
    }

    const session = await Session.findOne({ deviceId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Customer session not found."
      });
    }

    const order = await Order.findOne({
      session: session._id,
      status: { $in: ["current", "pending_payment"] }
    });

    if (!order || !order.items.length || order.totalAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "There is no valid order to pay for."
      });
    }

    if (!process.env.PAYSTACK_SECRET_KEY) {
      return res.status(500).json({
        success: false,
        message: "Paystack is not configured."
      });
    }

    const reference = `order-${crypto.randomUUID()}`;

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email: email.trim(),
          amount: Math.round(order.totalAmount * 100),
          currency: "NGN",
          reference,
          callback_url: process.env.PAYSTACK_CALLBACK_URL
        })
      }
    );

    const result = await response.json();

    if (!response.ok || !result.status) {
      return res.status(400).json({
        success: false,
        message: result.message || "Unable to initialize payment."
      });
    }

    order.status = "pending_payment";
    order.paymentStatus = "pending";
    order.paymentReference = result.data.reference;

    await order.save();

    return res.status(200).json({
      success: true,
      message: "Payment initialized successfully.",
      authorization_url: result.data.authorization_url,
      reference: result.data.reference
    });

  } catch (error) {
    console.error("Payment initialization error:", error);

    return res.status(500).json({
      success: false,
      message: "Payment initialization failed."
    });
  }
};

module.exports = { initializePayment };

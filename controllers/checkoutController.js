
const Order = require("../models/Order");
const Session = require("../models/Session");

const checkoutOrder = async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required.",
      });
    }

    const session = await Session.findOne({ deviceId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Customer session not found.",
      });
    }

    const order = await Order.findOne({
      session: session._id,
      status: "current",
    });

    if (!order || order.items.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No order to place.",
      });
    }

    order.status = "placed";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Your order has been placed successfully!",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to checkout your order.",
      error: error.message,
    });
  }
};

module.exports = { checkoutOrder };

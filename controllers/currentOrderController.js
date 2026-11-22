const Order = require("../models/Order");
const Session = require("../models/Session");

const getCurrentOrder = async (req, res) => {
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
        message: "You currently have no items in your order.",
      });
    }

    res.status(200).json({
      success: true,
      message: "Here is your current order.",
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve current order.",
      error: error.message,
    });
  }
};

module.exports = { getCurrentOrder };
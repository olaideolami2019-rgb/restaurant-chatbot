
const Order = require("../models/Order");
const Session = require("../models/Session");

const cancelOrder = async (req, res) => {
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
        message: "You have no current order to cancel.",
      });
    }

    order.status = "cancelled";
    await order.save();

    return res.status(200).json({
      success: true,
      message: "Your current order has been cancelled successfully.",
      order,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to cancel your order.",
      error: error.message,
    });
  }
};

module.exports = { cancelOrder };

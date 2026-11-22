const Order = require("../models/order");
const Session = require("../models/session");

const getOrderHistory = async (req, res) => {
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

    const orders = await Order.find({
      session: session._id,
      status: "placed",
    }).sort({ createdAt: -1 });

    if (orders.length === 0) {
      return res.status(200).json({
        success: true,
        message: "You have no previous orders.",
        orders: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Here is your order history.",
      totalOrders: orders.length,
      orders,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Unable to retrieve order history.",
      error: error.message,
    });
  }
};

module.exports = { getOrderHistory };

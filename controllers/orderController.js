const Menu = require("../models/menu");
const Order = require("../models/Order");
const Session = require("../models/Session");

const addToOrder = async (req, res) => {
  try {
    const { deviceId, menuItemId, quantity } = req.body;

    if (!deviceId || !menuItemId) {
      return res.status(400).json({
        success: false,
        message: "Device ID and menu item ID are required.",
      });
    }

    const itemQuantity = Number(quantity || 1);

    if (!Number.isInteger(itemQuantity) || itemQuantity < 1) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a positive whole number.",
      });
    }

    const session = await Session.findOne({ deviceId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Customer session not found.",
      });
    }

    const menuItem = await Menu.findOne({
      _id: menuItemId,
      isAvailable: true,
    });

    if (!menuItem) {
      return res.status(404).json({
        success: false,
        message: "Menu item not found or unavailable.",
      });
    }

    let order = await Order.findOne({
      session: session._id,
      status: "current",
    });

    if (!order) {
      order = new Order({
        session: session._id,
        items: [],
      });
    }

    const existingItem = order.items.find(
      (item) => item.menuItem.toString() === menuItemId
    );

    if (existingItem) {
      existingItem.quantity += itemQuantity;
      existingItem.subtotal =
        existingItem.price * existingItem.quantity;
    } else {
      order.items.push({
        menuItem: menuItem._id,
        name: menuItem.name,
        price: menuItem.price,
        quantity: itemQuantity,
        subtotal: menuItem.price * itemQuantity,
      });
    }

    order.totalAmount = order.items.reduce(
      (total, item) => total + item.subtotal,
      0
    );

    await order.save();

    res.status(200).json({
      success: true,
      message: `${menuItem.name} added to your order.`,
      order,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to add item to order.",
      error: error.message,
    });
  }
};

module.exports = { addToOrder };
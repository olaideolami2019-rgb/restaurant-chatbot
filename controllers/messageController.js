const Menu = require("../models/menu");
const Session = require("../models/session");
const Order = require("../models/order");

const handleMessage = async (req, res) => {
  try {
    const { deviceId, message } = req.body;

    // Validate incoming message
    if (!deviceId || message === undefined || message === null) {
      return res.status(400).json({
        success: false,
        message: "Device ID and message are required.",
      });
    }

    const customerMessage = String(message).trim();

    // Find customer session
    const session = await Session.findOne({ deviceId });

    if (!session) {
      return res.status(404).json({
        success: false,
        message: "Customer session not found. Please start a session first.",
      });
    }

    session.lastActivity = new Date();

    // OPTION 1: DISPLAY RESTAURANT MENU
    if (
      customerMessage === "1" &&
      session.conversationState !== "awaiting_meal"
    ) {
      const menu = await Menu.find({ isAvailable: true });

      if (menu.length === 0) {
        return res.status(200).json({
          success: true,
          message: "Our menu is currently empty.",
        });
      }

      session.conversationState = "awaiting_meal";
      session.selectedMenuItem = null;
      await session.save();

      const menuList = menu.map((item, index) => ({
        number: index + 1,
        name: item.name,
        price: item.price,
        description: item.description,
        menuItemId: item._id,
      }));

      return res.status(200).json({
        success: true,
        message: "Please select a meal by entering its menu number.",
        menu: menuList,
      });
    }

    // OPTION 99: CHECKOUT
    if (customerMessage === "99") {
      const order = await Order.findOne({
        session: session._id,
        status: "current",
      });

      session.conversationState = "idle";
      session.selectedMenuItem = null;
      await session.save();

      if (!order || order.items.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No order to place.",
        });
      }

      // Do not mark the order as placed before payment.
      return res.status(200).json({
        success: true,
        message: "Your order is ready for checkout. Please proceed to payment.",
        order,
        checkoutRequired: true,
      });
    }

    // OPTION 98: ORDER HISTORY
    if (customerMessage === "98") {
      const orders = await Order.find({
        session: session._id,
        status: "placed",
      }).sort({ createdAt: -1 });

      session.conversationState = "idle";
      session.selectedMenuItem = null;
      await session.save();

      return res.status(200).json({
        success: true,
        message: orders.length
          ? "Here is your order history."
          : "You have no previous orders.",
        totalOrders: orders.length,
        orders,
      });
    }

    // OPTION 97: CURRENT ORDER
    if (customerMessage === "97") {
      const order = await Order.findOne({
        session: session._id,
        status: "current",
      });

      session.conversationState = "idle";
      session.selectedMenuItem = null;
      await session.save();

      if (!order || order.items.length === 0) {
        return res.status(200).json({
          success: true,
          message: "You currently have no items in your order.",
        });
      }

      return res.status(200).json({
        success: true,
        message: "Here is your current order.",
        order,
      });
    }

    // OPTION 0: CANCEL CURRENT ORDER
    if (customerMessage === "0") {
      const order = await Order.findOne({
        session: session._id,
        status: "current",
      });

      session.conversationState = "idle";
      session.selectedMenuItem = null;
      await session.save();

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
    }

    // MEAL SELECTION
    if (session.conversationState === "awaiting_meal") {
      const menu = await Menu.find({ isAvailable: true });
      const mealNumber = Number(customerMessage);

      if (
        !Number.isInteger(mealNumber) ||
        mealNumber < 1 ||
        mealNumber > menu.length
      ) {
        return res.status(400).json({
          success: false,
          message: "Invalid meal number. Please select a number from the menu.",
        });
      }

      const selectedMeal = menu[mealNumber - 1];

      session.selectedMenuItem = selectedMeal._id;
      session.conversationState = "awaiting_quantity";
      await session.save();

      return res.status(200).json({
        success: true,
        message: `You selected ${selectedMeal.name}. How many would you like?`,
        selectedMeal: {
          id: selectedMeal._id,
          name: selectedMeal.name,
          price: selectedMeal.price,
        },
      });
    }

    // QUANTITY SELECTION
    if (session.conversationState === "awaiting_quantity") {
      const quantity = Number(customerMessage);

      if (!Number.isInteger(quantity) || quantity < 1) {
        return res.status(400).json({
          success: false,
          message: "Please enter a valid quantity (a whole number greater than 0).",
        });
      }

      const selectedMeal = await Menu.findOne({
        _id: session.selectedMenuItem,
        isAvailable: true,
      });

      if (!selectedMeal) {
        session.conversationState = "idle";
        session.selectedMenuItem = null;
        await session.save();

        return res.status(404).json({
          success: false,
          message: "This meal is no longer available. Please select from the menu again.",
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
          totalAmount: 0,
        });
      }

      // Check whether this meal already exists in the order
      const existingItem = order.items.find(
        (item) =>
          item.menuItem.toString() === selectedMeal._id.toString()
      );

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.subtotal =
          existingItem.price * existingItem.quantity;
      } else {
        order.items.push({
          menuItem: selectedMeal._id,
          name: selectedMeal.name,
          price: selectedMeal.price,
          quantity,
          subtotal: selectedMeal.price * quantity,
        });
      }

      // Calculate order total
      order.totalAmount = order.items.reduce(
        (total, item) => total + item.subtotal,
        0
      );

      await order.save();

      session.conversationState = "awaiting_meal";
      session.selectedMenuItem = null;
      await session.save();

      return res.status(200).json({
        success: true,
        message: `${quantity} ${selectedMeal.name} added to your order. You can select another meal or enter 99 to checkout.`,
        order,
      });
    }

    // INVALID OPTION
    return res.status(200).json({
      success: true,
      message: "Invalid option. Please select 1, 99, 98, 97, or 0.",
    });

  } catch (error) {
    console.error("Chatbot Error:", error);

    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.message,
    });
  }
};

module.exports = { handleMessage };

const Menu = require("../models/menu");

const getMenu = async (req, res) => {
  try {
    const menuItems = await Menu.find({ isAvailable: true });

    if (menuItems.length === 0) {
      return res.status(200).json({
        success: true,
        message: "Our menu is currently empty. Please check back later.",
      });
    }

    const menuMessage = menuItems
      .map((item, index) => `${index + 1}. ${item.name} - ₦${item.price}`)
      .join("\n");

    res.status(200).json({
      success: true,
      message: `Here is our menu:\n\n${menuMessage}\n\nSelect a meal by entering its number.`,
      menu: menuItems,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to retrieve menu.",
      error: error.message,
    });
  }
};

const addSampleMenu = async (req, res) => {
  try {
    const sampleMeals = [
      {
        name: "Jollof Rice",
        description: "Delicious Nigerian jollof rice",
        category: "Rice",
        price: 2500,
      },
      {
        name: "Fried Rice",
        description: "Tasty fried rice with vegetables",
        category: "Rice",
        price: 3000,
      },
      {
        name: "Chicken",
        description: "Well-seasoned grilled chicken",
        category: "Protein",
        price: 2000,
      },
      {
        name: "Beef Burger",
        description: "Fresh beef burger",
        category: "Fast Food",
        price: 3500,
      },
      {
        name: "Moi Moi",
        description: "Steamed Nigerian bean pudding",
        category: "Sides",
        price: 1000,
      },
    ];

    await Menu.insertMany(sampleMeals);

    res.status(201).json({
      success: true,
      message: "Sample meals added successfully!",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  getMenu,
  addSampleMenu,
};
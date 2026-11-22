
const welcomeMessage = `
Welcome to Salam's Restaurant! 🍽️

How can we help you today?

1. Place an order
99. Checkout order
98. See order history
97. See current order
0. Cancel order

Please select an option.
`;

const sendWelcomeMessage = (req, res) => {
  res.status(200).json({
    success: true,
    message: welcomeMessage,
  });
};

module.exports = {
  sendWelcomeMessage,
};

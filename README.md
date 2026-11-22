# 🍽️ Restaurant Chatbot

A web-based restaurant ordering chatbot that allows customers to browse available meals, place orders, manage their current orders, view order history, cancel orders, and make payments securely through Paystack.

## Features

- Customer sessions based on device ID.
- Display of available restaurant meals and prices.
- Place orders by selecting meals and quantities.
- Add multiple meals to one order.
- View current orders.
- Checkout using Paystack.
- Payment verification.
- Automatic order status update after successful payment.
- View previous order history.
- Cancel current orders.
- MongoDB database integration.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Mongoose
- HTML
- CSS
- JavaScript
- Paystack Payment API

## Project Structure

```text
restaurant-chatbot/
│
├── config/
│   └── db.js
│
├── controllers/
│   ├── cancelOrderController.js
│   ├── chatController.js
│   ├── checkoutController.js
│   ├── currentOrderController.js
│   ├── menuController.js
│   ├── messageController.js
│   ├── orderController.js
│   ├── orderHistoryController.js
│   ├── paymentController.js
│   ├── sessionController.js
│   └── verifyPaymentController.js
│
├── models/
│   ├── menu.js
│   ├── order.js
│   └── session.js
│
├── public/
│   ├── index.html
│   ├── script.js
│   └── style.css
│
├── routes/
│   ├── chatRoutes.js
│   └── paymentRoutes.js
│
├── .env
├── .gitignore
├── app.js
├── package.json
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone https://github.com/olaideolami2019-rgb/restaurant-chatbot.git
```

### 2. Navigate into the project folder

```bash
cd restaurant-chatbot
```

### 3. Install dependencies

```bash
npm install
```

### 4. Configure environment variables

Create a `.env` file in the root directory and add your configuration:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
PAYSTACK_SECRET_KEY=your_paystack_test_secret_key
PAYSTACK_CALLBACK_URL=http://localhost:5000/api/payment/verify
```

Replace the placeholder values with your own credentials. Never upload your actual `.env` file or secret keys to GitHub.

### 5. Start the application

```bash
npm run dev
```

If your project does not have a development script, you can start it with:

```bash
node app.js
```

### 6. Open the application

Visit:

```text
http://localhost:5000
```

## Chatbot Commands

| Command | Description |
|---|---|
| `1` | Place an order and view the menu |
| `99` | Proceed to checkout |
| `98` | View order history |
| `97` | View current order |
| `0` | Cancel current order |

## Payment Integration

The application integrates with Paystack for payment processing.

- Customers proceed to checkout after selecting meals.
- Paystack initializes the transaction.
- Customers complete payment using the Paystack test environment.
- The backend verifies the transaction.
- Successful payments update the order status to placed.

For testing, use your own Paystack test credentials.

## Database

MongoDB is used to store:

- Customer sessions
- Restaurant menu items
- Customer orders
- Order and payment statuses

## API Routes

The application exposes chat and payment routes through:

- `/api/chat`
- `/api/payment`

For the detailed endpoint methods and request formats, refer to the route files in the `routes/` directory.

## Author

**Abdulsalam Babatunde**

GitHub: [@olaideolami2019-rgb](https://github.com/olaideolami2019-rgb)

## License

This project was developed as a learning and backend development project.
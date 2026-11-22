
const messages = document.getElementById("messages");
const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const foodMenu = document.getElementById("food-menu");

const customerEmail = "olaideolami2019@gmail.com";

const deviceId =
  localStorage.getItem("restaurantDeviceId") || crypto.randomUUID();

localStorage.setItem("restaurantDeviceId", deviceId);

let sessionReady = false;
let menuItems = [];

// Display messages in the chatbot
function addMessage(message, sender) {
  const div = document.createElement("div");
  div.className = `message ${sender}`;
  div.textContent = message;

  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
}

// Start customer session
async function startSession() {
  try {
    const response = await fetch("/api/chat/session", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ deviceId })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      throw new Error(result.message || "Could not start session.");
    }

    sessionReady = true;

    addMessage(
      "Your customer session is ready. How can we help you?",
      "bot"
    );

  } catch (error) {
    console.error("Session error:", error);

    addMessage(
      "Unable to start your session. Please refresh the page.",
      "bot"
    );
  }
}

// Load available meals from MongoDB
async function loadFoodMenu() {
  try {
    const response = await fetch("/api/chat/menu");
    const result = await response.json();

    if (
      !response.ok ||
      !result.success ||
      !Array.isArray(result.menu)
    ) {
      throw new Error(result.message || "Unable to load menu.");
    }

    menuItems = result.menu;
    foodMenu.innerHTML = "";

    menuItems.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "food-card";

      const name = document.createElement("h4");
      name.textContent = item.name;

      const description = document.createElement("p");
      description.textContent = item.description || "";

      const price = document.createElement("p");
      price.textContent =
        `₦${Number(item.price).toLocaleString("en-NG")}`;

      const chooseButton = document.createElement("button");
      chooseButton.type = "button";
      chooseButton.textContent = "Choose meal";

      chooseButton.addEventListener("click", () => {
        if (!sessionReady) {
          addMessage(
            "Please wait while we prepare your session.",
            "bot"
          );
          return;
        }

        input.value = String(index + 1);
        form.requestSubmit();
      });

      card.appendChild(name);
      card.appendChild(description);
      card.appendChild(price);
      card.appendChild(chooseButton);

      foodMenu.appendChild(card);
    });

  } catch (error) {
    console.error("Menu loading error:", error);

    foodMenu.textContent =
      "Unable to load meals. Please refresh the page.";
  }
}

// Initialize Paystack payment
async function proceedToPayment() {
  addMessage("Preparing your Paystack payment...", "bot");

  try {
    const response = await fetch("/api/payment/initialize", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        deviceId,
        email: customerEmail
      })
    });

    const result = await response.json();

    if (
      !response.ok ||
      !result.success ||
      !result.authorization_url
    ) {
      throw new Error(
        result.message || "Payment could not be initialized."
      );
    }

    addMessage("Redirecting you to Paystack...", "bot");

    window.location.href = result.authorization_url;

  } catch (error) {
    console.error("Payment error:", error);

    addMessage(
      error.message || "Unable to connect to Paystack.",
      "bot"
    );
  }
}

// Display payment verification result after returning from Paystack
function checkPaymentStatus() {
  const params = new URLSearchParams(window.location.search);
  const paymentStatus = params.get("payment");

  if (paymentStatus === "success") {
    addMessage(
      "Payment successful! Your order has been placed. Thank you for ordering with Salam's Restaurant!",
      "bot"
    );

    window.history.replaceState({}, document.title, "/");
  }

  if (paymentStatus === "failed") {
    addMessage(
      "Payment could not be confirmed. Please try again.",
      "bot"
    );

    window.history.replaceState({}, document.title, "/");
  }
}

// Send messages to the chatbot backend
form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!sessionReady) {
    addMessage(
      "Please wait while we prepare your session.",
      "bot"
    );
    return;
  }

  const message = input.value.trim();

  if (!message) return;

  addMessage(message, "user");
  input.value = "";

  // Checkout command
  if (message === "99") {
    await proceedToPayment();
    return;
  }

  try {
    const response = await fetch("/api/chat/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        deviceId,
        message
      })
    });

    const result = await response.json();

    if (!response.ok || !result.success) {
      addMessage(
        result.message || "Something went wrong.",
        "bot"
      );
      return;
    }

    // Display the bot response
    addMessage(
      result.message || "How else can I help you?",
      "bot"
    );


// Display all placed orders
if (Array.isArray(result.orders) && result.orders.length > 0) {
  result.orders.forEach((order, index) => {
    let orderDetails = `Order ${index + 1}\n`;

    orderDetails += `Total: ₦${Number(order.totalAmount).toLocaleString("en-NG")}\n`;
    orderDetails += `Payment status: ${order.paymentStatus}\n`;
    orderDetails += "Items:\n";

    order.items.forEach((item) => {
      orderDetails += `${item.name} x ${item.quantity} - ₦${Number(item.subtotal).toLocaleString("en-NG")}\n`;
    });

    addMessage(orderDetails, "bot");
  });
}


    // Display menu if returned by the chatbot
    if (Array.isArray(result.menu) && result.menu.length > 0) {
      result.menu.forEach((item, index) => {
        addMessage(
          `${index + 1}. ${item.name} - ₦${Number(item.price).toLocaleString("en-NG")}`,
          "bot"
        );
      });
    }

  } catch (error) {
    console.error("Chat error:", error);

    addMessage(
      "Unable to connect to the server. Please try again.",
      "bot"
    );
  }
});

// Start the chatbot
startSession();
loadFoodMenu();
checkPaymentStatus();

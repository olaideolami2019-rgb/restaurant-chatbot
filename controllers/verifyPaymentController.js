
const https = require("https");
const Order = require("../models/Order");

const verifyPayment = async (req, res) => {
  try {
    const { reference } = req.query;

    if (!reference) {
      return res.redirect("/?payment=failed");
    }

    const order = await Order.findOne({
      paymentReference: reference,
      status: "pending_payment"
    });

    if (!order) {
      return res.redirect("/?payment=failed");
    }

    const options = {
      hostname: "api.paystack.co",
      path: `/transaction/verify/${encodeURIComponent(reference)}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`
      }
    };

    const paystackResponse = await new Promise((resolve, reject) => {
      const request = https.request(options, (response) => {
        let data = "";

        response.on("data", (chunk) => {
          data += chunk;
        });

        response.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (error) {
            reject(error);
          }
        });
      });

      request.on("error", reject);
      request.end();
    });

    const transaction = paystackResponse.data;

    const expectedAmount = Math.round(order.totalAmount * 100);

    if (
      !paystackResponse.status ||
      !transaction ||
      transaction.status !== "success" ||
      transaction.reference !== reference ||
      transaction.amount !== expectedAmount ||
      transaction.currency !== "NGN"
    ) {
      order.paymentStatus = "failed";
      await order.save();

      return res.redirect("/?payment=failed");
    }

    order.status = "placed";
    order.paymentStatus = "successful";
    await order.save();

    return res.redirect("/?payment=success");

  } catch (error) {
    console.error("Payment verification error:", error);
    return res.redirect("/?payment=failed");
  }
};

module.exports = { verifyPayment };

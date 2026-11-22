const Session = require("../models/session");
const { randomUUID } = require("crypto");

const createSession = async (req, res) => {
  try {
    const { deviceId } = req.body;

    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: "Device ID is required.",
      });
    }

    let session = await Session.findOne({ deviceId });

    if (!session) {
      session = await Session.create({
        sessionId: randomUUID(),
        deviceId,
      });
    } else {
      session.lastActivity = new Date();
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: "Customer session is ready.",
      session,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Unable to create customer session.",
      error: error.message,
    });
  }
};

module.exports = { createSession };
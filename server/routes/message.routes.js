import express from "express";
import Message from "../models/Message.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Room ke messages fetch karo
router.get("/:roomId", protect, async (req, res) => {
  try {
    const { roomId } = req.params;
    const messages = await Message.find({ roomId })
      .sort({ createdAt: 1 })
      .limit(500);
    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

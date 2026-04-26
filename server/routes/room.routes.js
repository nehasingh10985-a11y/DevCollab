import express from "express";
import { v4 as uuidv4 } from "uuid";
import Room from "../models/Room.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Create Room
router.post("/create", protect, async (req, res) => {
  try {
    const { name, language } = req.body;

    const room = await Room.create({
      name,
      language: language || "javascript",
      roomId: uuidv4(),
      owner: req.user.userId,
      participants: [req.user.userId],
    });

    res.status(201).json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Join Room
router.post("/join/:roomId", protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: "Room nahi mila" });

    // Already joined nahi hai toh add karo
    if (!room.participants.includes(req.user.userId)) {
      room.participants.push(req.user.userId);
      await room.save();
    }

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get My Rooms
router.get("/my-rooms", protect, async (req, res) => {
  try {
    const rooms = await Room.find({
      participants: req.user.userId,
    }).populate("owner", "name email");

    res.json(rooms);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get Single Room
router.get("/:roomId", protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId })
      .populate("owner", "name email")
      .populate("participants", "name email");

    if (!room) return res.status(404).json({ message: "Room nahi mila" });

    res.json(room);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete Room (owner only)
router.delete("/:roomId", protect, async (req, res) => {
  try {
    const room = await Room.findOne({ roomId: req.params.roomId });
    if (!room) return res.status(404).json({ message: "Room nahi mila" });

    if (room.owner.toString() !== req.user.userId) {
      return res
        .status(403)
        .json({ message: "Sirf owner delete kar sakta hai" });
    }

    await room.deleteOne();
    res.json({ message: "Room delete ho gaya" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

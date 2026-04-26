import express from "express";
import Snapshot from "../models/Snapshot.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Save snapshot
router.post("/", protect, async (req, res) => {
  try {
    const { roomId, name, code, language } = req.body;
    const snapshot = await Snapshot.create({
      roomId,
      name,
      code,
      language,
      createdBy: req.user.userId,
    });
    res.status(201).json(snapshot);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get snapshots by room
router.get("/:roomId", protect, async (req, res) => {
  try {
    const snapshots = await Snapshot.find({ roomId: req.params.roomId }).sort({
      createdAt: -1,
    });
    res.json(snapshots);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete snapshot
router.delete("/:id", protect, async (req, res) => {
  try {
    await Snapshot.findByIdAndDelete(req.params.id);
    res.json({ message: "Snapshot deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

export default router;

import mongoose from "mongoose";

const roomSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    roomId: { type: String, required: true, unique: true },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    language: { type: String, default: "javascript" },
    code: { type: String, default: "// Start coding here..." },
  },
  { timestamps: true },
);

export default mongoose.model("Room", roomSchema);

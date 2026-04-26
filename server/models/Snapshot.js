import mongoose from "mongoose";

const snapshotSchema = new mongoose.Schema(
  {
    roomId: { type: String, required: true },
    name: { type: String, required: true },
    code: { type: String, required: true },
    language: { type: String, required: true },
    createdBy: { type: String, required: true },
  },
  { timestamps: true },
);

export default mongoose.model("Snapshot", snapshotSchema);

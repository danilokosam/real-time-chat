import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // UUID
  content: { type: String, required: true },
  from: { type: String, ref: "User" }, // Sender's userID (socket ID)
  fromUsername: { type: String }, // Sender's username
  to: { type: String, ref: "User", default: null }, // Recipient's userID for private messages, null for public
  timestamp: { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
});

export default mongoose.model("Message", messageSchema);

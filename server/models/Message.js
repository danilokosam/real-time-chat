import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true }, // UUID
  content: { type: String, required: true }, // Message content
  from: { type: String, required: true }, // Sender's persistent userID (UUID)
  fromUsername: { type: String }, // Sender's username
  to: { type: String, default: null }, // Recipient's persistent userID for private messages, null for public
  timestamp: { type: String, required: true }, // Date and time of the message
  isPrivate: { type: Boolean, default: false }, // Indicates if the message is private
  readBy: [{ type: String }], // Array of userIDs ( UUIDs ) who have read the message
  readAt: { type: String, default: null }, // Timestamp when the message was read
});

// Index for faster message queries
messageSchema.index({ isPrivate: 1, from: 1, to: 1, _id: -1 });

// Index for readBy queries
messageSchema.index({ readBy: 1 });

export default mongoose.model("Message", messageSchema);

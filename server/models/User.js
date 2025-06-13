import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true }, // Socket ID
  username: { type: String, required: true, unique: true },
  connected: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("User", userSchema);

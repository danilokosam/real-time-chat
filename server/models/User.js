import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  userID: { type: String, required: true, unique: true }, // Persistent UUID for user identity
  socketID: { type: String, unique: true, sparse: true }, // Current socket ID for real-time messaging
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  connected: { type: Boolean, default: false },
  sessionToken: { type: String, unique: true, sparse: true }, // Session token for cookie-based persistence
  createdAt: { type: Date, default: Date.now },
  password: { type: String, required: true },
  refreshToken: { type: String, default: null },
});

userSchema.methods.toJSON = function () {
  const object = this.toObject();
  delete object.password;
  delete object.refreshToken;
  return object;
};

export default mongoose.model("User", userSchema);

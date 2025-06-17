import User from "../models/User.js";
import Message from "../models/Message.js";

// Get list of connected users
export const getConnectedUsers = async () => {
  const users = await User.find({}).select("userID username connected");
  return users.map((user) => ({
    userID: user.userID,
    username: user.username,
    connected: user.connected,
    unreadCount: 0,
  }));
};

// Get unread private messages for a user
export const getUnreadMessages = async (userID) => {
  return await Message.find({
    to: userID,
    isPrivate: true,
  }).lean();
};

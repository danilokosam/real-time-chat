import User from "../models/User.js";
import Message from "../models/Message.js";

// Get list of connected users
export const getConnectedUsers = async () => {
  const users = await User.find({}).select("userID username connected");
  return users.map((user) => ({
    userID: user.userID,
    username: user.username,
    connected: user.connected,
    unreadCount: 0
  }));
};

export const getDisconnectedUsers = async () => {
  const users = await User.find({ connected: false }).select("userID username connected lastTimeOnline");
  return users.map((user) => ({
    userID: user.userID,
    username: user.username,
    connected: user.connected,
    unreadCount: 0,
    lastTimeOnline: user.lastTimeOnline
  }));
};

// Get unread private messages for a user
export const getUnreadMessages = async (userID) => {
  return await Message.find({
    to: userID,
    isPrivate: true,
    readBy: { $ne: userID },
  }).lean();
};

import Message from "../models/Message.js";

// Fetch recent public messages
export const getRecentPublicMessages = async (limit = 50) => {
  try {
    const messages = await Message.find({ isPrivate: false })
      .sort({ _id: -1 }) // Sort by newest first
      .limit(limit)
      .lean(); // Convert to plain JavaScript objects
    return messages.reverse(); // Reverse to chronological order for display
  } catch (error) {
    console.error(`Error fetching recent public messages: ${error.message}`);
    throw error;
  }
};

import Message from "../../models/Message.js";

export const handleGetMessages = async (socket) => {
  try {
    const messages = await Message.find({});
    socket.emit("loadMessages", messages);
  } catch (err) {
    console.error(`Error fetching messages: ${err.message}`);
  }
};

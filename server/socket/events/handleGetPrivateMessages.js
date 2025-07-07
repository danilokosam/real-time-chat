import Message from "../../models/Message.js";

export const handleGetPrivateMessages = async (socket, { from, to }) => {
  try {
    const messages = await Message.find({
      $or: [
        { from, to },
        { from: to, to: from },
      ],
    }).sort({ timestamp: 1 });

    socket.emit("loadPrivateMessages", {
      userID: to,
      messages,
    });
  } catch (err) {
    console.error(`Error fetching private messages: ${err.message}`);
  }
};

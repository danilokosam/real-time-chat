import { getConnectedUsers, getUnreadMessages } from "../../utils/users.js";
import Message from "../../models/Message.js";
import User from "../../models/User.js";

// Handle the clearUnreadMessages event to mark unread private messages as read
export default async function handleClearUnreadMessages(
  socket,
  io,
  targetUserID
) {
  console.log(
    `Clearing unread messages for user ${socket.userID} from ${targetUserID}`
  );

  try {
    // Validate targetUserID
    if (!targetUserID) {
      console.log("No target user ID provided");
      socket.emit("error", "Target user ID is required");
      return;
    }

    // Mark unread private messages from targetUserID to the current user as read
    await Message.updateMany(
      {
        to: socket.userID,
        from: targetUserID,
        isPrivate: true,
        readBy: { $ne: socket.userID }, // Not already read
      },
      {
        $addToSet: { readBy: socket.userID },
        $set: { readAt: new Date().toISOString() },
      }
    );

    // Notify senders of marked messages
    const updatedMessages = await Message.find({
      to: socket.userID,
      from: targetUserID,
      isPrivate: true,
    }).lean();
    for (const message of updatedMessages) {
      if (message.readBy.includes(socket.userID)) {
        const sender = await User.findOne({ userID: message.from }).select(
          "socketID"
        );
        if (sender && sender.socketID) {
          io.to(sender.socketID).emit("messageRead", {
            messageID: message.id,
            readBy: message.readBy,
            readAt: message.readAt,
          });
        }
      }
    }

    // Send updated unread messages to the client
    const unreadMessages = await getUnreadMessages(socket.userID);
    socket.emit("unreadMessages", unreadMessages);

    // Broadcast updated user list to all clients
    const users = await getConnectedUsers();
    io.emit("users", users);
  } catch (error) {
    console.error(`Error in clearUnreadMessages handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}

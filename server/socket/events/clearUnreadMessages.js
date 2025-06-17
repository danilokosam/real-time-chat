import { getConnectedUsers, getUnreadMessages } from "../../utils/users.js";
import Message from "../../models/Message.js";

// Handle the clearUnreadMessages event to remove unread private messages for a user pair
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

    // Delete unread private messages from targetUserID to the current user
    await Message.deleteMany({
      to: socket.userID,
      from: targetUserID,
      isPrivate: true,
    });

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

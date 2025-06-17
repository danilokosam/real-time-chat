import { v4 as uuidv4 } from "uuid";
import User from "../../models/User.js";
import Message from "../../models/Message.js";
import { getConnectedUsers, getUnreadMessages } from "../../utils/users.js";
import { getSelectedUser } from "../../utils/store.js";

// Handle the privateMessage event for sending private chat messages
export default async function handlePrivateMessage(
  socket,
  io,
  { content, to, fromUsername }
) {
  // Log receipt of private message
  console.log(
    `Private message from ${fromUsername} (socket: ${socket.id}) to ${to}: ${content}`
  );

  try {
    // Validate recipient
    const recipient = await User.findOne({ userID: to }).select("socketID");
    if (!recipient || !recipient.socketID) {
      console.log(`Recipient userID ${to} not found or not connected`);
      return;
    }

    // Create private message object
    const message = {
      id: uuidv4(),
      content,
      from: socket.userID,
      fromUsername,
      to,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      isPrivate: true,
    };

    // Save message to database
    await Message.create(message);

    // Check if recipient has the sender selected
    if (getSelectedUser(recipient.socketID) !== socket.userID) {
      socket
        .to(recipient.socketID)
        .emit("unreadMessages", await getUnreadMessages(to));
    }

    // Send message to recipient and sender
    socket.to(recipient.socketID).emit("privateMessage", message);
    socket.emit("privateMessage", message);

    // Broadcast updated user list to all clients
    const users = await getConnectedUsers();
    io.emit("users", users);
  } catch (error) {
    console.error(`Error in privateMessage handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}

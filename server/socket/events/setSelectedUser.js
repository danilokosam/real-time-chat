import Message from "../../models/Message.js";
import User from "../../models/User.js";
import { getConnectedUsers } from "../../utils/users.js";
import { setSelectedUser } from "../../utils/store.js";

// Handle the setSelectedUser event for selecting a user for private chat
export default async function handleSetSelectedUser(
  socket,
  io,
  selectedUserID
) {
  // Log the selection of a user for private chat
  console.log(`User ${socket.id} selected user: ${selectedUserID}`);

  try {
    // Validate selectedUserID
    if (!selectedUserID) {
      console.log("No selected user ID provided");
      socket.emit("error", "Selected user ID is required");
      return;
    }

    // Update the selected user for this socket
    setSelectedUser(socket.id, selectedUserID);

    // Fetch recent private messages between the current user and the selected user
    const privateMessages = await Message.find({
      isPrivate: true,
      $or: [
        { from: socket.userID, to: selectedUserID },
        { from: selectedUserID, to: socket.userID },
      ],
    })
      .sort({ _id: -1 }) // Newest first
      .limit(50) // Limit to 50 messages
      .lean(); // Convert to plain JavaScript objects

    // Send private messages to the client in chronological order
    privateMessages.reverse().forEach((message) => {
      socket.emit("privateMessage", message);
    });

    // Mark unread private messages from the selected user as read
    await Message.updateMany(
      {
        to: socket.userID,
        from: selectedUserID,
        isPrivate: true,
        readBy: { $ne: socket.userID }, // Not already read by this user
      },
      {
        $addToSet: { readBy: socket.userID },
        $set: { readAt: new Date().toISOString() },
      }
    );

    // Notify senders of marked messages
    const updatedMessages = await Message.find({
      to: socket.userID,
      from: selectedUserID,
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
    const unreadMessages = await Message.find({
      to: socket.userID,
      isPrivate: true,
      readBy: { $ne: socket.userID }, // Only unread messages
    }).lean();
    socket.emit("unreadMessages", unreadMessages);

    // Broadcast updated user list to all clients
    const users = await getConnectedUsers();
    console.log(
      `Emitting users list after setSelectedUser: ${JSON.stringify(users)}`
    );
    io.emit("users", users);
  } catch (error) {
    console.error(`Error in setSelectedUser handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}

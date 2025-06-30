import Message from "../../models/Message.js";
import User from "../../models/User.js";

const isValidUUID = (str) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};

// Handle the markMessageRead event for marking private messages as read
export default async function handleMarkMessageRead(
  socket,
  io,
  { messageID, userID }
) {
  // Log receipt of markMessageRead event
  console.log(
    `Mark message read: messageID=${messageID}, userID=${userID}, socket=${socket.id}`
  );

  try {
    // Validate input
    if (!messageID || !userID) {
      console.log("Missing messageID or userID in markMessageRead event");
      socket.emit("error", "Message ID and user ID are required");
      return;
    }
    if (!isValidUUID(messageID) || !isValidUUID(userID)) {
      console.log("Invalid UUID format for messageID or userID");
      socket.emit("error", "Invalid message ID or user ID format");
      return;
    }
    if (userID !== socket.userID) {
      console.log(
        `UserID ${userID} does not match socket.userID ${socket.userID}`
      );
      socket.emit("error", "Unauthorized user ID");
      return;
    }

    // Find the message and ensure it's private
    const message = await Message.findOne({ id: messageID, isPrivate: true });
    if (!message) {
      console.log(`Private message ${messageID} not found`);
      socket.emit("error", "Message not found or not private");
      return;
    }

    // Verify the user is the recipient
    if (message.to !== userID) {
      console.log(
        `User ${userID} is not the recipient of message ${messageID}`
      );
      socket.emit("error", "Not authorized to mark this message as read");
      return;
    }

    // Check if already read by this user
    if (message.readBy.includes(userID)) {
      console.log(`Message ${messageID} already read by user ${userID}`);
      return; // No need to update or notify
    }

    // Update message with readBy and readAt
    const updatedMessage = await Message.findOneAndUpdate(
      { id: messageID },
      {
        $addToSet: { readBy: userID }, // Add userID to readBy array
        $set: { readAt: new Date().toISOString() }, // Set read timestamp
      },
      { new: true } // Return updated document
    );

    // Find the sender's socketID
    const sender = await User.findOne({ userID: message.from }).select(
      "socketID"
    );
    if (!sender || !sender.socketID) {
      console.log(`Sender ${message.from} not found or not connected`);
      return; // Sender is offline, no notification needed
    }

    // Notify the sender that the message was read
    io.to(sender.socketID).emit("messageRead", {
      messageID,
      readBy: updatedMessage.readBy,
      readAt: updatedMessage.readAt,
    });

    console.log(
      `Message ${messageID} marked as read by ${userID}, notified sender ${message.from}`
    );
  } catch (error) {
    console.error(`Error in markMessageRead handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}

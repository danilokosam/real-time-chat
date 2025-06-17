import User from "../../models/User.js";

// Handle the stopTyping event to clear typing indicators
export default async function handleStopTyping(socket, io, data) {
  // Log receipt of stopTyping event
  console.log("Received stopTyping event:", data);

  try {
    // Validate data
    if (!data.userName) {
      console.log("No username provided in stopTyping event");
      socket.emit("error", "Username is required");
      return;
    }

    // Private chat stop typing indicator
    if (data.to) {
      // Find recipient by userID
      const recipient = await User.findOne({ userID: data.to }).select(
        "socketID"
      );
      if (!recipient || !recipient.socketID) {
        console.log(`Recipient userID ${data.to} not found or not connected`);
        return;
      }

      // Emit stopTyping indicator to the recipient
      socket.to(recipient.socketID).emit("stopTypingResponse", {
        to: data.to,
        from: socket.userID,
      });
    } else {
      // Public chat stop typing indicator
      socket.broadcast.emit("stopTypingResponse", {
        to: null,
      });
    }
  } catch (error) {
    console.error(`Error in stopTyping handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}

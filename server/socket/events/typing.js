import User from "../../models/User.js";

// Handle the typing event for displaying typing indicators
export default async function handleTyping(socket, io, data) {
  // Log receipt of typing event
  console.log("Received typing event:", data);

  try {
    // Validate data
    if (!data.userName) {
      console.log("No username provided in typing event");
      socket.emit("error", "Username is required");
      return;
    }

    // Private chat typing indicator
    if (data.to) {
      // Find recipient by userID
      const recipient = await User.findOne({ userID: data.to }).select(
        "socketID"
      );
      if (!recipient || !recipient.socketID) {
        console.log(`Recipient userID ${data.to} not found or not connected`);
        return;
      }

      // Emit typing indicator to the recipient
      socket.to(recipient.socketID).emit("typingResponse", {
        userName: data.userName,
        to: data.to,
        from: socket.userID,
      });
    } else {
      // Publich chat typing indicator
      socket.broadcast.emit("typingResponse", {
        userName: data.userName,
        to: null,
      });
    }
  } catch (error) {
    console.error(`Error in typing handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}

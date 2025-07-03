import { v4 as uuidv4 } from "uuid";
import Message from "../../models/Message.js";

// Handle the message event for sending public chat messages
export default async function handleMessage(socket, io, data) {
  // Log receipt of public message
  console.log("Received public message:", data);

  try {
    // Validate socket userID ( ensures user is authenticated )
    if (!socket.userID) {
      console.log("No userID set for socket. Rejecting message.");
      socket.emit("error", "Invalid session. Please sign in again.");
      return;
    }

    // Validate message content
    if (
      !data.text ||
      typeof data.text !== "string" ||
      data.text.trim().length === 0
    ) {
      console.log("Invalid or empty message content");
      socket.emit("error", "Message content is required");
      return;
    }

    // Create public message object
    const message = {
      id: uuidv4(), // Generate unique message ID
      content: data.text.trim(), // Sanitize message content
      from: socket.userID, // Sender's user ID
      fromUsername: data.name, // Sender's username
      to: null, // Null for public messages
      timestamp: new Date().toISOString(), // Use ISO string
      // timestamp: new Date().toLocaleTimeString([], {
      //   hour: "2-digit",
      //   minute: "2-digit",
      //   hour12: true,
      // }), // Formatted timestamp
      isPrivate: false, // Mark as public
      readBy: [], // Initialize readBy
      readAt: null, // Initialize readAt
    };

    // Save message to database
    await Message.create(message);

    // Broadcast message to all connected clients
    io.emit("messageResponse", message);
  } catch (error) {
    console.error(`Error in message handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}

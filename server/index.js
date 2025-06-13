import express from "express"; // Express framework for creating the web server
import { createServer } from "http"; // HTTP module to create an HTTP server
import cors from "cors"; // CORS middleware to allow cross-origin requests
import { Server } from "socket.io"; // Socket.IO for real-time communication
import { v4 as uuidv4 } from "uuid"; // UUID generator for unique message IDs
import connectDB from "./db.js"; // MongoDB connection setup
import User from "./models/User.js"; // Mongoose model for User collection
import Message from "./models/Message.js"; // Mongoose model for Message collection

// Initialize Express app and HTTP server
const app = express(); // Create an Express application
const httpServer = createServer(app); // Create an HTTP server using Express
const io = new Server(httpServer, {
  // Configure Socket.IO with CORS to allow connections from the client
  cors: {
    origin: "http://localhost:5173", // Allow requests from the client running on port 5173
  },
});

// Define the port for the server to listen on
const PORT = process.env.PORT || 3001; // Use environment variable PORT or default to 3001

// Connect to MongoDB
connectDB(); // Initialize MongoDB connection using the connectDB function

// Apply CORS middleware to Express app
app.use(cors()); // Enable cross-origin requests for all routes

// In-memory Map to track selected users for private chats
const selectedUsers = new Map(); // Map: socketID => selectedUserID, stores the user a client is privately chatting with

// Helper function to get the list of connected users from MongoDB
const getConnectedUsers = async () => {
  // Query the User collection for all users, selecting specific fields
  const users = await User.find({}).select("userID username connected");
  // Map users to the format expected by the client
  return users.map((user) => ({
    userID: user.userID, // Socket ID of the user
    username: user.username, // User's chosen username
    connected: user.connected, // Boolean indicating if the user is connected
    unreadCount: 0, // Placeholder for unread message count (updated per client if needed)
  }));
};

// Helper function to get unread private messages for a specific user
const getUnreadMessages = async (userID) => {
  // Query the Message collection for private messages addressed to the user
  return await Message.find({
    to: userID, // Messages where the user is the recipient
    isPrivate: true, // Only private messages
  }).lean(); // Return plain JavaScript objects for simplicity
};

// Handle Socket.IO connection events
io.on("connection", (socket) => {
  // Log when a new client connects
  console.log(`A user connected: ${socket.id}`);

  // Initialize selectedUsers Map for this socket
  selectedUsers.set(socket.id, null); // Set default selected user to null

  // Handle the "newUser" event when a client joins the chat
  socket.on("newUser", async (data) => {
    const { userName } = data; // Extract username from the client's data
    console.log(`newUser event received: ${userName}`);
    // Validate that a username was provided
    if (!userName) {
      console.log("No username provided");
      return;
    }

    // Check if the username is already taken by another user (excluding current socket)
    const existingUser = await User.findOne({
      username: userName,
      userID: { $ne: socket.id }, // Exclude the current socket's ID
    });
    if (existingUser) {
      console.log(`Username ${userName} already exists`);
      // Notify the client of the username conflict
      socket.emit("usernameError", "Username already taken");
      return;
    }

    // Save or update the user in MongoDB
    await User.findOneAndUpdate(
      { userID: socket.id }, // Find user by socket ID
      { username: userName, connected: true, createdAt: new Date() }, // Update or set user data
      { upsert: true, new: true } // Create if not exists, return updated document
    );

    // Store username on the socket for easy access
    socket.username = userName;
    console.log(`${userName} has joined the chat!`);

    // Send any unread private messages to the client
    const unreadMessages = await getUnreadMessages(socket.id);
    socket.emit("unreadMessages", unreadMessages);

    // Send recent public messages to the client
    const recentPublicMessages = await Message.find({ isPrivate: false }) // Fetch public messages
      .sort({ _id: -1 }) // Sort by newest first
      .limit(50) // Limit to the last 50 messages
      .lean(); // Return plain JavaScript objects
    recentPublicMessages.reverse(); // Reverse to send oldest first for correct display order
    recentPublicMessages.forEach((message) => {
      socket.emit("messageResponse", message); // Send each public message to the client
    });

    // Broadcast the updated user list to all clients
    const users = await getConnectedUsers();
    io.emit("users", users); // Emit to all connected clients
  });

  // Handle the "updateConnectionStatus" event to update a user's connection status
  socket.on("updateConnectionStatus", async ({ connected }) => {
    console.log(`Connection status update for ${socket.id}: ${connected}`);
    // Update the user's connected status in MongoDB
    await User.findOneAndUpdate({ userID: socket.id }, { connected });
    // Broadcast the updated user list to all clients
    const users = await getConnectedUsers();
    io.emit("users", users);
  });

  // Handle the "setSelectedUser" event when a user selects another user for private chat
  socket.on("setSelectedUser", async (selectedUserID) => {
    console.log(`User ${socket.id} selected user: ${selectedUserID}`);
    // Store the selected user ID in the in-memory Map
    selectedUsers.set(socket.id, selectedUserID); // Update the selected user for this socket

    // Fetch recent private messages between the current user and the selected user
    const privateMessages = await Message.find({
      isPrivate: true, // Only private messages
      $or: [
        { from: socket.id, to: selectedUserID }, // Messages sent by current user to selected user
        { from: selectedUserID, to: socket.id }, // Messages sent by selected user to current user
      ],
    })
      .sort({ _id: -1 }) // Sort by newest first
      .limit(50) // Limit to the last 50 messages
      .lean(); // Return plain JavaScript objects
    privateMessages.reverse(); // Reverse to send oldest first for correct display order
    privateMessages.forEach((message) => {
      socket.emit("privateMessage", message); // Send each private message to the client
    });

    // Clear unread messages from the selected user
    await Message.deleteMany({
      to: socket.id, // Messages addressed to the current user
      from: selectedUserID, // Messages from the selected user
      isPrivate: true, // Only private messages
    });
    socket.emit("unreadMessages", await getUnreadMessages(socket.id)); // Update unread messages
    // Broadcast the updated user list to all clients
    const users = await getConnectedUsers();
    io.emit("users", users);
  });

  // Handle the "privateMessage" event for sending private messages
  socket.on("privateMessage", async ({ content, to, fromUsername }) => {
    console.log(
      `Private message from ${fromUsername} (socket: ${socket.id}) to ${to}: ${content}`
    );
    // Verify the recipient socket exists
    const recipientSocket = io.sockets.sockets.get(to);
    if (!recipientSocket) {
      console.log(`Recipient socket ${to} not found`);
      return;
    }

    // Create a message object for the private message
    const message = {
      id: uuidv4(), // Generate a unique ID for the message
      content, // Message content
      from: socket.id, // Sender's socket ID
      fromUsername, // Sender's username
      to, // Recipient's socket ID
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }), // Formatted timestamp (e.g., "12:34 PM")
      isPrivate: true, // Mark as a private message
    };

    // Save the private message to MongoDB
    await Message.create(message);

    // Check if the recipient is in a private chat with the sender
    const recipient = await User.findOne({ userID: to });
    if (recipient && selectedUsers.get(to) !== socket.id) {
      // If not in private chat, send unread messages to the recipient
      socket.to(to).emit("unreadMessages", await getUnreadMessages(to));
    }

    // Send the private message to the recipient
    socket.to(to).emit("privateMessage", message);
    // Send the private message back to the sender for display
    socket.emit("privateMessage", message);

    // Broadcast the updated user list to all clients
    const users = await getConnectedUsers();
    io.emit("users", users);
  });

  // Handle the "clearUnreadMessages" event to clear unread private messages
  socket.on("clearUnreadMessages", async (targetUserID) => {
    // Delete private messages from the specified sender to the current user
    await Message.deleteMany({
      to: socket.id, // Messages addressed to the current user
      from: targetUserID, // Messages from the specified sender
      isPrivate: true, // Only private messages
    });
    // Send the updated list of unread messages to the client
    socket.emit("unreadMessages", await getUnreadMessages(socket.id));
    // Broadcast the updated user list to all clients
    const users = await getConnectedUsers();
    io.emit("users", users);
  });

  // Handle the "typing" event to notify when a user is typing
  socket.on("typing", (data) => {
    console.log("Received typing:", data);
    if (data.to) {
      // Private chat: notify only the recipient
      socket.to(data.to).emit("typingResponse", {
        userName: data.userName, // Name of the typing user
        to: data.to, // Recipient's socket ID
        from: socket.id, // Sender's socket ID
      });
    } else {
      // Public chat: notify all clients except the sender
      socket.broadcast.emit("typingResponse", {
        userName: data.userName, // Name of the typing user
        to: null, // Indicates public chat
      });
    }
  });

  // Handle the "stopTyping" event to notify when a user stops typing
  socket.on("stopTyping", (data) => {
    console.log("Received stopTyping", data);
    if (data.to) {
      // Private chat: notify only the recipient
      socket
        .to(data.to)
        .emit("stopTypingResponse", { to: data.to, from: socket.id });
    } else {
      // Public chat: notify all clients except the sender
      socket.broadcast.emit("stopTypingResponse", { to: null });
    }
  });

  // Handle the "message" event for public messages
  socket.on("message", async (data) => {
    console.log("Received message:", data);
    // Create a message object for the public message
    const message = {
      id: uuidv4(), // Generate a unique ID for the message
      content: data.text, // Message content (renamed from text for consistency)
      from: socket.id, // Sender's socket ID
      fromUsername: data.userName, // Sender's username
      to: null, // Null for public messages
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }), // Formatted timestamp
      isPrivate: false, // Mark as a public message
    };

    // Save the public message to MongoDB
    await Message.create(message);
    // Broadcast the public message to all clients
    io.emit("messageResponse", message);
  });

  // Handle the "disconnect" event when a client disconnects
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);
    // Update the user's connection status in MongoDB
    await User.findOneAndUpdate({ userID: socket.id }, { connected: false });
    // Remove the socket from selectedUsers Map
    selectedUsers.delete(socket.id);
    // Broadcast the updated user list to all clients
    const users = await getConnectedUsers();
    io.emit("users", users);
  });
});

// Define a simple API route to test the server
app.get("/api", (_req, res) => {
  res.json({ message: "Hello from the server!" }); // Respond with a JSON message
});

// Start the HTTP server
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`); // Log server startup
});

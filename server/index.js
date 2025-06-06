// Import the Express module to create a web server
import express from "express";
// Import the HTTP module to create an HTTP server based on Express
import { createServer } from "http";
// Import the CORS module to allow cross-origin requests from other domains
import cors from "cors";
// Import the Socket.IO module to handle real-time communication using WebSockets
import { Server } from "socket.io";
// Import the v4 function from UUID to generate unique identifiers for messages
import { v4 as uuidv4 } from "uuid";

// Create an instance of the Express application
const app = express();
// Create an HTTP server that uses the Express application
const httpServer = createServer(app);

// Create a Socket.IO instance attached to the HTTP server with CORS configuration
const io = new Server(httpServer, {
  // Configure CORS to allow connections from the client running on localhost:5173
  cors: {
    origin: "http://localhost:5173", // Allowed domain for client requests
  },
});

// Define the port on which the server will listen, using the PORT environment variable or defaulting to 3001
const PORT = process.env.PORT || 3001;

// Apply the CORS middleware to the Express app to allow cross-origin requests
app.use(cors());

// Create a Map to store unread private messages, where the key is userID and the value is a list of messages
const unreadMessages = new Map(); // Map: userID => [{ content, from, fromUsername, timestamp }]

// Create a Map to store the currently selected user for each socket, used for private chats
const selectedUsers = new Map(); // Map: socketID => selectedUserID

// Create a Map to store the connection status for each socket, where the key is socket.id and the value is an object with the connected property
const connectionStatus = new Map(); // socket.id => { connected: boolean }

// Listen for the "connection" event from Socket.IO, triggered when a client connects to the server
io.on("connection", (socket) => {
  // Log to the console that a user has connected, displaying the socket ID
  console.log(`A user connected: ${socket.id}`);

  // Initialize data for the new socket: set an empty list of unread messages
  unreadMessages.set(socket.id, []);
  // Initialize the selected user for this socket as null (no initial selection)
  selectedUsers.set(socket.id, null);
  // Set the initial connection status of the socket to connected (true)
  connectionStatus.set(socket.id, { connected: true });

  // Send the client any unread messages associated with their socket.id (initially an empty list)
  socket.emit("unreadMessages", unreadMessages.get(socket.id) || []);

  // Listen for the "newUser" event sent by the client when a user joins the chat
  socket.on("newUser", (data) => {
    // Extract the username from the received data object
    const { userName } = data;
    // Log to the console that the "newUser" event was received with the username
    console.log(`newUser event received: ${userName}`);
    // Check if a username was provided; if not, terminate execution
    if (!userName) {
      // Log to the console that no username was provided
      console.log("No username provided");
      return;
    }

    // Check if a user with the same username already exists (excluding the current socket)
    const existingUser = Array.from(io.of("/").sockets).some(
      ([, s]) => s.username === userName && s.id !== socket.id
    );
    // If the username already exists, notify the client and terminate execution
    if (existingUser) {
      // Log to the console that the username is already in use
      console.log(`Username ${userName} already exists`);
      // Emit a "usernameError" event to the client with an error message
      socket.emit("usernameError", "Username already taken");
      return;
    }

    // Assign the username to the socket to identify it
    socket.username = userName;
    // Log to the console that the user has joined the chat
    console.log(`${userName} has joined the chat!`);

    // Create a list of connected users to send to all clients
    const users = Array.from(io.of("/").sockets) // Get all connected sockets
      .map(([, s]) => ({
        // Map each socket to a user object
        userID: s.id, // Socket ID as the user identifier
        username: s.username, // Username of the socket
        unreadCount: (unreadMessages.get(s.id) || []).length, // Number of unread messages
        connected: connectionStatus.get(s.id)?.connected || false, // Connection status of the user
      }))
      .filter((user) => user.username); // Filter only users with a defined username
    // Log to the console the user list that will be sent
    console.log(`Sending users list: ${JSON.stringify(users)}`);
    // Emit the "users" event to all clients with the updated list
    io.emit("users", users); // Emit to all clients
  });

  // Listen for the "updateConnectionStatus" event sent by the client to update the connection status
  socket.on("updateConnectionStatus", ({ connected }) => {
    // Log to the console the connection status update for the socket
    console.log(`Connection status update for ${socket.id}: ${connected}`);
    // Update the connection status in the connectionStatus Map
    connectionStatus.set(socket.id, { connected });
    // Create an updated list of connected users
    const users = Array.from(io.of("/").sockets) // Get all connected sockets
      .map(([, s]) => ({
        // Map each socket to a user object
        userID: s.id, // Socket ID
        username: s.username, // Username
        unreadCount: (unreadMessages.get(s.id) || []).length, // Number of unread messages
        connected: connectionStatus.get(s.id)?.connected || false, // Updated connection status
      }))
      .filter((user) => user.username); // Filter only users with a username
    // Emit the "users" event to all clients with the updated list
    io.emit("users", users); // Emit to all clients
  });

  // Listen for the "setSelectedUser" event sent by the client to set a selected user for a private chat
  socket.on("setSelectedUser", (selectedUserID) => {
    // Log to the console that the socket has selected a user for a private chat
    console.log(`User ${socket.id} selected user: ${selectedUserID}`);
    // Update the selectedUsers Map with the ID of the selected user for this socket
    selectedUsers.set(socket.id, selectedUserID);
    // Create an updated list of connected users
    const users = Array.from(io.of("/").sockets) // Get all connected sockets
      .map(([, s]) => ({
        // Map each socket to a user object
        userID: s.id, // Socket ID
        username: s.username, // Username
        unreadCount: (unreadMessages.get(s.id) || []).length, // Number of unread messages
        connected: connectionStatus.get(s.id)?.connected || false, // Connection status
      }))
      .filter((user) => user.username); // Filter only users with a username
    // Emit the "users" event to all clients with the updated list
    io.emit("users", users); // Emit to all clients
  });

  // Listen for the "privateMessage" event sent by the client to send a private message
  socket.on("privateMessage", ({ content, to, fromUsername }) => {
    // Log to the console the details of the received private message
    console.log(
      `Private message from ${fromUsername} (socket: ${socket.id}) to ${to}: ${content}`
    );
    // Check if the recipient socket exists
    const recipientSocket = io.sockets.sockets.get(to);
    // If the recipient doesn't exist, log an error and terminate execution
    if (!recipientSocket) {
      console.log(`Recipient socket ${to} not found`);
      return;
    }
    // Create a message object with the details of the private message
    const message = {
      id: uuidv4(), // Generate a unique ID for the message
      content, // Message content
      from: socket.id, // Sender's socket ID
      fromUsername, // Sender's username
      to, // Recipient's socket ID
      timestamp: new Date().toLocaleTimeString([], {
        // Formatted timestamp
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }), // Format: HH:MM AM/PM
    };

    // Check if the recipient is in a private chat with the sender
    if (selectedUsers.get(to) !== socket.id) {
      // If not in a private chat, add the message to the recipient's unread messages list
      const recipientUnread = unreadMessages.get(to) || [];
      recipientUnread.push(message);
      unreadMessages.set(to, recipientUnread);
      // Notify the recipient of the new unread messages
      socket.to(to).emit("unreadMessages", recipientUnread);
    }

    // Send the private message to the recipient
    socket.to(to).emit("privateMessage", message);
    // Send the message back to the sender to display in their chat
    socket.emit("privateMessage", message);

    // Create an updated list of connected users with the unread message count
    const users = Array.from(io.of("/").sockets) // Get all connected sockets
      .map(([, s]) => ({
        // Map each socket to a user object
        userID: s.id, // Socket ID
        username: s.username, // Username
        unreadCount: (unreadMessages.get(s.id) || []).length, // Number of unread messages
        connected: connectionStatus.get(s.id)?.connected || false, // Connection status
      }))
      .filter((user) => user.username); // Filter only users with a username
    // Emit the "users" event to all clients with the updated list
    io.emit("users", users); // Emit to all clients
  });

  // Listen for the "clearUnreadMessages" event sent by the client to clear unread messages
  socket.on("clearUnreadMessages", (targetUserID) => {
    // Filter the unread messages for the current socket, removing messages from the target user
    unreadMessages.set(
      socket.id,
      (unreadMessages.get(socket.id) || []).filter(
        (msg) => msg.from !== targetUserID
      )
    );
    // Send the updated list of unread messages to the client
    socket.emit("unreadMessages", unreadMessages.get(socket.id) || []);

    // Create an updated list of connected users with the updated unread message count
    const users = Array.from(io.of("/").sockets) // Get all connected sockets
      .map(([, s]) => ({
        // Map each socket to a user object
        userID: s.id, // Socket ID
        username: s.username, // Username
        unreadCount: (unreadMessages.get(s.id) || []).length, // Updated number of unread messages
        connected: connectionStatus.get(s.id)?.connected || false, // Connection status
      }))
      .filter((user) => user.username); // Filter only users with a username
    // Emit the "users" event to all clients with the updated list
    io.emit("users", users); // Emit to all clients
  });

  // Listen for the "typing" event sent by the client to notify that a user is typing
  socket.on("typing", (data) => {
    // Log to the console that the "typing" event was received
    console.log("Received typing:", data);
    // Check if the "typing" event is for a private chat (data.to exists)
    if (data.to) {
      // Private chat: send the "typingResponse" event only to the recipient
      socket.to(data.to).emit("typingResponse", {
        userName: data.userName, // Name of the user who is typing
        to: data.to, // Recipient's socket ID
        from: socket.id, // Sender's socket ID
      });
    } else {
      // Public chat: send the "typingResponse" event to all clients except the sender
      socket.broadcast.emit("typingResponse", {
        userName: data.userName, // Name of the user who is typing
        to: null, // Indicates a public chat
      });
    }
  });

  // Listen for the "stopTyping" event sent by the client to notify that a user stopped typing
  socket.on("stopTyping", (data) => {
    // Log to the console that the "stopTyping" event was received
    console.log("Received stopTyping", data);
    // Check if the "stopTyping" event is for a private chat (data.to exists)
    if (data.to) {
      // Private chat: send the "stopTypingResponse" event only to the recipient
      socket
        .to(data.to)
        .emit("stopTypingResponse", { to: data.to, from: socket.id });
    } else {
      // Public chat: send the "stopTypingResponse" event to all clients except the sender
      socket.broadcast.emit("stopTypingResponse", { to: null });
    }
  });

  // Listen for the "message" event sent by the client to send a public message
  socket.on("message", (data) => {
    // Log to the console that a public message was received
    console.log("Received message:", data);
    // Create a message object for the public chat
    const message = {
      id: uuidv4(), // Generate a unique ID for the message
      text: data.text, // Message content
      userName: data.userName, // Name of the user who sent the message
      timestamp: new Date().toLocaleTimeString([], {
        // Formatted timestamp
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }), // Format: HH:MM AM/PM
    };
    // Emit the "messageResponse" event to all clients with the public message
    io.emit("messageResponse", message);
  });

  // Listen for the "disconnect" event triggered when a client disconnects
  socket.on("disconnect", () => {
    // Log to the console that a user has disconnected
    console.log(`User disconnected: ${socket.id}`);
    // Update the connection status of the socket to disconnected (false)
    connectionStatus.set(socket.id, { connected: false });
    // Remove unread messages associated with the disconnected socket
    unreadMessages.delete(socket.id);
    // Remove the selected user associated with the disconnected socket
    selectedUsers.delete(socket.id);
    // Create an updated list of connected users
    const updatedUsers = Array.from(io.of("/").sockets) // Get all connected sockets
      .map(([, s]) => ({
        // Map each socket to a user object
        userID: s.id, // Socket ID
        username: s.username, // Username
        unreadCount: (unreadMessages.get(s.id) || []).length, // Number of unread messages
        connected: connectionStatus.get(s.id)?.connected || false, // Updated connection status
      }))
      .filter((user) => user.username); // Filter only users with a username
    // Emit the "users" event to all clients with the updated list
    io.emit("users", updatedUsers); // Emit to all clients
  });
});

// Define a GET route at the "/api" path to test that the Express server is running
app.get("/api", (_req, res) => {
  // Respond with a JSON object containing a test message
  res.json({ message: "Hello from the server!" });
});

// Start the HTTP server and make it listen on the specified port
httpServer.listen(PORT, () => {
  // Log to the console that the server is running and on which port
  console.log(`Server is running on http://localhost:${PORT}`);
});

import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const PORT = process.env.PORT || 3001;

app.use(cors());

// Object to store unread private messages
const unreadMessages = new Map(); // Map: userID => [{ content, from, fromUsername, timestamp }]

// Object to store the currently selected user for each socket
const selectedUsers = new Map(); // Map: socketID => selectedUserID

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Initialize unread messages and selected user for the connected user
  unreadMessages.set(socket.id, []);
  selectedUsers.set(socket.id, null);

  // Upon connection, send unread messages
  socket.emit("unreadMessages", unreadMessages.get(socket.id) || []);

  // Handle new user
  socket.on("newUser", (data) => {
    const { userName } = data;
    console.log(`newUser event received: ${userName}`);
    if (!userName) {
      console.log("No username provided");
      return;
    }

    // Check for duplicate username
    const existingUser = Array.from(io.of("/").sockets).some(
      ([, s]) => s.username === userName && s.id !== socket.id
    );
    if (existingUser) {
      console.log(`Username ${userName} already exists`);
      socket.emit("usernameError", "Username already taken");
      return;
    }

    // Store username in socket object
    socket.username = userName;
    console.log(`${userName} has joined the chat!`);

    // Send current user list to the newly connected client
    const users = Array.from(io.of("/").sockets)
      .map(([, s]) => ({
        userID: s.id,
        username: s.username,
        unreadCount: (unreadMessages.get(s.id) || []).length, // Incluir conteo de mensajes no leídos
      }))
      .filter((user) => user.username); // Filtrar sockets sin nombre de usuario
    console.log(`Sending users list: ${JSON.stringify(users)}`);
    socket.emit("users", users); // Send to the new client
    socket.broadcast.emit("users", users); // Broadcast to other clients
  });

  // Handle setting the selected user for private chat
  socket.on("setSelectedUser", (selectedUserID) => {
    console.log(`User ${socket.id} selected user: ${selectedUserID}`);
    selectedUsers.set(socket.id, selectedUserID); // Update selected user
  });

  // Handle private messages 🔏 +++++++
  socket.on("privateMessage", ({ content, to, fromUsername }) => {
    console.log(
      `Private message from ${fromUsername} (socket: ${socket.id}) to ${to}: ${content}`
    );
    // Verify recipient socket exists
    const recipientSocket = io.sockets.sockets.get(to);
    if (!recipientSocket) {
      console.log(`Recipient socket ${to} not found`);
      return;
    }
    const message = {
      id: uuidv4(), // Unique message ID
      content,
      from: socket.id,
      fromUsername,
      to,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }), // Format as HH:MM AM/PM
    };

    // Only add to unread messages if the recipient is not in a private chat with the sender
    if (selectedUsers.get(to) !== socket.id) {
      const recipientUnread = unreadMessages.get(to) || [];
      recipientUnread.push(message);
      unreadMessages.set(to, recipientUnread);
      socket.to(to).emit("unreadMessages", recipientUnread); // Notify recipient of new unread messages
    }

    socket.to(to).emit("privateMessage", message); // Send to recipient
    socket.emit("privateMessage", message); // Send back to sender

    // Update user list with unread count
    const users = Array.from(io.of("/").sockets)
      .map(([, s]) => ({
        userID: s.id,
        username: s.username,
        unreadCount: (unreadMessages.get(s.id) || []).length,
      }))
      .filter((user) => user.username);

    // Enviar lista de usuarios solo al remitente y al destinatario
    socket.emit("users", users); // Enviar al remitente
    socket.to(to).emit("users", users); // Enviar al destinatario
  });
  // Handle private messages 🔏 -----

  // Event to clear unread messages when a user opens the chat 🧽
  socket.on("clearUnreadMessages", (targetUserID) => {
    unreadMessages.set(
      socket.id,
      (unreadMessages.get(socket.id) || []).filter(
        (msg) => msg.from !== targetUserID
      )
    );
    socket.emit("unreadMessages", unreadMessages.get(socket.id) || []); // Send updated unread messages

    // Update user list
    const users = Array.from(io.of("/").sockets)
      .map(([, s]) => ({
        userID: s.id,
        username: s.username,
        unreadCount: (unreadMessages.get(s.id) || []).length,
      }))
      .filter((user) => user.username);
    socket.emit("users", users); // Send to the client who cleared the messages
    socket.to(targetUserID).emit("users", users); // Send to the target user
  });

  // Handle typing ✍️
  socket.on("typing", (data) => {
    console.log("Received typing:", data);
    if (data.to) {
      // Private chat: send only to the recipient
      socket.to(data.to).emit("typingResponse", {
        userName: data.userName,
        to: data.to,
        from: socket.id,
      });
    } else {
      // Public chat: send to all except the sender
      socket.broadcast.emit("typingResponse", {
        userName: data.userName,
        to: null,
      });
    }
  });

  // Handle stop typing ✍️🛑
  socket.on("stopTyping", (data) => {
    console.log("Received stopTyping", data);
    if (data.to) {
      // Private chat: send only to the recipient
      socket
        .to(data.to)
        .emit("stopTypingResponse", { to: data.to, from: socket.id });
    } else {
      // Public chat: send to all except the sender
      socket.broadcast.emit("stopTypingResponse", { to: null });
    }
  });

  // Handle public messages
  socket.on("message", (data) => {
    console.log("Received message:", data);
    const message = {
      id: uuidv4(), // Unique message ID
      text: data.text,
      userName: data.userName,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }), // Format as HH:MM AM/PM
    };
    io.emit("messageResponse", message);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    unreadMessages.delete(socket.id); // Remove unread messages for disconnected user
    selectedUsers.delete(socket.id); // Clean up selected user
    // Update user list
    const updatedUsers = Array.from(io.of("/").sockets)
      .map(([, s]) => ({
        userID: s.id,
        username: s.username,
        unreadCount: (unreadMessages.get(s.id) || []).length,
      }))
      .filter((user) => user.username);
    io.emit("users", updatedUsers);
  });
});

app.get("/api", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

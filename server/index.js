import express from "express";
import { createServer } from "http";
import cors from "cors";
import { Server } from "socket.io";

const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
  },
});
const PORT = process.env.PORT || 3001;

app.use(cors());

// Handle socket connections
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

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
    const users = [];
    for (let [id, socket] of io.of("/").sockets) {
      if (socket.username) {
        users.push({
          userID: id,
          username: socket.username,
        });
      }
    }
    console.log(`Sending users list: ${JSON.stringify(users)}`);
    socket.emit("users", users); // Send to the new client
    socket.broadcast.emit("users", users); // Broadcast to other clients
  });

  // Handle typing
  socket.on("typing", (data) => {
    console.log("Received typing:", data);
    socket.broadcast.emit("typingResponse", data);
  });

  // Handle stop typing
  socket.on("stopTyping", () => {
    console.log("Received stopTyping");
    socket.broadcast.emit("stopTypingResponse");
  });

  // Handle messages
  socket.on("message", (data) => {
    console.log("Received message:", data);
    io.emit("messageResponse", data);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
    // Update user list
    const updatedUsers = [];
    for (let [id, socket] of io.of("/").sockets) {
      if (socket.username) {
        updatedUsers.push({
          userID: id,
          username: socket.username,
        });
      }
    }
    io.emit("users", updatedUsers); // Broadcast to all clients on disconnect
  });
});

app.get("/api", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

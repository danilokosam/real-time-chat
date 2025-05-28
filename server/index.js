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
const PORT = process.env.PORT || 3000;

app.use(cors());
let users = [];

io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);

  // Send current user list to the newly connected client
  socket.emit("newUserResponse", users);

  // Handle new user
  socket.on("newUser", (data) => {
    const socketID = data.socketID || socket.id; // Use socket.id as fallback
    if (!users.some((user) => user.socketID === socketID)) {
      users.push({ ...data, socketID });
      console.log(`${data.userName} has joined the chat!`);
      console.log("Current users:", users);
      io.emit("newUserResponse", users);
    } else {
      console.log(`User ${data.userName} already exists with socketID ${socketID}`);
    }
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
    users = users.filter((user) => user.socketID !== socket.id);
    io.emit("newUserResponse", users);
  });
});

app.get("/api", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
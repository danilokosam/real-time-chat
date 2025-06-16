// Import required modules
import express from "express";
import { createServer } from "http";
import cors from "cors";
import cookieParser from "cookie-parser";
import { Server } from "socket.io";
import { v4 as uuidv4 } from "uuid";
import cookie from "cookie"; // Added for parsing cookies
import connectDB from "./db.js";
import User from "./models/User.js";
import Message from "./models/Message.js";

// Initialize Express app and HTTP server
const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Cookie"],
    methods: ["GET", "POST"],
  },
  transports: ["polling", "websocket"],
});

// Socket.IO middleware to parse and log cookies
io.use((socket, next) => {
  const rawCookies = socket.request.headers.cookie || "none";
  console.log(`Socket.IO incoming cookies: ${rawCookies}`);
  if (rawCookies !== "none") {
    const parsedCookies = cookie.parse(rawCookies);
    socket.request.cookies = parsedCookies; // Attach parsed cookies
    console.log(`Parsed cookies for socket: ${JSON.stringify(parsedCookies)}`);
  } else {
    socket.request.cookies = {};
  }
  next();
});

// Define the port
const PORT = process.env.PORT || 3001;

// Connect to MongoDB and reset connected status
connectDB().then(async () => {
  await User.updateMany({}, { $set: { connected: false, socketID: null } });
  console.log(
    "Reset all users' connected status and socketID to false on startup"
  );
});

// Apply middleware
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    allowedHeaders: ["Content-Type", "Cookie"],
    methods: ["GET", "POST"],
  })
);
app.use(cookieParser());
app.use(express.json());

// In-memory Map to track selected users for private chats
const selectedUsers = new Map();

// Helper function to get connected users
const getConnectedUsers = async () => {
  const users = await User.find({}).select("userID username connected");
  return users.map((user) => ({
    userID: user.userID,
    username: user.username,
    connected: user.connected,
    unreadCount: 0,
  }));
};

// Helper function to get unread private messages
const getUnreadMessages = async (userID) => {
  return await Message.find({
    to: userID,
    isPrivate: true,
  }).lean();
};

// New POST /api/login endpoint
app.post("/api/login", async (req, res) => {
  const { userName } = req.body;
  console.log(`POST /api/login received for username: ${userName}`);
  if (!userName) {
    console.log("Username is required");
    return res.status(400).json({ error: "Username is required" });
  }

  // Validate username
  if (
    userName.length < 3 ||
    userName.length > 20 ||
    !/^[a-zA-Z0-9 ]+$/.test(userName)
  ) {
    console.log("Invalid username");
    return res.status(400).json({ error: "Invalid username" });
  }

  // Check if username is taken
  const existingUser = await User.findOne({ username: userName });
  if (existingUser) {
    console.log(`Username ${userName} already taken`);
    return res.status(409).json({ error: "Username already taken" });
  }

  // Generate new userID and sessionToken
  const newUserID = uuidv4();
  const newSessionToken = uuidv4();
  console.log(
    `Generated userID: ${newUserID}, sessionToken: ${newSessionToken}`
  );

  // Create new user
  await User.create({
    userID: newUserID,
    socketID: null,
    username: userName,
    connected: false,
    sessionToken: newSessionToken,
    createdAt: new Date(),
  });

  // Set session cookie
  res.cookie("sessionToken", newSessionToken, {
    httpOnly: true,
    secure: false,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  console.log(`Set sessionToken cookie: ${newSessionToken}`);

  res.status(200).json({ message: "Login successful" });
});

// Test endpoint to verify cookie receipt
app.get("/api/test-cookie", (req, res) => {
  const sessionToken = req.cookies?.sessionToken || "none";
  console.log(`GET /api/test-cookie received, sessionToken: ${sessionToken}`);
  res.json({ sessionToken });
});

// Handle Socket.IO connection events
io.on("connection", (socket) => {
  console.log(`A user connected: ${socket.id}`);
  selectedUsers.set(socket.id, null);

  // Log connection errors
  socket.on("error", (err) => {
    console.error(`Socket ${socket.id} error: ${err.message}`);
  });

  socket.on("newUser", async (data) => {
    const { userName } = data;
    console.log(`newUser event received: ${userName}`);
    if (!userName) {
      console.log("No username provided");
      socket.emit("usernameError", "No username provided");
      return;
    }

    // Get session token from parsed cookies
    const sessionToken = socket.request.cookies?.sessionToken || "none";
    console.log(`Session token from socket: ${sessionToken}`);
    let user;

    if (sessionToken !== "none") {
      user = await User.findOne({ sessionToken });
      console.log(
        `User lookup for sessionToken: ${user ? "found" : "not found"}`
      );
      if (user) {
        if (user.username !== userName) {
          console.log(
            `Username ${userName} does not match session token's username ${user.username}`
          );
          socket.emit("usernameError", "Username does not match session");
          return;
        }
        // Update user with new socketID and connected status
        await User.updateOne(
          { sessionToken },
          { socketID: socket.id, connected: true }
        );
        console.log(
          `Reconnected user ${userName} with session token ${sessionToken}`
        );
      }
    }

    if (!user) {
      console.log("Invalid session. Emitting usernameError.");
      socket.emit("usernameError", "Invalid session. Please sign in again.");
      return;
    }

    socket.username = userName;
    socket.userID = user.userID;
    console.log(`${userName} has joined the chat!`);

    const unreadMessages = await getUnreadMessages(user.userID);
    socket.emit("unreadMessages", unreadMessages);

    const recentPublicMessages = await Message.find({ isPrivate: false })
      .sort({ _id: -1 })
      .limit(50)
      .lean();
    recentPublicMessages.reverse().forEach((message) => {
      socket.emit("messageResponse", message);
    });

    const users = await getConnectedUsers();
    console.log(
      `Emitting users list to socket ${socket.id}: ${JSON.stringify(users)}`
    );
    io.emit("users", users);
  });

  socket.on("updateConnectionStatus", async ({ connected }) => {
    console.log(`Connection status update for ${socket.id}: ${connected}`);
    await User.findOneAndUpdate({ socketID: socket.id }, { connected });
    const users = await getConnectedUsers();
    io.emit("users", users);
  });

  socket.on("setSelectedUser", async (selectedUserID) => {
    console.log(`User ${socket.id} selected user: ${selectedUserID}`);
    selectedUsers.set(socket.id, selectedUserID);

    const privateMessages = await Message.find({
      isPrivate: true,
      $or: [
        { from: socket.userID, to: selectedUserID },
        { from: selectedUserID, to: socket.userID },
      ],
    })
      .sort({ _id: -1 })
      .limit(50)
      .lean();
    privateMessages.reverse().forEach((message) => {
      socket.emit("privateMessage", message);
    });

    await Message.deleteMany({
      to: socket.userID,
      from: selectedUserID,
      isPrivate: true,
    });
    socket.emit("unreadMessages", await getUnreadMessages(socket.userID));

    const users = await getConnectedUsers();
    console.log(
      `Emitting users list after setSelectedUser: ${JSON.stringify(users)}`
    );
    io.emit("users", users);
  });

  socket.on("privateMessage", async ({ content, to, fromUsername }) => {
    console.log(
      `Private message from ${fromUsername} (socket: ${socket.id}) to ${to}: ${content}`
    );
    const recipient = await User.findOne({ userID: to }).select("socketID");
    if (!recipient || !recipient.socketID) {
      console.log(`Recipient userID ${to} not found or not connected`);
      return;
    }

    const message = {
      id: uuidv4(),
      content,
      from: socket.userID,
      fromUsername,
      to,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      isPrivate: true,
    };

    await Message.create(message);


    if (selectedUsers.get(recipient.socketID) !== socket.userID) {
      socket
        .to(recipient.socketID)
        .emit("unreadMessages", await getUnreadMessages(to));
    }

    socket.to(recipient.socketID).emit("privateMessage", message);
    
    socket.emit("privateMessage", message);

    const users = await getConnectedUsers();
    console.log(
      `Emitting users list after private message: ${JSON.stringify(users)}`
    );
    io.emit("users", users);
  });

  socket.on("clearUnreadMessages", async (targetUserID) => {
    await Message.deleteMany({
      to: socket.userID,
      from: targetUserID,
      isPrivate: true,
    });
    socket.emit("unreadMessages", await getUnreadMessages(socket.userID));
    const users = await getConnectedUsers();
    io.emit("users", users);
  });

  socket.on("typing", async (data) => {
    console.log("Received typing:", data);
    if (data.to) {
      const recipient = await User.findOne({ userID: data.to }).select(
        "socketID"
      );
      if (recipient && recipient.socketID) {
        socket.to(recipient.socketID).emit("typingResponse", {
          userName: data.userName,
          to: data.to,
          from: socket.userID,
        });
      }
    } else {
      socket.broadcast.emit("typingResponse", {
        userName: data.userName,
        to: null,
      });
    }
  });

  socket.on("stopTyping", async (data) => {
    console.log("Received stopTyping", data);
    if (data.to) {
      const recipient = await User.findOne({ userID: data.to }).select(
        "socketID"
      );
      if (recipient && recipient.socketID) {
        socket.to(recipient.socketID).emit("stopTypingResponse", {
          to: data.to,
          from: socket.userID,
        });
      }
    } else {
      socket.broadcast.emit("stopTypingResponse", { to: null });
    }
  });

  socket.on("message", async (data) => {
    console.log("Received message:", data);
    if (!socket.userID) {
      console.log("No userID set for socket. Rejecting message.");
      socket.emit("error", "Invalid session. Please sign in again.");
      return;
    }
    const message = {
      id: uuidv4(),
      content: data.text,
      from: socket.userID,
      fromUsername: data.userName,
      to: null,
      timestamp: new Date().toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      }),
      isPrivate: false,
    };

    await Message.create(message);
    io.emit("messageResponse", message);
  });

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);
    await User.findOneAndUpdate(
      { socketID: socket.id },
      { connected: false, socketID: null }
    );
    selectedUsers.delete(socket.id);
    const users = await getConnectedUsers();
    io.emit("users", users);
  });
});

// Simple API route to test the server
app.get("/api", (_req, res) => {
  res.json({ message: "Hello from the server!" });
});

// Start the server
httpServer.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

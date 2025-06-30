import { createServer } from "http";
import { Server } from "socket.io";
import app from "./app.js";
import connectDB from "./config/db.js";
import User from "./models/User.js";
import { initializeSocket } from "./socket/index.js";
import { PORT, CORS_ORIGIN } from "./utils/constants.js";
import mongoose from "mongoose";

// Initialize HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new Server(httpServer, {
  cors: {
    origin: CORS_ORIGIN,
    credentials: true,
    allowedHeaders: ["Content-Type", "Cookie"],
    methods: ["GET", "POST"],
  },
  transports: ["polling", "websocket"],
});

// Start server after connecting to MongoDB
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();
    console.log("MongoDB connection established ✅");

    // Reset user connection status
    await User.updateMany(
      {},
      { $set: { connected: false }, $unset: { socketID: "" } }
    );
    console.log("Reset all users' connected status and socketID on startup ✅");

    // Initialize Socket.IO event handlers
    initializeSocket(io);

    // Start the server
    httpServer.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT} ✅`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

// Handle graceful shutdown
const shutdown = async (signal) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  try {
    // Close Socket.IO connections
    io.close(() => {
      console.log("Socket.IO server closed ✅");
    });

    // Close HTTP server
    await new Promise((resolve, reject) => {
      httpServer.close((err) => {
        if (err) reject(err);
        else resolve();
      });
    });
    await mongoose.connection.close();
    console.log("MongoDB connection closed ✅");
    
    console.log("HTTP server closed ✅");

    // MongoDB connection is closed in config/db.js
    process.exit(0);
  } catch (error) {
    console.error(`❌ Error during shutdown:`, error);
    process.exit(1);
  }
};

// Start the server
startServer();

// Listen for termination signals
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("SIGTERM", () => shutdown("SIGTERM"));

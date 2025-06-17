import mongoose from "mongoose";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const connectDB = async () => {
  try {
    // Validate connection string
    const connectionString = process.env.MONGO_URI;
    if (!connectionString) {
      throw new Error("MONGO_URI is not defined in environment variables");
    }

    console.log("Attempting to connect to MongoDB...");

    // Connection options for stability
    const options = {
      retryWrites: true, // Retry write operations on transient errors
      serverSelectionTimeoutMS: 5000, // Timeout for server selection
      maxPoolSize: 10, // Max connections in the pool
      autoIndex: true, // Automatically build indexes
    };

    // Connection event listeners
    mongoose.connection.on("connecting", () => {
      console.log("Connecting to MongoDB...");
    });

    mongoose.connection.on("connected", () => {
      console.log("Successfully connected to MongoDB ✅");
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Disconnected from MongoDB");
    });

    mongoose.connection.on("error", (error) => {
      console.error("MongoDB connection error:", error);
    });

    // Connect to MongoDB
    await mongoose.connect(connectionString, options);
    console.log("MongoDB connected successfully ✅");
  } catch (error) {
    console.error("❌ Error connecting to MongoDB:", error);
    process.exit(1); // Exit with failure to prevent running without DB
  }
};

// Graceful shutdown on SIGINT (e.g., Ctrl+C)
process.on("SIGINT", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to SIGINT");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});

// Handle SIGTERM (e.g., process termination)
process.on("SIGTERM", async () => {
  try {
    await mongoose.connection.close();
    console.log("MongoDB connection closed due to SIGTERM");
    process.exit(0);
  } catch (error) {
    console.error("Error closing MongoDB connection:", error);
    process.exit(1);
  }
});

export default connectDB;

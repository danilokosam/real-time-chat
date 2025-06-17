import User from "../../models/User.js";
import { getConnectedUsers } from "../../utils/users.js";

// Handle the updateConnectionStatus event to update a user's connection status
export default async function handleUpdateConnectionStatus(socket, io, data) {
  // Log receipt of updateConnectionStatus event
  console.log(`Received updateConnectionStatus for socket ${socket.id}:`, data);

  try {
    // Validate data
    if (typeof data.connected !== "boolean") {
      console.log("Invalid connection status provided");
      socket.emit("error", "Valid connection status is required");
      return;
    }

    // Update the user's connection status in the database
    const updatedUser = await User.findOneAndUpdate(
      { userID: socket.userID },
      { connected: data.connected },
      { new: true } // Return the updated document
    );

    if (!updatedUser) {
      console.log(`User with userID ${socket.userID} not found`);
      socket.emit("error", "User not found");
      return;
    }

    // Broadcast updated user list to all clients
    const users = await getConnectedUsers();
    console.log(
      `Emitting users list after updateConnectionStatus: ${JSON.stringify(
        users
      )}`
    );
    io.emit("users", users);
  } catch (error) {
    console.error(`Error in updateConnectionStatus handler: ${error.message}`);
    socket.emit("error", "Server error. Please try again.");
  }
}

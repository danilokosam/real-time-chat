import User from "../../models/User.js";
import { getConnectedUsers } from "../../utils/users.js";
import { setSelectedUser, deleteSelectedUser } from "../../utils/store.js";

// Handle Socket.IO connection and disconnection events
export default async function handleConnection(socket, io) {
  // Log new socket connection
  console.log(`A user connected: ${socket.id}`);

  // Initialize selected user for this socket (null initially)
  setSelectedUser(socket.id, null);

  // Handle socket disconnection
  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);
    try {
      // Update user status in database to disconnected
      await User.findOneAndUpdate(
        { socketID: socket.id },
        { connected: false, socketID: null }
      );

      // Remove selected user entry for this socket
      deleteSelectedUser(socket.id);

      // Broadcast updated user list to all clients
      const users = await getConnectedUsers();
      io.emit("users", users);
    } catch (error) {
      console.error(`Error in disconnect handler: ${error.message}`);
    }
  });
}

import User from "../../models/User.js";
import { getConnectedUsers, getDisconnectedUsers } from "../../utils/users.js";
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
      const currentDate = new Date()
      
      // Update user status in database to disconnected
      await User.findOneAndUpdate(
        { socketID: socket.id },
        { $set: { connected: false }, $unset: { socketID: "" }, lastTimeOnline: currentDate } // Pendiente de revisar
      );

      // Remove selected user entry for this socket
      deleteSelectedUser(socket.id);

      const disconnectedUsers = await getDisconnectedUsers()

      // Broadcast updated user list to all clients
      const connectedUsers = await getConnectedUsers();
      io.emit("connectedUsers", connectedUsers);
      io.emit("disconnectedUsers", disconnectedUsers);
    } catch (error) {
      console.error(`Error in disconnect handler: ${error.message}`);
    }
  });
}

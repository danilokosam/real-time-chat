import {
  handleNewUser,
  handlePrivateMessage,
  handleMessage,
  handleTyping,
  handleStopTyping,
  handleSetSelectedUser,
  handleClearUnreadMessages,
  handleConnection,
  handleUpdateConnectionStatus,
  handleMarkMessageRead,
  handleGetMessages,
  handleGetPrivateMessages,
} from "./events/index.js";
import { cookieMiddleware } from "./middleware.js";

// Initialize Socket.IO and register event handlers
export const initializeSocket = (io) => {
  io.use(cookieMiddleware);

  // Handle socket connections
  io.on("connection", (socket) => {
    handleConnection(socket, io);
    socket.on("newUser", (data) => handleNewUser(socket, io, data));
    socket.on("privateMessage", (data) =>
      handlePrivateMessage(socket, io, data)
    );
    socket.on("message", (data) => handleMessage(socket, io, data));
    socket.on("getMessages", () => handleGetMessages(socket));
    socket.on("getPrivateMessages", (data) =>
      handleGetPrivateMessages(socket, data)
    );
    socket.on("typing", (data) => handleTyping(socket, io, data));
    socket.on("stopTyping", (data) => handleStopTyping(socket, io, data));
    socket.on("setSelectedUser", (selectedUserID) =>
      handleSetSelectedUser(socket, io, selectedUserID)
    );
    socket.on("clearUnreadMessages", (targetUserID) =>
      handleClearUnreadMessages(socket, io, targetUserID)
    );
    socket.on("updateConnectionStatus", (data) =>
      handleUpdateConnectionStatus(socket, io, data)
    );
    socket.on("markMessageRead", (data) =>
      handleMarkMessageRead(socket, io, data)
    );
    socket.on("error", (err) =>
      console.error(`Socket ${socket.id} error: ${err.message}`)
    );
  });
};

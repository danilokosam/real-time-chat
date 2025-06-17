// In-memory store for tracking selected users for private chats
const selectedUsers = new Map();

export const getSelectedUser = (socketId) => selectedUsers.get(socketId);
export const setSelectedUser = (socketId, userId) =>
  selectedUsers.set(socketId, userId);
export const deleteSelectedUser = (socketId) => selectedUsers.delete(socketId);

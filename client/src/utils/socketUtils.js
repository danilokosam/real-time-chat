export const selectUserForChat = (
  socket,
  user,
  setSelectedUser,
  setCurrentSelectedUser
) => {
  if (!user.self) {
    setSelectedUser({ userID: user.userID, username: user.username });
    setCurrentSelectedUser(user.userID);
    socket.emit("setSelectedUser", user.userID);
    socket.emit("clearUnreadMessages", user.userID);
    console.log(`Selected user for private chat: ${user.username}`);
  }
};

export const selectPublicChat = (
  socket,
  setSelectedUser,
  setCurrentSelectedUser
) => {
  setSelectedUser(null);
  setCurrentSelectedUser(null);
  socket.emit("setSelectedUser", null);
  console.log("Returned to public chat");
};

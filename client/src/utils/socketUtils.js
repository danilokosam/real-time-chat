import debounce from "lodash/debounce";

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

export const sendMessage = (
  socket,
  message,
  selectedUser,
  currentUserID,
  userName,
  setMessage
) => {
  if (!currentUserID) {
    console.log("Cannot send message: no userID");
    return;
  }
  if (!userName) {
    console.log("Cannot send message: no userName in localStorage");
    return;
  }
  if (!message.trim()) return;

  if (selectedUser) {
    console.log(
      `Sending private message to ${selectedUser.username}: ${message}`
    );
    socket.emit("privateMessage", {
      content: message,
      to: selectedUser.userID,
      fromUsername: userName,
      from: currentUserID,
    });
    socket.emit("stopTyping", {
      userName,
      to: selectedUser.userID,
      from: currentUserID,
    });
  } else {
    console.log(`Sending public message: ${message} from ${userName}`);
    socket.emit("message", {
      text: message,
      userName,
      from: currentUserID,
    });
    socket.emit("stopTyping", {
      userName,
      to: null,
      from: currentUserID,
    });
  }
  setMessage("");
};

export const handleTyping = (
  socket,
  currentUserID,
  userName,
  selectedUser,
  typingTimeoutRef
) => {
  return debounce(() => {
    if (!currentUserID) {
      console.log("Cannot handle typing: no userID");
      return;
    }
    if (!userName) {
      console.log("Cannot handle typing: no userName in localStorage");
      return;
    }
    console.log(`${userName} is typing...`);
    const typingData = {
      userName,
      to: selectedUser ? selectedUser.userID : null,
      from: currentUserID,
    };
    socket.emit("typing", typingData);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stopTyping", {
        userName,
        to: selectedUser ? selectedUser.userID : null,
        from: currentUserID,
      });
    }, 1000);
  }, 500);
};

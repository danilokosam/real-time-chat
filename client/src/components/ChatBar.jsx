// client/src/components/ChatBar.jsx
import { useState, useEffect } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "../hooks/useUsers";
import { useUnreadMessages } from "../hooks/useUnreadMessages";

export const ChatBar = ({ setSelectedUser }) => {
  const { socket } = useSocketContext();
  const { users, currentUserID } = useUsers();
  const { unreadMessages } = useUnreadMessages();
  const [currentSelectedUser, setCurrentSelectedUser] = useState(null);

  useEffect(() => {
    console.log("Users from useUsers:", users);
  }, [users]);

  const processedUsers = users
    .map((user) => ({
      ...user,
      self: user.userID === currentUserID,
    }))
    .sort((a, b) => {
      if (a.self) return -1;
      if (b.self) return 1;
      if (a.username < b.username) return -1;
      if (a.username > b.username) return 1;
      return 0;
    });

  const handleUserClick = (user) => {
    if (!user.self) {
      setSelectedUser({ userID: user.userID, username: user.username });
      setCurrentSelectedUser(user.userID);
      socket.emit("setSelectedUser", user.userID);
      socket.emit("clearUnreadMessages", user.userID);
      console.log(`Selected user for private chat: ${user.username}`);
    }
  };

  const handlePublicChatClick = () => {
    setSelectedUser(null);
    setCurrentSelectedUser(null);
    socket.emit("setSelectedUser", null);
    console.log("Returned to public chat");
  };

  const getUnreadCountBySender = (senderID) => {
    if (senderID === currentSelectedUser) return 0;
    return unreadMessages.filter((msg) => msg.from === senderID).length;
  };

  return (
    <div className="chat__sidebar">
      <h2>Chat</h2>
      <div>
        <button onClick={handlePublicChatClick} className="public-chat-button">
          Public Chat
        </button>
        <h4 className="chat__header">ACTIVE USERS</h4>
        <div className="chat__users">
          {processedUsers.length > 0 ? (
            processedUsers.map((user) => (
              <p
                key={user.userID}
                className={user.self ? "current-user" : "user-selectable"}
                onClick={() => handleUserClick(user)}
              >
                {user.self ? `${user.username} (You)` : user.username}
                <span
                  className={`connection-indicator ${
                    user.connected ? "online" : "offline"
                  }`}
                ></span>
                <span className="connection-text">
                  {user.connected ? "Online" : "Offline"}
                </span>
                {!user.self && getUnreadCountBySender(user.userID) > 0 && (
                  <span className="unread-indicator">
                    {getUnreadCountBySender(user.userID)}
                  </span>
                )}
                {console.log(
                  `Rendering user: ${
                    user.username
                  }, unreadCount: ${getUnreadCountBySender(
                    user.userID
                  )}, self: ${user.self}, connected: ${user.connected}`
                )}
              </p>
            ))
          ) : (
            <p className="no-users">No users connected</p>
          )}
        </div>
      </div>
    </div>
  );
};

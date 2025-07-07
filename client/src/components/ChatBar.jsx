import { useState, useEffect } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUserContext } from "../context/useUserContext";
import { useUsers } from "../hooks/useUsers";
import { useUnreadMessages } from "../hooks/useUnreadMessages";
import { processUsers } from "../utils/userUtils";
import { selectUserForChat, selectPublicChat } from "../utils/socketUtils";
import { UserList } from "./UserLIst";

export const ChatBar = ({ setSelectedUser }) => {
  const { socket } = useSocketContext();
  const { currentUserID } = useUserContext();
  const { users } = useUsers();
  const { unreadMessages } = useUnreadMessages();
  const [currentSelectedUser, setCurrentSelectedUser] = useState(null);

  useEffect(() => {
    console.log("📥 Users from useUsers:", users);
  }, [users]);

  const processedUsers = processUsers(users, currentUserID);

  const handleUserClick = (user) => {
    selectUserForChat(socket, user, setSelectedUser, setCurrentSelectedUser);
  };

  const handlePublicChatClick = () => {
    selectPublicChat(socket, setSelectedUser, setCurrentSelectedUser);
  };

  return (
    <div className="chat__sidebar">
      <h2>Chat</h2>
      <div className="chat__controls">
        <button onClick={handlePublicChatClick} className="public-chat-button">
          Public Chat
        </button>
        <h4 className="chat__header">ACTIVE USERS</h4>
        <UserList
          users={processedUsers}
          currentSelectedUser={currentSelectedUser}
          handleUserClick={handleUserClick}
          unreadMessages={unreadMessages}
        />
      </div>
    </div>
  );
};

import { useState, useEffect } from "react";

export const ChatBar = ({ socket }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleNewUserResponse = (data) => {
      console.log("Received newUserResponse:", data);
      // Remove duplicates based on socketID
      const uniqueUsers = Array.from(
        new Map(data.map((user) => [user.socketID, user])).values()
      );
      console.log("Unique users:", uniqueUsers);
      setUsers(uniqueUsers);
    };

    socket.on("newUserResponse", handleNewUserResponse);

    // Cleanup listener on component unmount
    return () => {
      socket.off("newUserResponse", handleNewUserResponse);
    };
  }, [socket]);

  useEffect(() => {
    console.log("Users state updated:", users);
  }, [users]);

  const currentUserName = localStorage.getItem("userName");

  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>
      <div>
        <h4 className="chat__header">ACTIVE USERS</h4>
        <div className="chat__users">
          {users
            .filter((user) => user.userName !== currentUserName)
            .map((user, index) => (
              <p key={user.socketID || `user-${index}`}>
                {user.userName}
                <span className="online-indicator"></span>
              </p>
            ))}
        </div>
      </div>
    </div>
  );
};

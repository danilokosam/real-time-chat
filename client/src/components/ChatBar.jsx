import { useState, useEffect } from "react";

export const ChatBar = ({ socket }) => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const handleUsers = (data) => {
      console.log("Received users:", data);
      // Remove duplicates based on userID (just in case)
      const uniqueUsers = Array.from(
        new Map(data.map((user) => [user.userID, user])).values()
      );
      console.log("Unique users:", uniqueUsers);
      setUsers(uniqueUsers);
    };

    socket.on("users", handleUsers);

    // Handle username error
    socket.on("usernameError", (message) => {
      console.error("Username error:", message);
      // Optionally, redirect to home or show an alert
      localStorage.removeItem("userName");
      window.location.href = "/"; // Redirect to home
    });

    // Cleanup listeners on component unmount
    return () => {
      socket.off("users", handleUsers);
      socket.off("usernameError");
    };
  }, [socket]);

  useEffect(() => {
    console.log("Users state updated:", users);
  }, [users]);

  const currentUserName = localStorage.getItem("userName");
  const filteredUsers = users.filter(
    (user) => user.username !== currentUserName
  );

  return (
    <div className="chat__sidebar">
      <h2>Open Chat</h2>
      <div>
        <h4 className="chat__header">ACTIVE USERS</h4>
        <div className="chat__users">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <p key={user.userID}>
                {user.username}
                <span className="online-indicator"></span>
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

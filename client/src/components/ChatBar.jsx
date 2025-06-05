import { useState, useEffect } from "react";

// ChatBar component displays the sidebar with a list of active users in the chat
// Receives socket for real-time communication and setSelectedUser to initiate private chats
export const ChatBar = ({ socket, setSelectedUser }) => {
  const [users, setUsers] = useState([]); // State to store the list of connected users
  const [unreadMessages, setUnreadMessages] = useState([]); // State to store unread messages
  const [currentSelectedUser, setCurrentSelectedUser] = useState(null); // Track selected user locally

  // Effect to handle socket events for user list updates 🌬️ and errors ❌
  useEffect(() => {
    // Handler for the "users" event from the server
    const handleUsers = (data) => {
      console.log("Received users:", data);

      // Remove any duplicate users based on userID
      // Map to add a 'self' property to identify the current user 🙍‍♂️
      const uniqueUsers = Array.from(
        new Map(data.map((user) => [user.userID, user])).values()
      ).map((user) => ({
        ...user,
        self: user.userID === socket.id, // Mark as true if user matches the socket ID
      }));

      // Sort users: place the current user (self: true) first, then sort others alphabetically by username
      const sortedUsers = uniqueUsers.sort((a, b) => {
        if (a.self) return -1; // Current user is prioritized at the top
        if (b.self) return 1; // Other users come after the current user
        if (a.username < b.username) return -1; // Alphabetical sort for non-self users
        if (a.username > b.username) return 1;
        return 0; // Equal usernames (rare edge case)
      });

      console.log("Unique users:", sortedUsers);
      // Update the users state with the sorted list
      setUsers(sortedUsers);
    };

    // Handler for unread messages ✍️❌
    const handleUnreadMessages = (messages) => {
      console.log("Received unread messages:", messages);
      setUnreadMessages(messages); // Update unread messages state
    };

    // Register the "users" event listener to receive user list updates
    socket.on("users", handleUsers);

    // Register the "unreadMessages" event listener to handle unread messages
    socket.on("unreadMessages", handleUnreadMessages);

    // Handler for "usernameError" event (e.g., when a duplicate username is attempted)
    socket.on("usernameError", (message) => {
      console.error("Username error:", message);
      // Clear the stored username from localStorage
      localStorage.removeItem("userName");
      // Redirect to the home page to allow the user to choose a new username
      window.location.href = "/";
    });

    // Cleanup: Remove socket event listeners when the component unmounts to prevent memory leaks
    return () => {
      socket.off("users", handleUsers);
      socket.off("unreadMessages", handleUnreadMessages);
      socket.off("usernameError");
    };
  }, [socket]); // Dependency: re-run if socket changes

  // Effect to log updates to the users state for debugging 🪲
  useEffect(() => {
    console.log("Users state updated:", users);
  }, [users]); // Dependency: re-run when users state changes

  // Handle clicking a user to start a private chat 🔒
  const handleUserClick = (user) => {
    if (!user.self) {
      // Prevent selecting self for private chat
      setSelectedUser({ userID: user.userID, username: user.username });
      setCurrentSelectedUser(user.userID); // Update local selected user
      socket.emit("setSelectedUser", user.userID); // Notify server of selected user
      socket.emit("clearUnreadMessages", user.userID); // Clear unread messages for the selected user
      console.log(`Selected user for private chat: ${user.username}`);
    }
  };

  // Handle returning to public chat 🌍
  const handlePublicChatClick = () => {
    setSelectedUser(null);
    setCurrentSelectedUser(null); // Clear local selected user
    socket.emit("setSelectedUser", null); // Notify server of public chat
    console.log("Returned to public chat");
  };

  // Calculate unread message count for the sender 📨
  const getUnreadCountBySender = (senderID) => {
    // Don't show unread count for the currently selected user
    if (senderID === currentSelectedUser) return 0;
    return unreadMessages.filter((msg) => msg.from === senderID).length;
  };

  // Render the sidebar UI
  return (
    <div className="chat__sidebar">
      {/* Sidebar header */}
      <h2>Open Chat</h2>
      <div>
        {/* Button to return to public chat */}
        <button onClick={handlePublicChatClick} className="public-chat-button">
          Public Chat
        </button>
        {/* Section header for active users */}
        <h4 className="chat__header">ACTIVE USERS</h4>
        {/* Container for the user list */}
        <div className="chat__users">
          {users.length > 0 ? (
            // If users exist, render a sorted list of usernames
            users.map((user) => (
              // Each user is displayed in a paragraph element with a unique key
              <p
                key={user.userID} // Use userID as a unique key for React's rendering
                className={user.self ? "current-user" : "user-selectable"} // Style current user or make others clickable
                onClick={() => handleUserClick(user)} // Trigger private chat on click
              >
                {/* Display "username (You)" for the current user, otherwise just the username */}
                {user.self ? `${user.username} (You)` : user.username}
                {/* Visual indicator (e.g., green dot) to show the user is online */}
                <span className="online-indicator"></span>
                {/* Display unread message count if the user has any unread messages */}
                {!user.self && getUnreadCountBySender(user.userID) > 0 && (
                  <span className="unread-indicator">
                    {getUnreadCountBySender(user.userID)}
                  </span>
                )}
                {/* log for debugging */}
                {console.log(
                  `Rendering user: ${
                    user.username
                  }, unreadCount: ${getUnreadCountBySender(
                    user.userID
                  )}, self: ${user.self}`
                )}
              </p>
            ))
          ) : (
            // If no users are connected, show a fallback message
            <p className="no-users">No users connected</p>
          )}
        </div>
      </div>
    </div>
  );
};

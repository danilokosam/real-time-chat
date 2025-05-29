import { useState, useEffect } from "react";

// ChatBar component displays the sidebar with a list of active users in the chat
// Receives the socket prop for real-time communication with the server
export const ChatBar = ({ socket }) => {
  // State to store the list of connected users
  const [users, setUsers] = useState([]);

  // Effect to handle socket events for user list updates and errors
  useEffect(() => {
    // Handler for the "users" event from the server
    const handleUsers = (data) => {
      console.log("Received users:", data);

      // Remove any duplicate users based on userID (precautionary)
      // Map to add a 'self' property to identify the current user
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

    // Register the "users" event listener to receive user list updates
    socket.on("users", handleUsers);

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
      socket.off("usernameError");
    };
  }, [socket]); // Dependency: re-run if socket changes

  // Effect to log updates to the users state for debugging
  useEffect(() => {
    console.log("Users state updated:", users);
  }, [users]); // Dependency: re-run when users state changes

  // Render the sidebar UI
  return (
    <div className="chat__sidebar">
      {/* Sidebar header */}
      <h2>Open Chat</h2>
      <div>
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
                className={user.self ? "current-user" : ""} // Apply special styling for the current user
              >
                {/* Display "username (You)" for the current user, otherwise just the username */}
                {user.self ? `${user.username} (You)` : user.username}
                {/* Visual indicator (e.g., green dot) to show the user is online */}
                <span className="online-indicator"></span>
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

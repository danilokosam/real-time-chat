import { useState, useEffect } from "react";

// Define the ChatBar component, which displays the sidebar with a list of active users in the chat
// It receives socket (for real-time communication) and setSelectedUser (to initiate private chats) as props
export const ChatBar = ({ socket, setSelectedUser }) => {
  // State to store the list of connected users, initialized as an empty array
  const [users, setUsers] = useState([]);
  // State to store unread messages, initialized as an empty array
  const [unreadMessages, setUnreadMessages] = useState([]);
  // State to track the currently selected user locally, initialized as null
  const [currentSelectedUser, setCurrentSelectedUser] = useState(null);

  // useEffect hook to handle socket events for user list updates and errors
  useEffect(() => {
    // Define a handler for the "users" event received from the server
    const handleUsers = (data) => {
      // Log the received user data to the console for debugging
      console.log("Received users:", data);

      // Remove any duplicate users based on userID by converting the array into a Map and back
      // Map each user to add a 'self' property to identify the current user
      const uniqueUsers = Array.from(
        new Map(data.map((user) => [user.userID, user])).values() // Create a Map with userID as the key to remove duplicates
      ).map((user) => ({
        ...user, // Spread the user object to retain its properties
        self: user.userID === socket.id, // Add a 'self' property, true if the user matches the socket ID (current user)
      }));

      // Sort users: prioritize the current user (self: true) at the top, then sort others alphabetically by username
      const sortedUsers = uniqueUsers.sort((a, b) => {
        if (a.self) return -1; // Place the current user first
        if (b.self) return 1; // Place other users after the current user
        if (a.username < b.username) return -1; // Sort non-self users alphabetically (ascending)
        if (a.username > b.username) return 1; // Sort non-self users alphabetically (descending)
        return 0; // Handle edge case where usernames are equal
      });

      // Log the sorted unique users to the console for debugging
      console.log("Unique users:", sortedUsers);
      // Update the users state with the sorted list
      setUsers(sortedUsers);
    };

    // Define a handler for the "unreadMessages" event received from the server
    const handleUnreadMessages = (messages) => {
      // Log the received unread messages to the console for debugging
      console.log("Received unread messages:", messages);
      // Update the unreadMessages state with the received messages
      setUnreadMessages(messages);
    };

    // Register the "users" event listener to receive user list updates from the server
    socket.on("users", handleUsers);

    // Register the "unreadMessages" event listener to handle unread messages from the server
    socket.on("unreadMessages", handleUnreadMessages);

    // Define a handler for the "usernameError" event (e.g., when a duplicate username is attempted)
    socket.on("usernameError", (message) => {
      // Log the username error to the console for debugging
      console.error("Username error:", message);
      // Clear the stored username from localStorage to allow the user to choose a new one
      localStorage.removeItem("userName");
      // Redirect the user to the home page to re-enter a username
      window.location.href = "/";
    });

    // Cleanup function: remove socket event listeners when the component unmounts to prevent memory leaks
    return () => {
      // Remove the "users" event listener
      socket.off("users", handleUsers);
      // Remove the "unreadMessages" event listener
      socket.off("unreadMessages", handleUnreadMessages);
      // Remove the "usernameError" event listener
      socket.off("usernameError");
    };
  }, [socket]); // Dependency array: re-run the effect if the socket prop changes

  // useEffect hook to log updates to the users state for debugging purposes
  useEffect(() => {
    // Log the updated users state to the console whenever it changes
    console.log("Users state updated:", users);
  }, [users]); // Dependency array: re-run the effect when the users state changes

  // Define a function to handle clicking a user to start a private chat
  const handleUserClick = (user) => {
    // Check if the clicked user is not the current user (self)
    if (!user.self) {
      // Prevent selecting the current user for a private chat
      // Set the selected user in the parent component with the user's ID and username
      setSelectedUser({ userID: user.userID, username: user.username });
      // Update the locally tracked selected user with the user's ID
      setCurrentSelectedUser(user.userID);
      // Emit a "setSelectedUser" event to the server to notify it of the selected user
      socket.emit("setSelectedUser", user.userID);
      // Emit a "clearUnreadMessages" event to the server to clear unread messages for the selected user
      socket.emit("clearUnreadMessages", user.userID);
      // Log to the console that a user was selected for a private chat
      console.log(`Selected user for private chat: ${user.username}`);
    }
  };

  // Define a function to handle returning to the public chat
  const handlePublicChatClick = () => {
    // Clear the selected user in the parent component (return to public chat)
    setSelectedUser(null);
    // Clear the locally tracked selected user
    setCurrentSelectedUser(null);
    // Emit a "setSelectedUser" event to the server with null to indicate a return to public chat
    socket.emit("setSelectedUser", null);
    // Log to the console that the user returned to the public chat
    console.log("Returned to public chat");
  };

  // Define a function to calculate the number of unread messages from a specific sender
  const getUnreadCountBySender = (senderID) => {
    // Return 0 if the sender is the currently selected user (don't show unread count for active chat)
    if (senderID === currentSelectedUser) return 0;
    // Filter unread messages to count only those from the specified sender
    return unreadMessages.filter((msg) => msg.from === senderID).length;
  };

  // Render the sidebar UI for the chat
  return (
    <div className="chat__sidebar">
      {" "}
      {/* Container for the sidebar */}
      <h2>Chat</h2> {/* Sidebar title */}
      <div>
        {" "}
        {/* Inner container for sidebar content */}
        {/* Button to return to the public chat */}
        <button onClick={handlePublicChatClick} className="public-chat-button">
          Public Chat
        </button>
        <h4 className="chat__header">ACTIVE USERS</h4>{" "}
        {/* Header for the list of active users */}
        <div className="chat__users">
          {" "}
          {/* Container for the list of users */}
          {/* Check if there are any users; if so, render the list, otherwise show a message */}
          {users.length > 0 ? (
            // Map over the users array to render each user
            users.map((user) => (
              <p
                key={user.userID} // Unique key for each user (required by React for lists)
                className={user.self ? "current-user" : "user-selectable"} // Apply different styles for the current user and others
                onClick={() => handleUserClick(user)} // Handle click to start a private chat
              >
                {/* Display the username, adding "(You)" if it's the current user */}
                {user.self ? `${user.username} (You)` : user.username}
                {/* Render a connection indicator (circle) that shows green for online and red for offline */}
                <span
                  className={`connection-indicator ${
                    user.connected ? "online" : "offline"
                  }`}
                ></span>
                {/* Render text to indicate the connection status ("Online" or "Offline") */}
                <span className="connection-text">
                  {user.connected ? "Online" : "Offline"}
                </span>
                {/* Show an unread message count for non-self users if there are unread messages */}
                {!user.self && getUnreadCountBySender(user.userID) > 0 && (
                  <span className="unread-indicator">
                    {getUnreadCountBySender(user.userID)}{" "}
                    {/* Display the number of unread messages */}
                  </span>
                )}
                {/* Log user rendering details to the console for debugging */}
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
            // Display a message if no users are connected
            <p className="no-users">No users connected</p>
          )}
        </div>
      </div>
    </div>
  );
};

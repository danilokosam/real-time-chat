import { useEffect, useState, useRef } from "react";
import { ChatBar } from "./ChatBar"; // Displays the list of users for private/public chat selection
import { ChatBody } from "./ChatBody"; // Displays public or private messages
import { ChatFooter } from "./ChatFooter"; // Handles message input and sending
import { io } from "socket.io-client";

// Singleton socket instance to maintain a single connection across the app
// Prevents multiple socket connections if the component re-mounts
let socketInstance = null;

// Main ChatPage component, orchestrates the chat functionality
export const ChatPage = () => {
  // State to store the Socket.IO instance
  const [socket, setSocket] = useState(null);
  // State for public chat messages (array of messages for the public chat)
  const [messages, setMessages] = useState([]);
  // State for private messages, stored as an object with user IDs as keys
  // Example: { userID1: [{ id, content, fromSelf, fromUsername, timestamp }, ...], ... }
  const [privateMessages, setPrivateMessages] = useState({});
  // State to display typing status (e.g., "User is typing...")
  const [typingStatus, setTypingStatus] = useState("");
  // State for connection error messages (e.g., "Failed to connect to server")
  const [connectionError, setConnectionError] = useState(null);
  // State for the currently selected user for private chat (null for public chat)
  const [selectedUser, setSelectedUser] = useState(null);
  // State for the current user's ID, assigned by the server
  const [currentUserID, setCurrentUserID] = useState(null);
  // State for the list of all users in the chat, received from the server
  const [users, setUsers] = useState([]);
  // Reference to the last message element for auto-scrolling to new messages
  const lastMessageRef = useRef(null);
  // Reference to track whether the "newUser" event has been emitted to avoid duplicates
  const hasEmittedNewUser = useRef(false);

  // Initialize socket and handle connection-related events
  useEffect(() => {
    // Check if socketInstance is not already created to avoid multiple connections
    if (!socketInstance) {
      // Create a new Socket.IO client instance, connecting to the server at localhost:3001
      socketInstance = io("http://localhost:3001", {
        reconnection: true, // Enable automatic reconnection
        reconnectionAttempts: 5, // Try reconnecting 5 times
        reconnectionDelay: 1000, // Wait 1 second between attempts
        reconnectionDelayMax: 5000, // Max wait of 5 seconds
        withCredentials: true, // Include credentials for CORS
        transports: ["polling", "websocket"], // Use polling, then upgrade to WebSocket
      });

      // Handle successful connection to the server
      socketInstance.on("connect", () => {
        console.log("Connected to server, socketID:", socketInstance.id);
        // Clear any existing connection error
        setConnectionError(null);
        // Get the username from localStorage
        const userName = localStorage.getItem("userName");
        // Emit "newUser" event to register the user with the server, but only if not already emitted
        if (userName && !hasEmittedNewUser.current) {
          socketInstance.emit("newUser", { userName });
          hasEmittedNewUser.current = true; // Mark as emitted to prevent duplicates
        }
      });

      // Handle connection errors (e.g., server unreachable)
      socketInstance.on("connect_error", (error) => {
        console.error("Connection failed:", error.message);
        // Display error message to the user
        setConnectionError("Failed to connect to server. Retrying...");
      });

      // Handle disconnection from the server
      socketInstance.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
        // Inform the user of disconnection
        setConnectionError("Disconnected from server. Trying to reconnect...");
      });

      // Handle successful reconnection after a disconnect
      socketInstance.on("reconnect", (attempt) => {
        console.log("Socket reconnected after attempt:", attempt);
        // Clear connection error
        setConnectionError(null);
        // Allow re-emitting "newUser" on reconnect
        hasEmittedNewUser.current = false;
        const userName = localStorage.getItem("userName");
        if (userName) {
          socketInstance.emit("newUser", { userName });
        }
      });

      // Handle server rejecting the username (e.g., duplicate username)
      socketInstance.on("usernameError", (message) => {
        console.error("Received usernameError:", message);
        // Display the error to the user
        setConnectionError(message);
        // Store the error in localStorage for display on the home page
        localStorage.setItem("usernameError", message);
        // Redirect to home page after 3 seconds and clear username
        setTimeout(() => {
          localStorage.removeItem("userName");
          window.location.href = "/";
        }, 3000);
      });
    }

    // Set the socket state to the singleton instance
    setSocket(socketInstance);

    // Cleanup function (runs when component unmounts)
    return () => {
      // Log unmounting but keep the socket alive (singleton pattern)
      console.log("ChatPage unmounting, keeping socket alive");
    };
  }, []); // Empty dependency array ensures this runs only once on mount

  // Handle Socket.IO events for messages, users, and typing indicators
  useEffect(() => {
    // Skip if socket is not initialized
    if (!socket) return;

    // Handle updated user list from the server
    const handleUsers = (data) => {
      console.log("Received users list:", data);
      const userName = localStorage.getItem("userName");
      // Find the current user in the received user list
      const currentUser = data.find((user) => user.username === userName);
      if (currentUser) {
        // Set the current user's ID for identifying messages
        setCurrentUserID(currentUser.userID);
        // Store userID on the socket for easy access
        socket.userID = currentUser.userID;
      }
      // Update the users state with the full list
      setUsers(data);
    };

    // Handle public chat messages
    const handleMessageResponse = (data) => {
      console.log("Received messageResponse:", data);
      // Append new public message to the messages state
      setMessages((prevMessages) => [...prevMessages, data]);
    };

    // Handle private messages
    const handlePrivateMessage = ({
      id,
      content,
      from,
      fromUsername,
      to,
      timestamp,
    }) => {
      console.log("Received privateMessage:", {
        id,
        content,
        from,
        fromUsername,
        to,
        timestamp,
      });
      // Ensure currentUserID is available to determine message direction
      if (!currentUserID) {
        console.warn("Current userID not available.");
        return;
      }
      // Determine the other user's ID (sender if received, recipient if sent)
      const otherUserID = to === currentUserID ? from : to;
      // Mark if the message is from the current user
      const fromSelf = from === currentUserID;

      if (!otherUserID) {
        console.warn("Other user ID not available.");
        return;
      }

      // Update privateMessages state, preventing duplicates
      setPrivateMessages((prev) => {
        const userMessages = prev[otherUserID] || [];
        // Check if a message with the same ID already exists
        if (userMessages.some((msg) => msg.id === id)) {
          console.log("Duplicate message ignored:", id);
          return prev; // Skip adding duplicate
        }
        // Add the new message to the user's message array
        const updatedMessages = {
          ...prev,
          [otherUserID]: [
            ...userMessages,
            { id, content, fromSelf, fromUsername, timestamp },
          ],
        };
        console.log("Updated privateMessages:", updatedMessages);
        return updatedMessages;
      });
    };

    // Handle typing indicator for private or public chat
    const handleTypingResponse = (data) => {
      console.log("Received typingResponse:", data);
      const currentUserName = localStorage.getItem("userName");
      // Private chat typing indicator
      if (data.to) {
        if (
          selectedUser && // Ensure a user is selected for private chat
          data.to === currentUserID && // Message is directed to current user
          data.userName !== currentUserName && // Not the current user's typing
          selectedUser.userID === data.from // Matches the selected user
        ) {
          setTypingStatus(`${data.userName} is typing...`);
        }
      } else {
        // Public chat typing indicator
        if (!selectedUser && data.userName !== currentUserName) {
          setTypingStatus(`${data.userName} is typing...`);
        }
      }
    };

    // Handle stopping typing indicator
    const handleStopTypingResponse = (data) => {
      console.log("Received stopTypingResponse:", data);
      // Clear typing status for private chat
      if (data.to) {
        if (
          selectedUser &&
          data.to === currentUserID &&
          selectedUser.userID === data.from
        ) {
          setTypingStatus("");
        }
      } else {
        // Clear typing status for public chat
        if (!selectedUser) {
          setTypingStatus("");
        }
      }
    };

    // Register Socket.IO event listeners
    socket.on("connectedUsers", handleUsers);
    socket.on("messageResponse", handleMessageResponse);
    socket.on("privateMessage", handlePrivateMessage);
    socket.on("typingResponse", handleTypingResponse);
    socket.on("stopTypingResponse", handleStopTypingResponse);

    // Cleanup function to remove listeners when dependencies change or component unmounts
    return () => {
      socket.off("users", handleUsers);
      socket.off("messageResponse", handleMessageResponse);
      socket.off("privateMessage", handlePrivateMessage);
      socket.off("typingResponse", handleTypingResponse);
      socket.off("stopTypingResponse", handleStopTypingResponse);
    };
  }, [socket, currentUserID, selectedUser]); // Dependencies ensure listeners are updated when these change

  // Auto-scroll to the latest message when messages or privateMessages change
  useEffect(() => {
    console.log("Messages state updated:", messages);
    console.log("Private messages state updated:", privateMessages);
    // Scroll to the last message element smoothly
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, privateMessages]);

  // Render a loading/error message if socket is not connected
  if (!socket || !socket.connected) {
    return <div>{connectionError || "Connecting to chat..."}</div>;
  }

  // Render the main chat UI
  return (
    <div className="chat">
      {/* Display connection error if present */}
      {connectionError && (
        <div className="connection-error">{connectionError}</div>
      )}
      {/* ChatBar: Displays user list and handles user selection for private chat */}
      <ChatBar
        socket={socket}
        setSelectedUser={setSelectedUser}
        currentUserID={currentUserID}
        users={users}
      />
      <div className="chat__main">
        {/* ChatBody: Displays public or private messages based on selectedUser */}
        <ChatBody
          messages={messages}
          privateMessages={privateMessages}
          selectedUser={selectedUser}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
        />
        {/* ChatFooter: Handles message input and sending */}
        <ChatFooter
          socket={socket}
          selectedUser={selectedUser}
          currentUserID={currentUserID}
        />
      </div>
    </div>
  );
};

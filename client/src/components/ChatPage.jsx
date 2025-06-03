import { useEffect, useState, useRef } from "react";
import { ChatBar } from "./ChatBar";
import { ChatBody } from "./ChatBody";
import { ChatFooter } from "./ChatFooter";
import { io } from "socket.io-client";

// Singleton socket instance
let socketInstance = null;

export const ChatPage = () => {
  // State for socket connection 🔌
  const [socket, setSocket] = useState(null);
  // State for public messages 🌍
  const [messages, setMessages] = useState([]);
  // State for private messages, stored as { [userID]: [{content, fromSelf, fromUsername}] } 🔐
  const [privateMessages, setPrivateMessages] = useState({});
  // State for typing status (public only, for simplicity) 💬
  const [typingStatus, setTypingStatus] = useState("");
  // State for connection errors ❌
  const [connectionError, setConnectionError] = useState(null);
  // State for the currently selected user for private messaging ✅
  const [selectedUser, setSelectedUser] = useState(null); // { userID, username }
  const lastMessageRef = useRef(null); // Ref to scroll to the last message
  const hasEmittedNewUser = useRef(false); // Ref to track if newUser has been emitted

  // Initialize socket 🔌
  useEffect(() => {
    if (!socketInstance) {
      socketInstance = io("http://localhost:3001", {
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
      });

      socketInstance.on("connect_error", (error) => {
        console.error("Connection failed:", error.message);
        setConnectionError("Failed to connect to server. Retrying...");
      });

      socketInstance.on("connect", () => {
        console.log("Connected to server");
        setConnectionError(null);
      });
    }

    setSocket(socketInstance);

    return () => {
      if (socketInstance) {
        socketInstance.disconnect();
        console.log("Socket disconnected on ChatPage unmount");
        socketInstance = null;
      }
    };
  }, []);
  // Initialize socket 🔌

  // Emit newUser after socket connects 🛜
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      const userName = localStorage.getItem("userName"); // Retrieve username from localStorage 🫙
      // Check if newUser has already been emitted
      if (userName && !hasEmittedNewUser.current) {
        console.log(`Emitting newUser for ${userName}, socketID: ${socket.id}`);
        socket.emit("newUser", { userName }); // Emit newUser event with username
        hasEmittedNewUser.current = true; // Set flag to true to prevent re-emitting
        setConnectionError(null); // Clear any previous connection errors
      }
    };

    // Check if socket is already connected
    if (socket.connected) {
      handleConnect(); // Call handleConnect immediately if already connected
    } else {
      socket.on("connect", handleConnect); // Listen for connect event
    }

    return () => {
      socket.off("connect", handleConnect); // Clean up the event listener on unmount
    };
  }, [socket]);
  // Emit newUser after socket connects 🛜

  // Handle socket errors and connection events 🎟️
  useEffect(() => {
    if (!socket) return;

    // Handle socket connection errors and disconnections
    const handleConnectError = (error) => {
      console.error("Socket connection error:", error.message);
      setConnectionError("Connection lost. Please refresh the page.");
    };

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason);
      setConnectionError("Disconnected from server. Trying to reconnect...");
    };

    const handleReconnect = (attempt) => {
      console.log("Socket reconnected after attempt:", attempt);
      setConnectionError(null); // Clear connection error on successful reconnection
      hasEmittedNewUser.current = false; // Reset flag to allow re-emitting newUser
      const userName = localStorage.getItem("userName"); // Retrieve username from localStorage 🫙
      if (userName) {
        socket.emit("newUser", { userName }); // Re-emit newUser event with username
      }
    };

    socket.on("connect_error", handleConnectError); // Handle connection errors
    socket.on("disconnect", handleDisconnect); // Handle disconnections
    socket.on("reconnect", handleReconnect); // Handle reconnections

    return () => {
      socket.off("connect_error", handleConnectError); // Clean up connection error listener
      socket.off("disconnect", handleDisconnect); // Clean up disconnect listener
      socket.off("reconnect", handleReconnect); // Clean up reconnection listener
    };
  }, [socket]);
  // Handle socket errors and connection events 🎟️

  // Handle socket events for public and private messages 🤖
  useEffect(() => {
    if (!socket) return;

    // Handle public messages 🌍
    const handleMessageResponse = (data) => {
      console.log("Received messageResponse:", data);
      setMessages((prevMessages) => [...prevMessages, data]); // Add new message to the list
    };

    // Handle private messages 🔏
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
      console.log("Current socket ID", socket.id);
      console.log("Current selectedUser", selectedUser);
      if (!socket.id) {
        console.warn(
          "Socket ID is not available. Cannot handle private message."
        );
        return;
      }
      const otherUserID = to === socket.id ? from : to; // Determine the other user in the conversation
      const fromSelf = from === socket.id; // Check if the message is from the current user

      if (!otherUserID) {
        console.warn(
          "Other user ID is not available. Cannot handle private message."
        );
        return;
      }
      setPrivateMessages((prev) => {
        const updatedMessages = {
          ...prev,
          [otherUserID]: [
            ...(prev[otherUserID] || []),
            { id, content, fromSelf, fromUsername, timestamp },
          ],
        };
        console.log("Updated privateMessages:", updatedMessages);
        return updatedMessages;
      });
    };

    // Handle typing status ✍️
    const handleTypingResponse = (data) => {
      console.log("Received typingResponse:", data);
      setTypingStatus(data);
    };

    // Handle stop typing status ✍️🛑
    const handleStopTypingResponse = () => {
      console.log("Received stopTypingResponse");
      setTypingStatus("");
    };

    socket.on("messageResponse", handleMessageResponse); // Handle public messages
    socket.on("privateMessage", handlePrivateMessage); // Handle private messages
    socket.on("typingResponse", handleTypingResponse); // Handle typing status
    socket.on("stopTypingResponse", handleStopTypingResponse); // Handle stop typing status

    return () => {
      socket.off("messageResponse", handleMessageResponse); // Clean up public message listener
      socket.off("privateMessage", handlePrivateMessage); // Clean up private message listener
      socket.off("typingResponse", handleTypingResponse); // Clean up typing status listener
      socket.off("stopTypingResponse", handleStopTypingResponse); // Clean up stop typing status listener
    };
  }, [socket, selectedUser]);
  // Handle socket events for public and private messages 🤖

  // Auto-scroll to the latest message
  useEffect(() => {
    console.log("Messages state updated:", messages);
    console.log("Private messages state updated:", privateMessages);
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" }); // Scroll to the last message
  }, [messages, privateMessages]);

  // Prevent rendering until socket is initialized
  if (!socket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat">
      {connectionError && (
        <div className="connection-error">{connectionError}</div>
      )}
      <ChatBar socket={socket} setSelectedUser={setSelectedUser} />
      <div className="chat__main">
        <ChatBody
          messages={messages}
          privateMessages={
            selectedUser ? privateMessages[selectedUser.userID] || [] : []
          }
          selectedUser={selectedUser}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
        />
        <ChatFooter socket={socket} selectedUser={selectedUser} />
      </div>
    </div>
  );
};

import { useEffect, useState, useRef } from "react";
import { ChatBar } from "./ChatBar";
import { ChatBody } from "./ChatBody";
import { ChatFooter } from "./ChatFooter";
import { io } from "socket.io-client";

export const ChatPage = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingStatus, setTypingStatus] = useState("");
  const [connectionError, setConnectionError] = useState(null);
  const lastMessageRef = useRef(null);
  const hasEmittedNewUser = useRef(false);

  // Initialize socket when component mounts
  useEffect(() => {
    const newSocket = io("http://localhost:3001", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection failed:", error.message);
      setConnectionError("Failed to connect to server. Retrying...");
    });

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnectionError(null);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
      console.log("Socket disconnected on ChatPage unmount");
    };
  }, []);

  // Emit newUser after socket connects
  useEffect(() => {
    if (!socket) return;

    const handleConnect = () => {
      const userName = localStorage.getItem("userName");
      if (userName && !hasEmittedNewUser.current) {
        console.log(`Emitting newUser for ${userName}, socketID: ${socket.id}`);
        socket.emit("newUser", { userName });
        hasEmittedNewUser.current = true;
        setConnectionError(null);
      }
    };

    if (socket.connected) {
      handleConnect();
    } else {
      socket.on("connect", handleConnect);
    }

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket]);

  // Handle socket errors and connection events
  useEffect(() => {
    if (!socket) return;

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
      setConnectionError(null);
      hasEmittedNewUser.current = false;
      const userName = localStorage.getItem("userName");
      if (userName) {
        socket.emit("newUser", { userName });
      }
    };

    socket.on("connect_error", handleConnectError);
    socket.on("disconnect", handleDisconnect);
    socket.on("reconnect", handleReconnect);

    return () => {
      socket.off("connect_error", handleConnectError);
      socket.off("disconnect", handleDisconnect);
      socket.off("reconnect", handleReconnect);
    };
  }, [socket]);

  // Socket event listeners for messages and typing
  useEffect(() => {
    if (!socket) return;

    const handleMessageResponse = (data) => {
      console.log("Received messageResponse:", data);
      setMessages((prevMessages) => {
        console.log("Previous messages:", prevMessages);
        return [...prevMessages, data];
      });
    };

    const handleTypingResponse = (data) => {
      console.log("Received typingResponse:", data);
      setTypingStatus(data);
    };

    const handleStopTypingResponse = () => {
      console.log("Received stopTypingResponse");
      setTypingStatus("");
    };

    socket.on("messageResponse", handleMessageResponse);
    socket.on("typingResponse", handleTypingResponse);
    socket.on("stopTypingResponse", handleStopTypingResponse);

    return () => {
      socket.off("messageResponse", handleMessageResponse);
      socket.off("typingResponse", handleTypingResponse);
      socket.off("stopTypingResponse", handleStopTypingResponse);
    };
  }, [socket]);

  // Auto-scroll
  useEffect(() => {
    console.log("Messages state updated:", messages);
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Prevent rendering until socket is initialized
  if (!socket) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chat">
      {connectionError && (
        <div className="connection-error">{connectionError}</div>
      )}
      <ChatBar socket={socket} />
      <div className="chat__main">
        <ChatBody
          messages={messages}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
        />
        <ChatFooter socket={socket} />
      </div>
    </div>
  );
};

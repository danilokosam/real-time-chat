import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { useUserContext } from "./useUserContext";
import { SocketContext } from "./SocketContext";

export const SocketProvider = ({ children }) => {
  const { currentUserID, isLoggedIn } = useUserContext();
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    console.log(
      "🔍 useEffect triggered - currentUserID:",
      currentUserID,
      "isLoggedIn:",
      isLoggedIn
    );
    if (!isLoggedIn || !currentUserID) {
      console.log("⏸️ User not logged in, skipping socket connection");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      setSocket(null); // importante para avisar a React
      return;
    }

    console.log("🚀 User logged in, creating socket connection...");

    const newSocket = io("http://localhost:3001", {
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      withCredentials: true,
      transports: ["websocket", "polling"],
      auth: {
        token: localStorage.getItem("accessToken") || "",
      },
    });

    socketRef.current = newSocket;
    setSocket(newSocket); // importante: actualiza el estado para renderizar

    newSocket.on("connect", () => {
      console.log("✅ Connected to server, socketID:", newSocket.id);
      setConnectionError(null);
    });

    newSocket.on("connect_error", (error) => {
      console.error("❌ Connection failed:", error.message);
      setConnectionError("Failed to connect to server. Retrying...");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("⚠️ Socket disconnected:", reason);
      setConnectionError("Disconnected from server. Trying to reconnect...");
    });

    newSocket.on("reconnect", (attempt) => {
      console.log("🔁 Socket reconnected after attempt:", attempt);
      setConnectionError(null);
    });

    return () => {
      console.log("🧹 Cleaning up socket...");
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current.off();
        socketRef.current = null;
      }
      setSocket(null);
    };
  }, [currentUserID, isLoggedIn]);

  return (
    <SocketContext.Provider
      value={{ socket, connectionError, setConnectionError }}
    >
      {children}
    </SocketContext.Provider>
  );
};

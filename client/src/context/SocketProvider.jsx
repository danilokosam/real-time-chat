import { useEffect, useState, useCallback } from "react";
import { io } from "socket.io-client";
import { useUserContext } from "./useUserContext";
import { SocketContext } from "./SocketContext";
import { jwtDecode } from "jwt-decode";

let socketInstance = null;

export const SocketProvider = ({ children }) => {
  const { currentUserID, setCurrentUserID, setUserName, userName } =
    useUserContext();
  const [connectionError, setConnectionError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);

  const updateLoginStatus = useCallback(
    (status, accessToken = null) => {
      setIsLoggedIn(status);

      if (status) {
        if (accessToken) {
          localStorage.setItem("accessToken", accessToken);
        }
        if (userName) {
          localStorage.setItem("userName", userName);
          setUserName(userName);
        }
      } else {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userName");
        setCurrentUserID(null);
        setUserName("");
        if (socketInstance) {
          socketInstance.disconnect();
          console.log("🔌 Socket disconnected on logout");
          setSocket(null);
        }
      }
    },
    [setIsLoggedIn, setCurrentUserID, setUserName, setSocket, userName]
  );

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const storedUserName = localStorage.getItem("userName");

    // Decode token and set currentUserID
    if (token && !currentUserID) {
      try {
        const decoded = jwtDecode(token);
        console.log("✅ Decoded token in SocketProvider:", decoded);
        if (decoded?.id) {
          setCurrentUserID(decoded.id);
          if (storedUserName) {
            setUserName(storedUserName);
          }
        } else {
          console.error("❌ Token does not contain 'id'");
          updateLoginStatus(false);
          return;
        }
      } catch (error) {
        console.error("❌ Failed to decode token:", error.message);
        updateLoginStatus(false);
        return;
      }
    }

  if (!currentUserID || !storedUserName) {
      console.log("⏳ Waiting for currentUserID and userName before connecting socket...");
      return;
    }


    if (!socketInstance) {
      console.log("🚀 Creating socket instance...");
      socketInstance = io("http://localhost:3001", {
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

      setSocket(socketInstance);

      socketInstance.on("connect", () => {
        console.log("✅ Connected to server, socketID:", socketInstance.id);
        setConnectionError(null);
      });

      socketInstance.on("connect_error", (error) => {
        console.error("❌ Connection failed:", error.message);
        setConnectionError("Failed to connect to server. Retrying...");
      });

      socketInstance.on("disconnect", (reason) => {
        console.log("⚠️ Socket disconnected:", reason);
        setConnectionError("Disconnected from server. Trying to reconnect...");
      });

      socketInstance.on("reconnect", (attempt) => {
        console.log("🔁 Socket reconnected after attempt:", attempt);
        setConnectionError(null);
      });
    } else {
      console.log(
        "♻️ Socket instance exists. Updating auth and reconnecting..."
      );
      socketInstance.auth = {
        token: localStorage.getItem("accessToken") || "",
      };
      socketInstance.connect();
    }

    return () => {
      console.log("🧹 Cleaning up socket...");
      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance.off();
        setSocket(null);
      }
    };
  }, [currentUserID, setCurrentUserID, setUserName, updateLoginStatus]);

  const value = {
    socket,
    connectionError,
    setConnectionError,
    isLoggedIn,
    updateLoginStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

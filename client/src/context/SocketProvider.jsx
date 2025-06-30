// src/context/SocketProvider.jsx
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";

// Singleton para el socket
let socketInstance = null;

export const SocketProvider = ({ children }) => {
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const hasUser = Boolean(localStorage.getItem("userName"));
    console.log("🔐 Checking isLoggedIn on mount:", hasUser);
    return hasUser;
  });

  // Método para actualizar login cuando se hace login/logout
  const updateLoginStatus = (status, token) => {
    console.log("🔄 updateLoginStatus called:", { status, token });

    setIsLoggedIn(status);

    if (status && token) {
      localStorage.setItem("accessToken", token);
      console.log("✅ accessToken saved to localStorage");

      // Si el socket ya existe, actualiza auth y reconecta
      if (socketInstance) {
        console.log("♻️ Socket exists, reconnecting with new token...");
        socketInstance.auth = { token };
        socketInstance.connect();
      } else {
        console.log("🚀 Creating new socket connection...");
        // Si no existe, lo creamos de inmediato
        socketInstance = io("http://localhost:3001", {
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
          withCredentials: true,
          transports: ["websocket", "polling"],
          auth: {
            token,
          },
        });

        socketRef.current = socketInstance;

        // Eventos del socket
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
          setConnectionError(
            "Disconnected from server. Trying to reconnect..."
          );
        });

        socketInstance.on("reconnect", (attempt) => {
          console.log("🔁 Socket reconnected after attempt:", attempt);
          setConnectionError(null);
        });
      }
    } else {
      console.log("🧹 Logging out. Removing token and disconnecting socket.");
      localStorage.removeItem("accessToken");

      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        socketRef.current = null;
      }
    }
  };

  // Este efecto se encarga de limpiar si se cierra sesión manualmente
  useEffect(() => {
    console.log("🧭 useEffect on isLoggedIn triggered:", isLoggedIn);

    if (!isLoggedIn) {
      if (socketInstance) {
        console.log("🔌 Disconnecting socket due to logout");
        socketInstance.disconnect();
        socketInstance = null;
        socketRef.current = null;
      }
    }

    return () => {
      // Limpia eventos al desmontar
      if (socketInstance) {
        console.log("🧽 Cleaning up socket listeners");
        socketInstance.off("connect");
        socketInstance.off("connect_error");
        socketInstance.off("disconnect");
        socketInstance.off("reconnect");
      }
    };
  }, [isLoggedIn]);

  const value = {
    socket: socketRef.current,
    connectionError,
    setConnectionError,
    isLoggedIn,
    updateLoginStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};

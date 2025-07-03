import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import { SocketContext } from "./SocketContext";

// Singleton para el socket
let socketInstance = null;

export const SocketProvider = ({ children }) => {
  const [connectionError, setConnectionError] = useState(null);
  const socketRef = useRef(null);
  const [socket, setSocket] = useState(null); // Nuevo estado para forzar re-render

  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    const hasUser = Boolean(localStorage.getItem("userName"));
    const hasToken = Boolean(localStorage.getItem("accessToken"));
    console.log("🔐 Checking isLoggedIn on mount:", { hasUser, hasToken });
    return hasUser && hasToken;
  });

  // Función para crear el socket
  const createSocket = (token) => {
    console.log("🚀 Creating new socket connection with token...");
    
    if (socketInstance) {
      socketInstance.disconnect();
      socketInstance = null;
    }

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
    setSocket(socketInstance); // Actualizar estado para forzar re-render

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
      setConnectionError("Disconnected from server. Trying to reconnect...");
    });

    socketInstance.on("reconnect", (attempt) => {
      console.log("🔁 Socket reconnected after attempt:", attempt);
      setConnectionError(null);
    });

    return socketInstance;
  };

  // Inicializar socket si ya hay token al montar - ESTE ES EL FIX PRINCIPAL
  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const userName = localStorage.getItem("userName");
    
    console.log("🔄 SocketProvider mounted, checking existing credentials:", {
      hasToken: !!token,
      hasUserName: !!userName,
      isLoggedIn,
      socketExists: !!socketInstance
    });

    if (token && userName && isLoggedIn && !socketInstance) {
      console.log("🎯 Creating socket on mount with existing credentials");
      createSocket(token);
    } else if (socketInstance) {
      // Si ya existe el socket, asegurar que esté en el estado
      socketRef.current = socketInstance;
      setSocket(socketInstance);
    }
  }, []); // Sin dependencias para que solo se ejecute al montar

  // Método para actualizar login cuando se hace login/logout
  const updateLoginStatus = (status, token) => {
    console.log("🔄 updateLoginStatus called:", { status, token });

    setIsLoggedIn(status);

    if (status && token) {
      localStorage.setItem("accessToken", token);
      console.log("✅ accessToken saved to localStorage");

      // Crear o reconectar socket
      if (socketInstance) {
        console.log("♻️ Socket exists, updating auth and reconnecting...");
        socketInstance.auth = { token };
        socketInstance.disconnect();
        socketInstance.connect();
      } else {
        createSocket(token);
      }
    } else {
      console.log("🧹 Logging out. Removing token and disconnecting socket.");
      localStorage.removeItem("accessToken");

      if (socketInstance) {
        socketInstance.disconnect();
        socketInstance = null;
        socketRef.current = null;
        setSocket(null);
      }
    }
  };

  // Limpiar socket cuando se cierra sesión
  useEffect(() => {
    console.log("🧭 useEffect on isLoggedIn triggered:", isLoggedIn);

    if (!isLoggedIn && socketInstance) {
      console.log("🔌 Disconnecting socket due to logout");
      socketInstance.disconnect();
      socketInstance = null;
      socketRef.current = null;
      setSocket(null);
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
    socket: socket, // Usar el estado en lugar de socketRef.current
    connectionError,
    setConnectionError,
    isLoggedIn,
    updateLoginStatus,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
};
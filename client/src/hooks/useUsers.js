import { useEffect, useState } from "react";
import { useUserContext } from "../context/useUserContext";
import { useSocketContext } from "../context/useSocketContext";

export const useUsers = () => {
  const { socket, setConnectionError } = useSocketContext();
  const { currentUserID, userName, logout } = useUserContext();
  const [users, setUsers] = useState([]);

  useEffect(() => {
    console.log("🌀 useUsers mounted or socket changed");
    console.log("📦 Context userName:", userName);

    if (!socket) {
      console.warn("⚠️ Socket not available yet");
      return;
    }

    if (!userName) {
      console.error("❌ No userName found in UserContext");
      logout();
      return;
    }

    if (!currentUserID) {
      console.error("❌ No currentUserID found in UserContext");
      logout();
      return;
    }

    // Assign userID to socket
    socket.userID = currentUserID;

    // Emit newUser on connect
    const emitNewUser = () => {
      socket.emit("newUser", { userName });
      console.log("📤 Emitted newUser on socket connect:", userName);
    };

   if (socket.connected) {
      emitNewUser();
    } else {
      socket.once("connect", emitNewUser);
    }

    const handleUsers = (data) => {
      console.log("📥 Received users:", data);
      const uniqueUsers = Array.from(
        new Map(data.map((u) => [u.userID, u])).values()
      );
      setUsers(uniqueUsers);
    };

    const handleUsernameError = (message) => {
      console.error("🚨 Username error:", message);
      setConnectionError(message);
      logout();
      setTimeout(() => {
        window.location.href = "/";
      }, 3000);
    };

    socket.on("users", handleUsers);
    socket.on("usernameError", handleUsernameError);

    return () => {
      console.log("🧹 Cleaning up useUsers");
      socket.off("connect", emitNewUser);
      socket.off("users", handleUsers);
      socket.off("usernameError", handleUsernameError);
    };
  }, [socket, userName, currentUserID, setConnectionError, logout]);

  return { users, currentUserID, userName };
};
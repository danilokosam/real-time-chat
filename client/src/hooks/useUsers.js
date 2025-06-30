import { useEffect, useState } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { jwtDecode } from "jwt-decode";

export const useUsers = () => {
  const { socket, setConnectionError } = useSocketContext();
  const [users, setUsers] = useState([]);
  const [currentUserID, setCurrentUserID] = useState(null);
  const [userName, setUserName] = useState(
    localStorage.getItem("userName") || ""
  );

  useEffect(() => {
    console.log("🌀 useUsers mounted or socket changed");
    console.log("📦 localStorage:", {
      userName: localStorage.getItem("userName"),
      accessToken: localStorage.getItem("accessToken"),
    });

    if (!socket) {
      console.warn("⚠️ Socket not available yet");
      return;
    }

    const storedUserName = localStorage.getItem("userName");
    const token = localStorage.getItem("accessToken");

    if (!storedUserName) {
      console.error("❌ No userName found in localStorage");
      setUserName("");
      return;
    }

    if (!token) {
      console.error("❌ No accessToken found in localStorage");
      setUserName("");
      return;
    }

    setUserName(storedUserName);

    try {
      const decoded = jwtDecode(token);
      console.log("✅ Decoded token:", decoded);
      if (decoded?.id) {
        setCurrentUserID(decoded.id);
        socket.userID = decoded.id;
        console.log("✅ Set currentUserID:", decoded.id);
      } else {
        console.error("❌ Token does not contain 'id'");
      }
    } catch (error) {
      console.error("❌ Failed to decode token:", error.message);
    }

    // 🧠 Emit newUser SOLO al conectarse
    const emitNewUser = () => {
      socket.emit("newUser", { userName: storedUserName });
      console.log("📤 Emitted newUser on socket connect:", storedUserName);
    };

    // ✅ Importante: solo una vez por cada reconexión
    socket.once("connect", emitNewUser);

    const handleUsers = (data) => {
      console.log("📥 Received users:", data);

      // ⚠️ Eliminar duplicados por si acaso
      const uniqueUsers = Array.from(
        new Map(data.map((u) => [u.userID, u])).values()
      );

      setUsers(uniqueUsers);
    };

    const handleUsernameError = (message) => {
      console.error("🚨 Username error:", message);
      setConnectionError(message);
      localStorage.removeItem("userName");
      setUserName("");
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
  }, [socket, setConnectionError]);

  return { users, currentUserID, setCurrentUserID, userName };
};

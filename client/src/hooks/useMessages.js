import { useEffect, useState, useCallback } from "react";
import { useSocketContext } from "../context/useSocketContext";

export const useMessages = () => {
  const { socket } = useSocketContext();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  // Log para detectar cambios en socket
  useEffect(() => {
    console.log("🌀 socket changed:", socket);
  }, [socket]);

  // ✅ Handler ESTABLE
  const handleMessageResponse = useCallback((data) => {
    console.log("📥 Received messageResponse:", data);
    setMessages((prev) => [...prev, data]);
  }, []);

  const handleLoadMessages = useCallback((data) => {
    console.log("📥 Received initial messages:", data);
    setMessages(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!socket) return;

    console.log("📡 Subscribed to messageResponse events");

    socket.on("messageResponse", handleMessageResponse);
    socket.on("loadMessages", handleLoadMessages);

    console.log("🎯 Listeners:", socket.listeners("messageResponse").length);

    socket.emit("getMessages");

    return () => {
      console.log("🧹 Unsubscribed from messageResponse");
      socket.off("messageResponse", handleMessageResponse);
      socket.off("loadMessages", handleLoadMessages);
    };
  }, [socket, handleMessageResponse, handleLoadMessages]);

  return { messages, setMessages, loading };
};

import { useEffect, useState } from "react";
import { useSocketContext } from "../context/useSocketContext";

export const useMessages = () => {
  const { socket } = useSocketContext();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageResponse = (data) => {
      console.log("Received messageResponse:", data);
      setMessages((prev) => [...prev, data]);
    };

    socket.on("messageResponse", handleMessageResponse);

    // Limpieza: eliminar el event listener
    return () => {
      socket.off("messageResponse", handleMessageResponse);
    };
  }, [socket]);

  return { messages, setMessages };
};

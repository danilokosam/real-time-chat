import { useState, useEffect } from "react";
import { useSocketContext } from "../context/useSocketContext";

export const useMessages = () => {
  const { socket } = useSocketContext();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleMessageResponse = (data) => {
      console.log("📨 New public message:", data);
      
      // Verificar si el mensaje ya existe para evitar duplicados
      setMessages((prev) => {
        const messageExists = prev.some(msg => 
          msg.id === data.id || 
          (msg.text === data.text && msg.name === data.name && Math.abs(new Date(msg.timestamp || 0) - new Date(data.timestamp || 0)) < 1000)
        );
        
        if (messageExists) {
          console.log("Message already exists, skipping:", data);
          return prev;
        }
        
        return [...prev, data];
      });
    };

    socket.on("messageResponse", handleMessageResponse);

    return () => {
      socket.off("messageResponse", handleMessageResponse);
    };
  }, [socket]);

  return { messages, setMessages };
};
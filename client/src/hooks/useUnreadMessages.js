import { useEffect, useState } from "react";
import { useSocketContext } from "../context/useSocketContext";

export const useUnreadMessages = () => {
  const { socket } = useSocketContext();
  const [unreadMessages, setUnreadMessages] = useState([]);

  useEffect(() => {
    if (!socket) return;

    const handleUnreadMessages = (messages) => {
      console.log("Received unread messages:", messages);
      setUnreadMessages(messages);
    };

    socket.on("unreadMessages", handleUnreadMessages);

    // Limpieza: eliminar el event listener
    return () => {
      socket.off("unreadMessages", handleUnreadMessages);
    };
  }, [socket]);

  return { unreadMessages, setUnreadMessages };
};

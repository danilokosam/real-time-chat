import { useState, useEffect } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "./useUsers";

export const usePrivateMessages = (selectedUser) => {
  const { socket } = useSocketContext();
  const { currentUserID } = useUsers();
  const [privateMessages, setPrivateMessages] = useState({});

  useEffect(() => {
    if (!socket) return;

    const handlePrivateMessage = ({
      id,
      content,
      from,
      fromUsername,
      to,
      timestamp,
      readBy,
      readAt,
    }) => {
      if (!currentUserID) return;

      const otherUserID = to === currentUserID ? from : to;
      const fromSelf = from === currentUserID;

      if (!otherUserID) return;

      setPrivateMessages((prev) => {
        const userMessages = prev[otherUserID] || [];
        
        // Verificar si el mensaje ya existe
        if (userMessages.some((msg) => msg.id === id)) {
          console.log("Private message already exists, skipping:", id);
          return prev;
        }

        console.log("Adding new private message:", { id, content, fromSelf, fromUsername });

        return {
          ...prev,
          [otherUserID]: [
            ...userMessages,
            { id, content, fromSelf, fromUsername, timestamp, readBy, readAt },
          ],
        };
      });
    };

    socket.on("privateMessage", handlePrivateMessage);

    return () => {
      socket.off("privateMessage", handlePrivateMessage);
    };
  }, [socket, currentUserID]);

  return { privateMessages, setPrivateMessages };
};
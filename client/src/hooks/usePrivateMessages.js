import { useEffect, useState } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "./useUsers";

export const usePrivateMessages = (selectedUser) => {
  const { socket } = useSocketContext();
  const { currentUserID } = useUsers();
  const [privateMessages, setPrivateMessages] = useState({});

  useEffect(() => {
    if (!socket || !currentUserID) return;

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
      console.log("Received privateMessage:", {
        id,
        content,
        from,
        fromUsername,
        to,
        timestamp,
        readBy,
        readAt,
      });

      const otherUserID = to === currentUserID ? from : to;
      const fromSelf = from === currentUserID;

      if (!otherUserID) {
        console.warn("Other user ID not available.");
        return;
      }

      setPrivateMessages((prev) => {
        const userMessages = prev[otherUserID] || [];
        if (userMessages.some((msg) => msg.id === id)) {
          console.log("Duplicate message ignored:", id);
          return prev;
        }
        return {
          ...prev,
          [otherUserID]: [
            ...userMessages,
            { id, content, fromSelf, fromUsername, timestamp, readBy, readAt },
          ],
        };
      });
    };

    const handleMessageRead = ({ messageID, readBy, readAt }) => {
      console.log("Received messageRead:", { messageID, readBy, readAt });
      setPrivateMessages((prev) => {
        const updatedMessages = { ...prev };
        Object.keys(updatedMessages).forEach((userID) => {
          updatedMessages[userID] = updatedMessages[userID].map((msg) =>
            msg.id === messageID ? { ...msg, readBy, readAt } : msg
          );
        });
        console.log(
          "Updated privateMessages with read status:",
          updatedMessages
        );
        return updatedMessages;
      });
    };

    socket.on("privateMessage", handlePrivateMessage);
    socket.on("messageRead", handleMessageRead);

    // Limpieza: eliminar los event listeners
    return () => {
      socket.off("privateMessage", handlePrivateMessage);
      socket.off("messageRead", handleMessageRead);
    };
  }, [socket, currentUserID, selectedUser]);

  return { privateMessages, setPrivateMessages };
};

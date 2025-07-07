import { useEffect, useState } from "react";
import { useSocketContext } from "../context/useSocketContext";

export const usePrivateMessages = (selectedUser, currentUserID) => {
  const { socket } = useSocketContext();
  const [privateMessages, setPrivateMessages] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!socket || !currentUserID || !selectedUser) return;

    console.log(
      "📡 Subscribed to privateMessage, messageRead & loadPrivateMessages"
    );

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
      console.log("📥 Received privateMessage:", {
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
        console.warn("⚠️ Other user ID not available.");
        return;
      }

      setPrivateMessages((prev) => {
        const userMessages = prev[otherUserID] || [];
        if (userMessages.some((msg) => msg.id === id)) {
          console.log("🔁 Duplicate privateMessage ignored:", id);
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
      console.log("📖 Received messageRead:", { messageID, readBy, readAt });
      setPrivateMessages((prev) => {
        const updatedMessages = { ...prev };
        Object.keys(updatedMessages).forEach((userID) => {
          updatedMessages[userID] = updatedMessages[userID].map((msg) =>
            msg.id === messageID ? { ...msg, readBy, readAt } : msg
          );
        });
        console.log("✅ Updated privateMessages with read status");
        return updatedMessages;
      });
    };

    const handleLoadPrivateMessages = ({ userID, messages }) => {
      console.log("📥 Loaded private messages:", messages);
      setPrivateMessages((prev) => ({
        ...prev,
        [userID]: messages.map((msg) => ({
          ...msg,
          fromSelf: msg.from === currentUserID,
        })),
      }));
      setLoading(false);
    };

    socket.on("privateMessage", handlePrivateMessage);
    socket.on("messageRead", handleMessageRead);
    socket.on("loadPrivateMessages", handleLoadPrivateMessages);

    // 👉 Emitir para cargar historial
    console.log(
      `📤 Requesting private messages: ${currentUserID} ⇄ ${selectedUser}`
    );
    socket.emit("getPrivateMessages", {
      from: currentUserID,
      to: selectedUser,
    });

    return () => {
      console.log(
        "🧹 Unsubscribed from privateMessage, messageRead & loadPrivateMessages"
      );
      socket.off("privateMessage", handlePrivateMessage);
      socket.off("messageRead", handleMessageRead);
      socket.off("loadPrivateMessages", handleLoadPrivateMessages);
    };
  }, [socket, currentUserID, selectedUser]);

  return { privateMessages, setPrivateMessages, loading };
};

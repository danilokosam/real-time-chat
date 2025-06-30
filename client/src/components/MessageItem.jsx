import { useEffect } from "react";
import { useInView } from "react-intersection-observer";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "../hooks/useUsers";

export const MessageItem = ({ message, userName, isPrivate, selectedUser }) => {
  const { socket } = useSocketContext();
  const { currentUserID } = useUsers();
  const { ref, inView } = useInView({
    triggerOnce: true, // Emitir solo una vez cuando el mensaje entra en la vista
    threshold: 0.5, // Emitir cuando el 50% del mensaje es visible
  });

  useEffect(() => {
    if (
      isPrivate &&
      inView &&
      !message.fromSelf &&
      (!message.readBy || !message.readBy.includes(currentUserID))
    ) {
      socket.emit("markMessageRead", {
        messageID: message.id,
        userID: currentUserID,
      });
    }
  }, [inView, isPrivate, message, currentUserID, socket]);

  const formatTimestamp = (timestamp) => {
    try {
      if (timestamp.includes("T")) {
        const date = new Date(timestamp);
        return date.toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        });
      }
      return timestamp;
    } catch (error) {
      console.error("Error formatting timestamp:", timestamp, error);
      return timestamp;
    }
  };

  const getSenderName = () => {
    if (isPrivate) {
      return message.fromSelf ? "You" : message.fromUsername;
    }
    return message.fromUsername === userName ? "You" : message.fromUsername;
  };

  const getMessageClass = () => {
    if (isPrivate) {
      return message.fromSelf ? "message__sender" : "message__recipient";
    }
    return message.fromUsername === userName
      ? "message__sender"
      : "message__recipient";
  };

  return (
    <div className="message__chats" ref={ref}>
      <p className="sender__name">{getSenderName()}</p>
      <div className={`${getMessageClass()} flex items-center gap-2`}>
        <p>{message.content}</p>
        {/* Read indicators for sent private messages */}
        {isPrivate && message.fromSelf && (
          <span
            className={`read-indicator ${
              message.readBy && message.readBy.includes(selectedUser?.userID)
                ? "text-blue-500"
                : "text-gray-500"
            } text-sm`}
            title={
              message.readBy && message.readBy.includes(selectedUser?.userID)
                ? "Read"
                : "Sent"
            }
          >
            {message.readBy && message.readBy.includes(selectedUser?.userID)
              ? "✔✔"
              : "✔"}
          </span>
        )}
        {/* Commented out readAt display for optional future use */}
        {/* <p className="message__readAt text-gray-400 text-xs">
          {message.readAt && `Read at ${formatTimestamp(message.readAt)}`}
        </p> */}
        <p className="message__timestamp text-gray-400 text-xs">
          {formatTimestamp(message.timestamp)}
        </p>
      </div>
    </div>
  );
};

import { useState, useEffect, useRef } from "react";
import { useSocketContext } from "../context/useSocketContext";
import { useUsers } from "../hooks/useUsers";
import { MessageForm } from "./MessageForm";
import { sendMessage, handleTyping } from "../utils/socketUtils";

export const ChatFooter = ({ selectedUser }) => {
  const { socket } = useSocketContext();
  const { currentUserID, userName } = useUsers();
  const [message, setMessage] = useState("");
  const typingTimeoutRef = useRef(null);
  const debouncedHandleTyping = useRef(null);

  useEffect(() => {
    console.log(
      "ChatFooter: currentUserID:",
      currentUserID,
      "selectedUser:",
      selectedUser
    );
  }, [currentUserID, selectedUser]);

  useEffect(() => {
    debouncedHandleTyping.current = handleTyping(
      socket,
      currentUserID,
      userName,
      selectedUser,
      typingTimeoutRef
    );

    const currentTimeout = typingTimeoutRef.current;

    return () => {
      debouncedHandleTyping.current.cancel();
      if (currentTimeout) {
        clearTimeout(currentTimeout);
      }
    };
  }, [socket, currentUserID, userName, selectedUser]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    sendMessage(
      socket,
      message,
      selectedUser,
      currentUserID,
      userName,
      setMessage
    );
  };

  if (!userName) {
    console.warn("No userName found");
    return <div className="error-message">Please log in to send messages</div>;
  }

  return (
    <MessageForm
      message={message}
      setMessage={setMessage}
      handleSendMessage={handleSendMessage}
      selectedUser={selectedUser}
      currentUserID={currentUserID}
      onTyping={debouncedHandleTyping.current}
    />
  );
};

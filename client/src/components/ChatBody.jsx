import { ChatHeader } from "./ChatHeader";
import { MessageList } from "./MessageList";
import { useMemo, useEffect } from "react";

export const ChatBody = ({
  messages,
  privateMessages,
  selectedUser,
  typingStatus,
  lastMessageRef,
  currentUserID,
}) => {
  const userName = localStorage.getItem("userName");

  useEffect(() => {
    if (!userName) {
      console.warn("⚠️ No userName found in localStorage");
    }
  }, [userName]);

  const handleLeaveChat = () => {
    localStorage.removeItem("userName");
    window.location.reload();
  };

  // Determinar mensajes a mostrar con mejor debugging
  const messagesToDisplay = useMemo(() => {
    console.log("=== ChatBody Debug Info ===");
    console.log("selectedUser:", selectedUser);
    console.log("privateMessages object:", privateMessages);
    console.log("public messages:", messages);
    console.log("currentUserID:", currentUserID);

    if (selectedUser) {
      // Para chat privado, usar el userID del usuario seleccionado como clave
      const userMessages = privateMessages[selectedUser.userID] || [];
      console.log(`Private messages for user ${selectedUser.username} (ID: ${selectedUser.userID}):`, userMessages);
      console.log("Number of private messages:", userMessages.length);
      return userMessages;
    } else {
      // Para chat público
      console.log("Public messages:", messages);
      console.log("Number of public messages:", messages.length);
      return messages;
    }
  }, [selectedUser, privateMessages, messages, currentUserID]);

  // Log adicional cuando cambian los mensajes
  useEffect(() => {
    console.log("=== Messages Updated ===");
    console.log("Chat type:", selectedUser ? "Private" : "Public");
    console.log("Messages to display:", messagesToDisplay);
    console.log("Message count:", messagesToDisplay.length);
    
    if (selectedUser) {
      console.log("All private message keys:", Object.keys(privateMessages));
      console.log(`Looking for messages with key: ${selectedUser.userID}`);
    }
  }, [messagesToDisplay, selectedUser, privateMessages]);

  // Log cuando se selecciona un usuario diferente
  useEffect(() => {
    if (selectedUser) {
      console.log("=== User Selected ===");
      console.log("Selected user:", selectedUser);
      console.log("Available private message keys:", Object.keys(privateMessages));
      console.log("Messages for this user:", privateMessages[selectedUser.userID] || []);
    }
  }, [selectedUser]);

  return (
    <>
      <ChatHeader
        selectedUser={selectedUser}
        handleLeaveChat={handleLeaveChat}
      />
      <MessageList
        messages={messagesToDisplay}
        userName={userName}
        isPrivate={!!selectedUser}
        selectedUser={selectedUser}
        currentUserID={currentUserID}
        lastMessageRef={lastMessageRef}
        typingStatus={typingStatus}
      />
    </>
  );
};
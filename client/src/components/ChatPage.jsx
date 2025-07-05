import { useEffect, useRef, useState } from "react";
import { ChatBar } from "./ChatBar";
import { ChatBody } from "./ChatBody";
import { ChatFooter } from "./ChatFooter";
import { useSocketContext } from "../context/useSocketContext";
import { useUserContext } from "../context/useUserContext";
import { useMessages } from "../hooks/useMessages";
import { usePrivateMessages } from "../hooks/usePrivateMessages";
import { useTyping } from "../hooks/useTyping";
import { useSocketError } from "../hooks/useSocketError";

export const ChatPage = () => {
  const { socket, connectionError, isLoggedIn } = useSocketContext();
  const { currentUserID, userName } = useUserContext(); // ✅ Ahora usamos UserContext
  const { messages } = useMessages();
  const [selectedUser, setSelectedUser] = useState(null);
  const { privateMessages } = usePrivateMessages(selectedUser);
  const { typingStatus } = useTyping(selectedUser);
  useSocketError();
  const lastMessageRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    console.log("Messages updated:", messages);
    console.log("Private messages updated:", privateMessages);
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, privateMessages]);

  // Render loading if not logged in or userName is missing
  if (!isLoggedIn || !userName) {
    return <div>Loading...</div>;
  }

  // Render connection error or connecting message
  if (!socket || !socket.connected) {
    return <div>{connectionError || "Connecting to chat..."}</div>;
  }

  return (
    <div className="chat">
      {connectionError && (
        <div className="connection-error">{connectionError}</div>
      )}
      <ChatBar setSelectedUser={setSelectedUser} />
      <div className="chat__main">
        <ChatBody
          messages={messages}
          privateMessages={privateMessages}
          selectedUser={selectedUser}
          typingStatus={typingStatus}
          lastMessageRef={lastMessageRef}
          currentUserID={currentUserID} // ✅ Pasamos el ID desde el contexto
        />
        <ChatFooter selectedUser={selectedUser} />
      </div>
    </div>
  );
};

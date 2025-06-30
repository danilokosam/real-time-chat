import { useEffect, useRef, useState } from "react";
import { ChatBar } from "./ChatBar";
import { ChatBody } from "./ChatBody";
import { ChatFooter } from "./ChatFooter";
import { useSocketContext } from "../context/useSocketContext";
import { useMessages } from "../hooks/useMessages";
import { usePrivateMessages } from "../hooks/usePrivateMessages";
import { useTyping } from "../hooks/useTyping";
import { useSocketError } from "../hooks/useSocketError";
import { useUsers } from "../hooks/useUsers";

export const ChatPage = () => {
  const { socket, connectionError } = useSocketContext();
  const { messages } = useMessages();
  const { currentUserID } = useUsers();
  const [selectedUser, setSelectedUser] = useState(null);
  const { privateMessages } = usePrivateMessages(selectedUser);
  const { typingStatus } = useTyping(selectedUser);
  useSocketError();
  const lastMessageRef = useRef(null);

  const result = useUsers();
  console.log(result);
  // Auto-scroll to latest message
  useEffect(() => {
    console.log("Messages updated:", messages);
    console.log("Private messages updated:", privateMessages);
    lastMessageRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, privateMessages]);

  // Render loading if socket isn't connected
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
          currentUserID={currentUserID}
        />
        <ChatFooter selectedUser={selectedUser} />
      </div>
    </div>
  );
};
